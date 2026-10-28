import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2
} from '@angular/core';
import {
  BehaviorSubject, debounceTime, fromEvent, Subject, Subscription
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryElement } from 'common/models/elements/geometry';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { PageChangeService } from 'common/services/page-change.service';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import {
  GeoGebraApi, GeoGebraAppletConstructor, GeoGebraAppletParameters
} from 'common/models/geogebra-interfaces';
import { ValueChangeElement } from 'common/models/input-element-interfaces';

declare const GGBApplet: GeoGebraAppletConstructor;

@Component({
  selector: 'aspect-geometry',
  templateUrl: './geometry.component.html',
  styleUrls: ['./geometry.component.scss'],
  standalone: false
})
export class GeometryComponent extends ElementComponent implements AfterViewInit, OnDestroy {
  @Input() elementModel!: GeometryElement;
  @Input() appDefinition: string | undefined;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  /** The tracked variables with the values GeoGebra computed on loading the applet, each time it loads,
   * the reset included. They can differ from the values stored in the unit, which are empty for variables
   * chosen with an editor before 2.11.0 (definition 4.10.0). */
  @Output() appletLoaded = new EventEmitter<GeometryVariable[]>();

  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isGeoGebraLoaded: boolean = false;
  geoGebraAPI!: GeoGebraApi;

  private ngUnsubscribe = new Subject<void>();
  private geometryUpdated = new Subject<void>(); // local subscription to be able to debounce
  private pageChangeSubscription: Subscription;
  private hasUserInteracted = false;
  /** Whether the user has edited the construction since the last report. Noted only once the user has
   * interacted: what GeoGebra does before that, on its own, is no work of the user's. */
  private isEditedSinceReport = false;
  /** How many applets the component has built. GeoGebra still reports an applet as loaded after a newer
   * one has replaced it; the number tells that report apart from the current applet's. */
  private appletCount = 0;
  /** Whether the current applet has loaded. Until it has, `geoGebraAPI` is the one of the applet it
   * replaced, which building the new one removed: GeoGebra throws "app was already removed" at every
   * call to it (#1625). */
  private isAppletLoaded = false;
  /** What the current applet was built with, to tell a change GeoGebra can apply to the running applet
   * from one that needs a new applet. */
  private appletParameters?: Omit<GeoGebraAppletParameters, 'appletOnLoad'>;
  /** A report that fell due while the applet was being replaced, sent once the new one has loaded. */
  private isReportDue = false;
  /** Whether the current applet has started up. GeoGebra calls the construction's own `ggbOnInit` just
   * before it reports the applet as loaded, and a script there can queue work for right afterwards, as
   * with `setTimeout(…, 0)`. Replacing the applet before that work has run removes the applet under the
   * script, which then fails with "app was already removed" (#1627). One round of timers after loading,
   * that work has run; work a script queues for later than that is not waited for. */
  private isAppletStartedUp = false;
  private startUpTimeout?: ReturnType<typeof setTimeout>;
  /** A new applet asked for while the current one was starting up, built once it has. */
  private isBuildDue = false;

  get timeoutMsg(): string {
    // eslint-disable-next-line max-len
    return `Failed to load geogebra element with alias "${this.elementModel.alias}" in time`;
  }

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private pageChangeService: PageChangeService,
              private externalResourceService: ExternalResourceService) {
    super(elementRef);
    this.externalResourceService.initializeGeoGebra(this.renderer);

    this.pageChangeSubscription = pageChangeService.pageChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.loadApplet());

    fromEvent(this.elementRef.nativeElement, 'pointerdown', { capture: true })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.hasUserInteracted = true;
        // Before GeoGebra handles the tap, so that a view it created after loading is covered as well.
        this.preventFocusScrolling();
      });
    fromEvent(this.elementRef.nativeElement, 'keydown', { capture: true })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.hasUserInteracted = true; });
    fromEvent(this.elementRef.nativeElement, 'wheel', { capture: true })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.hasUserInteracted = true; });

    this.geometryUpdated
      .pipe(debounceTime(100), takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.hasUserInteracted) {
          if (!this.isAppletLoaded) {
            this.isReportDue = true;
            return;
          }
          this.elementValueChanged.emit({
            id: this.elementModel.id,
            value: {
              appDefinition: this.geoGebraAPI.getBase64(),
              variables: this.getVariablesToEmit(),
              edited: this.isEditedSinceReport
            }
          });
        }
        this.isEditedSinceReport = false;
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadApplet());
  }

  private loadApplet(): void {
    if (document.contains(this.domElement)) {
      this.pageChangeSubscription.unsubscribe();
      this.externalResourceService.isGeoGebraLoaded()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((isGeoGebraLoaded: boolean) => {
          this.isGeoGebraLoaded = isGeoGebraLoaded;
          if (isGeoGebraLoaded) {
            this.initApplet();
          }
        });
    }
  }

  /**
   * Brings the applet up to the element after the editor changed one of its properties. A new applet is
   * built only when GeoGebra would be handed something else to build it with. A change of size alone is
   * applied to the running applet: building a new one removes the old, and a construction's own script
   * still due to run in the old one then fails on the removed applet -- on every step of the size
   * fields, until #1625.
   */
  refresh(): void {
    const parameters = this.getAppletParameters();
    const built = this.appletParameters;
    const needsNewApplet = !built || (Object.keys(parameters) as (keyof typeof parameters)[])
      .some(key => key !== 'width' && key !== 'height' && parameters[key] !== built[key]);
    if (needsNewApplet) {
      this.initApplet();
    } else {
      this.resizeApplet();
    }
  }

  reset(): void {
    this.appDefinition = this.elementModel.appDefinition;
    this.hasUserInteracted = true;
    this.isReportDue = true;
    this.initApplet();
  }

  /**
   * Gives the running applet the element's size. `deployggb.js` sizes the container and the
   * `applet_scaler` it puts around the applet when it builds one and leaves them alone afterwards; left
   * as they are, the container of a shrunk applet would reach beyond the element. An applet that has not
   * loaded yet takes the size once it has.
   */
  private resizeApplet(): void {
    if (!this.isAppletLoaded || !this.appletParameters) return;
    const { width, height } = this.getAppletParameters();
    if (width === this.appletParameters.width && height === this.appletParameters.height) return;
    this.geoGebraAPI.setSize(width, height);
    this.appletParameters = { ...this.appletParameters, width, height };
    const container = (this.elementRef.nativeElement as HTMLElement).querySelector('.geogebra-applet');
    [container, container?.querySelector('.applet_scaler')].forEach(element => {
      if (!element) return;
      this.renderer.setStyle(element, 'width', `${width}px`);
      this.renderer.setStyle(element, 'height', `${height}px`);
    });
  }

  private initApplet(): void {
    if (this.isAppletLoaded && !this.isAppletStartedUp) {
      this.isBuildDue = true;
      return;
    }
    this.isBuildDue = false;
    this.appletCount += 1;
    const appletNumber = this.appletCount;
    this.isAppletLoaded = false;
    this.isAppletStartedUp = false;
    this.appletParameters = this.getAppletParameters();
    const params: GeoGebraAppletParameters = {
      ...this.appletParameters,
      appletOnLoad: (geoGebraApi: GeoGebraApi) => {
        // Replaced before it had loaded, so no longer shown: neither its API nor its events are wanted.
        if (appletNumber !== this.appletCount) return;
        this.geoGebraAPI = geoGebraApi;
        this.isAppletLoaded = true;
        this.isLoaded.next(true);
        this.preventFocusScrolling();
        this.geoGebraAPI.registerAddListener(() => {
          this.noteEdit();
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerRemoveListener(() => {
          this.noteEdit();
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerUpdateListener((objectName: string) => {
          // Only an object the user can change counts: zooming recomputes what depends on the view, and
          // that never is one. Asked once per report -- a drag recomputes every dependent object.
          if (!this.isEditedSinceReport && this.geoGebraAPI.isMoveable(objectName)) this.noteEdit();
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerRenameListener(() => {
          this.noteEdit();
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerClearListener(() => {
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerClientListener(() => {
          this.geometryUpdated.next();
        });
        this.appletLoaded.emit(this.getVariablesToEmit());
        this.resizeApplet();
        if (this.isReportDue) {
          this.isReportDue = false;
          this.geometryUpdated.next();
        }
        // Set after ggbOnInit has queued its work, so it runs after that work.
        this.startUpTimeout = setTimeout(() => {
          this.isAppletStartedUp = true;
          if (this.isBuildDue) this.initApplet();
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    applet.inject(this.elementModel.id);
  }

  private getAppletParameters(): Omit<GeoGebraAppletParameters, 'appletOnLoad'> {
    return {
      id: this.elementModel.id,
      // must be smaller than the container, otherwise scroll bars will be displayed
      width: (this.elementModel.dimensions?.width || 180) - 4,
      height: (this.elementModel.dimensions?.height || 60) - 4,
      scale: 1,
      showToolBar: this.elementModel.showToolbar,
      enableShiftDragZoom: this.elementModel.enableShiftDragZoom,
      showZoomButtons: this.elementModel.showZoomButtons,
      showFullscreenButton: this.elementModel.showFullscreenButton,
      customToolBar: this.elementModel.customToolbar,
      enableUndoRedo: this.elementModel.enableUndoRedo,
      showResetIcon: false, // use custom html button icon
      showMenuBar: false,
      showAlgebraInput: this.elementModel.showAlgebraInput,
      enableLabelDrags: false,
      enableRightClick: false,
      showToolBarHelp: false,
      errorDialogsActive: true,
      showLogging: false,
      useBrowserForJS: false,
      // Unset, GeoGebra pins its keyboard to the bottom of the window unless a spreadsheet, CAS or
      // probability view, or under some conditions the algebra view, is shown. It stays in the section's
      // stacking context there, so every element after the section covers it (#1549).
      detachKeyboard: false,
      ggbBase64: this.appDefinition || this.elementModel.appDefinition
    };
  }

  /**
   * On every click or tap into the drawing, GeoGebra focuses its canvas and, for screen readers, a
   * one-pixel announcement element at the bottom of the applet. Neither call passes `preventScroll`, so
   * the browser scrolls both into view. GeoGebra restores the scroll position afterwards, but only that
   * of the document, while the page scrolls in a container of its own. An applet reaching below the
   * window would therefore move under the finger, and the second point of a segment land elsewhere
   * (#971). The same holds for the focus moves of GeoGebra's own keyboard navigation inside the applet;
   * tabbing into the applet is the browser's and scrolls as before.
   *
   * Applied once the applet has loaded and again on every pointerdown, which also covers a graphics
   * view GeoGebra adds later. `screenReaderStyle` is the class GeoGebra gives the announcement in the
   * version this repository ships.
   */
  private preventFocusScrolling(): void {
    (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('canvas, .screenReaderStyle')
      .forEach(element => {
        element.focus = (options?: FocusOptions) => {
          HTMLElement.prototype.focus.call(element, { ...options, preventScroll: true });
        };
      });
  }

  getGeometryObjects(): GeometryVariable[] {
    return this.geoGebraAPI.getAllObjectNames()
      .map((name: string) => ({ id: name, value: this.geoGebraAPI.getValueString(name) }));
  }

  private noteEdit(): void {
    if (this.hasUserInteracted) this.isEditedSinceReport = true;
  }

  private getVariablesToEmit(): GeometryVariable[] {
    return this.elementModel.getAllCleanedTrackedVariables()
      .map(variable => ({ id: variable.id, value: this.getVariableValue(variable.id) }));
  }

  private getVariableValue(name: string): string {
    return this.geoGebraAPI.getValueString(name);
  }

  ngOnDestroy(): void {
    clearTimeout(this.startUpTimeout);
    this.pageChangeSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

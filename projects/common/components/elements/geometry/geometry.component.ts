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
import { GeometryVariable, ReportedGeometryVariable } from 'common/models/geometry-interfaces';
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

  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isGeoGebraLoaded: boolean = false;
  geoGebraAPI!: GeoGebraApi;

  private ngUnsubscribe = new Subject<void>();
  private geometryUpdated = new Subject<void>(); // local subscription to be able to debounce
  private pageChangeSubscription: Subscription;
  private hasUserInteracted = false;
  /** The objects GeoGebra recomputed since the last report. Collected only once the user has
   * interacted: what GeoGebra recomputes before that, on its own, is no work of the user's. */
  private updatedObjectNames = new Set<string>();

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
          this.elementValueChanged.emit({
            id: this.elementModel.id,
            value: {
              appDefinition: this.geoGebraAPI.getBase64(),
              variables: this.getVariablesToEmit()
            }
          });
        }
        this.updatedObjectNames.clear();
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

  refresh(): void {
    this.initApplet();
  }

  reset(): void {
    this.appDefinition = this.elementModel.appDefinition;
    this.hasUserInteracted = true;
    this.initApplet();
    // needs time to reload
    setTimeout(() => {
      this.geometryUpdated.next();
    });
  }

  private initApplet(): void {
    const params: GeoGebraAppletParameters = {
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
      ggbBase64: this.appDefinition || this.elementModel.appDefinition,
      appletOnLoad: (geoGebraApi: GeoGebraApi) => {
        this.geoGebraAPI = geoGebraApi;
        this.isLoaded.next(true);
        this.preventFocusScrolling();
        this.geoGebraAPI.registerAddListener(() => {
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerRemoveListener(() => {
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerUpdateListener((objectName: string) => {
          if (this.hasUserInteracted) this.updatedObjectNames.add(objectName);
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerRenameListener(() => {
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerClearListener(() => {
          this.geometryUpdated.next();
        });
        this.geoGebraAPI.registerClientListener(() => {
          this.geometryUpdated.next();
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    applet.inject(this.elementModel.id);
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

  private getVariablesToEmit(): ReportedGeometryVariable[] {
    return this.elementModel.getAllCleanedTrackedVariables()
      .map(variable => ({
        id: variable.id,
        value: this.getVariableValue(variable.id),
        wasUpdated: this.elementModel.recomputedCountsAsChanged && this.updatedObjectNames.has(variable.id)
      }));
  }

  private getVariableValue(name: string): string {
    return this.geoGebraAPI.getValueString(name);
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

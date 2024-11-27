import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2
} from '@angular/core';
import {
  BehaviorSubject, debounceTime, Subject, Subscription
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { PageChangeService } from 'common/services/page-change.service';
import { ValueChangeElement } from 'common/interfaces';

declare const GGBApplet: any;

@Component({
  selector: 'aspect-geometry',
  template: `
    <button *ngIf="this.elementModel.showResetIcon"
            mat-stroked-button class="reset-button"
            (click)="reset()">
      <mat-icon class="reset-icon">autorenew</mat-icon>
      {{ 'geometry_reset' | translate }}
    </button>
    <div [id]="elementModel.id" class="geogebra-applet"></div>
    <aspect-spinner *ngIf="isGeoGebraLoaded" [isLoaded]="isLoaded"
                    (timeOut)="throwError('geometry-timeout', 'Failed to load geometry in time')">
    </aspect-spinner>
  `,
  styles: [
    ':host {display: block; width: 100%; height: 100%;}',
    ':host {position: relative;}',
    ':host .reset-icon {width: 1.5rem; height: 1.5rem; font-size: 1.5rem;}',
    '.reset-button {margin-bottom: 3px;}'
  ]
})
export class GeometryComponent extends ElementComponent implements AfterViewInit, OnDestroy {
  @Input() elementModel!: GeometryElement;
  @Input() appDefinition: string | undefined;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();

  isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isGeoGebraLoaded: boolean = false;
  geoGebraAPI!: any;

  private ngUnsubscribe = new Subject<void>();
  private geometryUpdated = new EventEmitter<void>(); // local subscription to be able to debounce
  private pageChangeSubscription: Subscription;

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private pageChangeService: PageChangeService,
              private externalResourceService: ExternalResourceService) {
    super(elementRef);
    this.externalResourceService.initializeGeoGebra(this.renderer);

    this.pageChangeSubscription = pageChangeService.pageChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.loadApplet());

    this.geometryUpdated
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.elementValueChanged.emit({
        id: this.elementModel.id,
        value: {
          appDefinition: this.geoGebraAPI.getBase64(),
          variables: this.elementModel.trackedVariables
            .map(variable => ({ id: variable, value: this.getVariableValue(variable) }))
        }
      }));
  }

  private getVariableValue(name: string): string {
    return this.geoGebraAPI.getValueString(name);
  }

  ngAfterViewInit(): void {
    this.loadApplet();
  }

  private loadApplet(): void {
    if (document.contains(this.domElement)) {
      this.pageChangeSubscription.unsubscribe();
      this.externalResourceService.isGeoGebraLoaded()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((isGeoGebraLoaded: boolean) => {
          this.isGeoGebraLoaded = isGeoGebraLoaded;
          if (isGeoGebraLoaded) this.initApplet();
        });
    }
  }

  refresh(): void {
    this.initApplet();
  }

  reset(): void {
    this.appDefinition = this.elementModel.appDefinition;
    this.initApplet();
    this.geometryUpdated.next();
  }

  private initApplet(): void {
    const params = {
      id: this.elementModel.id,
      width: (this.elementModel.dimensions?.width || 180) - 4, // must be smaller than the container, otherwise scroll bars will be displayed
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
      showAlgebraInput: false,
      enableLabelDrags: false,
      enableRightClick: false,
      showToolBarHelp: false,
      errorDialogsActive: true,
      showLogging: false,
      useBrowserForJS: false,
      ggbBase64: this.appDefinition || this.elementModel.appDefinition,
      appletOnLoad: (geoGebraApi: any) => {
        this.geoGebraAPI = geoGebraApi;
        this.isLoaded.next(true);
        this.geoGebraAPI.registerAddListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraAPI.registerRemoveListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraAPI.registerUpdateListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraAPI.registerRenameListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraAPI.registerClearListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraAPI.registerClientListener(() => {
          this.geometryUpdated.emit();
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    applet.inject(this.elementModel.id);
  }

  getGeometryObjects(): string[] {
    return this.geoGebraAPI.getAllObjectNames();
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

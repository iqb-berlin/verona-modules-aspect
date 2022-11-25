import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { ValueChangeElement } from 'common/models/elements/element';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { debounceTime, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare const GGBApplet: any;

@Component({
  selector: 'aspect-geometry',
  template: `
    <div class="geogebra-container">
      <div [id]="elementModel.id" class="geogebra-applet"></div>
      <button *ngIf="this.elementModel.showResetIcon"
              mat-icon-button
              class="reset-button"
              (click)="reset()">
        <mat-icon class="reset-icon">restart_alt</mat-icon>
      </button>
    </div>
    <aspect-spinner [isLoaded]="isLoaded"></aspect-spinner>
  `,
  styles: [
    ':host {display: block; width: 100%; height: 100%;}',
    '.geogebra-applet {margin: auto;}',
    '.geogebra-container {position: relative;}',
    '.reset-button {position: absolute; top: 0; right: 0; z-index: 100; margin: 5px;}',
    '.reset-icon {font-size: 30px !important;}'
  ]
})
export class GeometryComponent extends ElementComponent implements AfterViewInit, OnDestroy {
  @Input() elementModel!: GeometryElement;
  @Input() appDefinition!: string;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();

  isLoaded: Subject<boolean> = new Subject();
  geoGebraApi!: any;

  private ngUnsubscribe = new Subject<void>();
  private geometryUpdated = new EventEmitter<void>();

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private externalResourceService: ExternalResourceService) {
    super(elementRef);
    this.geometryUpdated
      .pipe(
        debounceTime(500),
        takeUntil(this.ngUnsubscribe)
      ).subscribe((): void => this.elementValueChanged
        .emit({
          id: this.elementModel.id,
          value: this.geoGebraApi.getBase64()
        }));
  }

  ngAfterViewInit(): void {
    this.externalResourceService.initializeGeoGebra(this.renderer);
    this.externalResourceService.isGeoGebraLoaded()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isLoaded: boolean) => {
        if (isLoaded) this.initApplet();
      });
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
    console.log('Initializing GeoGebra applet');
    if (!this.appDefinition) {
      console.error('Geogebra Applet definition not found.');
      return;
    }
    const params: any = {
      id: this.elementModel.id,
      width: this.elementModel.width,
      height: this.elementModel.height,
      showToolBar: this.elementModel.showToolbar,
      showResetIcon: false,
      enableShiftDragZoom: this.elementModel.enableShiftDragZoom,
      showZoomButtons: this.elementModel.showZoomButtons,
      showFullscreenButton: this.elementModel.showFullscreenButton,
      customToolBar: this.elementModel.customToolBar,
      enableUndoRedo: false,
      showMenuBar: false,
      showAlgebraInput: false,
      enableLabelDrags: false,
      enableRightClick: false,
      showToolBarHelp: false,
      errorDialogsActive: true,
      showLogging: false,
      useBrowserForJS: false,
      ggbBase64: this.appDefinition,
      appletOnLoad: (geoGebraApi: any) => {
        this.geoGebraApi = geoGebraApi;
        this.isLoaded.next(true);
        this.geoGebraApi.registerAddListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraApi.registerRemoveListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraApi.registerUpdateListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraApi.registerRenameListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraApi.registerClearListener(() => {
          this.geometryUpdated.emit();
        });
        this.geoGebraApi.registerStoreUndoListener(() => {
          this.geometryUpdated.emit();
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    // Needs timeout for loading new unit file in editor. For unknown reasons the component
    // does not get re-initialized.
    setTimeout(() => applet.inject(this.elementModel.id));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

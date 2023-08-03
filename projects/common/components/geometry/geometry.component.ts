import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2
} from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { ValueChangeElement } from 'common/models/elements/element';
import { PageChangeService } from 'common/services/page-change.service';

declare const GGBApplet: any;

@Component({
  selector: 'aspect-geometry',
  template: `
    <div class="geogebra-container"
         [style.height.px]="elementModel.height"
         [style.width.px]="elementModel.width"
         [class.center]="this.elementModel.dimensions.isWidthFixed">
      <div [id]="elementModel.id"  class="geogebra-applet"></div>
      <button *ngIf="this.elementModel.showResetIcon"
              mat-icon-button
              [style.top.px]="this.elementModel.showToolbar ? 50 : 0"
              class="reset-button"
              (click)="reset()">
        <mat-icon class="reset-icon">restart_alt</mat-icon>
      </button>
    </div>
    <aspect-spinner [isLoaded]="isLoaded"></aspect-spinner>
  `,
  styles: [
    ':host {display: block; width: 100%; height: 100%;}',
    '.geogebra-container {position: relative;}',
    '.center {margin: auto;}',
    '.reset-button {position: absolute; right: 0; z-index: 100; margin: 5px;}',
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
  private pageChangeSubscription: Subscription;

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private pageChangeService: PageChangeService,
              private externalResourceService: ExternalResourceService) {
    super(elementRef);
    this.externalResourceService.initializeGeoGebra(this.renderer);
    this.pageChangeSubscription = pageChangeService.pageChanged.subscribe(() => this.loadApplet());
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
    this.loadApplet();
  }

  private loadApplet(): void {
    if (document.contains(this.domElement)) {
      this.pageChangeSubscription.unsubscribe();
      this.externalResourceService.isGeoGebraLoaded()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((isLoaded: boolean) => {
          if (isLoaded) this.initApplet();
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
    if (!this.appDefinition) {
      console.error('Geogebra Applet definition not found.');
      return;
    }
    const params: any = {
      id: this.elementModel.id,
      width: this.elementModel.dimensions.width - 4, // must be smaller than the container, otherwise scroll bars will be displayed
      height: this.elementModel.dimensions.height - 4,
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
        this.geoGebraApi.registerClientListener(() => {
          this.geometryUpdated.emit();
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    applet.inject(this.elementModel.id);
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

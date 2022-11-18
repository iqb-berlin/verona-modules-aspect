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
    <div [id]="elementModel.id" class="geogebra-applet"></div>
    <aspect-spinner [isLoaded]="isLoaded"></aspect-spinner>
  `,
  styles: [
    ':host {display: block; width: 100%; height: 100%;}',
    '.geogebra-applet {margin: auto;}'
  ]
})
export class GeometryComponent extends ElementComponent implements AfterViewInit, OnDestroy {
  @Input() elementModel!: GeometryElement;
  @Input() appDefinition!: string;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();

  isLoaded: Subject<boolean> = new Subject();

  private ngUnsubscribe = new Subject<void>();
  private geometryUpdated = new EventEmitter<any>();

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private externalResourceService: ExternalResourceService) {
    super(elementRef);
    this.geometryUpdated
      .pipe(
        debounceTime(500),
        takeUntil(this.ngUnsubscribe)
      ).subscribe((api): void => this.elementValueChanged
        .emit({
          id: this.elementModel.id,
          value: api.getBase64()
        }));
  }

  ngAfterViewInit(): void {
    this.externalResourceService.initializeGeoGebra(this.renderer);
    this.externalResourceService.isGeoGebraLoaded().subscribe((isLoaded: boolean) => {
      if (isLoaded) this.initApplet();
    });
  }

  refresh(): void {
    this.initApplet();
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
      showResetIcon: this.elementModel.showResetIcon,
      enableShiftDragZoom: this.elementModel.enableShiftDragZoom,
      showZoomButtons: this.elementModel.showZoomButtons,
      showFullscreenButton: this.elementModel.showFullscreenButton,
      customToolBar: this.elementModel.customToolBar,
      showMenuBar: false,
      showAlgebraInput: false,
      enableLabelDrags: false,
      enableRightClick: false,
      showToolBarHelp: false,
      errorDialogsActive: true,
      showLogging: false,
      useBrowserForJS: false,
      ggbBase64: this.appDefinition,
      appletOnLoad: (api: any) => {
        this.isLoaded.next(true);
        api.registerAddListener(() => {
          this.geometryUpdated.emit(api);
        });
        api.registerRemoveListener(() => {
          this.geometryUpdated.emit(api);
        });
        api.registerUpdateListener(() => {
          this.geometryUpdated.emit(api);
        });
        api.registerRenameListener(() => {
          this.geometryUpdated.emit(api);
        });
        api.registerClearListener(() => {
          this.geometryUpdated.emit(api);
        });
        api.registerStoreUndoListener(() => {
          this.geometryUpdated.emit(api);
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

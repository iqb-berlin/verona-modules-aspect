import {
  AfterViewInit, Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { ValueChangeElement } from 'common/models/elements/element';

declare const GGBApplet: any;

@Component({
  selector: 'aspect-geometry',
  template: `
    <div [id]="elementModel.id" class="geogebra-applet"></div>
  `,
  styles: [
    ':host {display: block; width: 100%; height: 100%;}',
    '.geogebra-applet {margin: auto;}'
  ]
})
export class GeometryComponent extends ElementComponent implements AfterViewInit {
  @Input() elementModel!: GeometryElement;
  @Input() appDefinition!: string;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();

  ngAfterViewInit(): void {
    this.externalResourceService.initializeGeoGebra(this.renderer);
    this.externalResourceService.isGeoGebraLoaded().subscribe((isLoaded: boolean) => {
      if (isLoaded) this.initApplet();
    });
  }

  refresh() {
    this.initApplet();
  }

  initApplet(): void {
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
        api.registerUpdateListener(() => {
          this.elementValueChanged.emit({
            id: this.elementModel.id,
            value: api.getBase64()
          });
        });
      }
    };
    const applet = new GGBApplet(params, '5.0');
    applet.setHTML5Codebase(this.externalResourceService.getGeoGebraHTML5URL());
    // Needs timeout for loading new unit file in editor. For unknown reasons the component
    // does not get re-initialized.
    setTimeout(() => applet.inject(this.elementModel.id));
  }
}

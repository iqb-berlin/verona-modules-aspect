import {
  Component, OnInit,
  EventEmitter, Input, Output,
  ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import { CanvasElementComponent } from '../../../../../../../common/canvas-element-component.directive';
import { LabelComponent } from '../../../../../../../common/element-components/label.component';
import { ButtonComponent } from '../../../../../../../common/element-components/button.component';
import { TextFieldComponent } from '../../../../../../../common/element-components/text-field.component';
import { CheckboxComponent } from '../../../../../../../common/element-components/checkbox.component';
import { DropdownComponent } from '../../../../../../../common/element-components/dropdown.component';
import { RadioButtonGroupComponent } from '../../../../../../../common/element-components/radio-button-group.component';
import { ImageComponent } from '../../../../../../../common/element-components/image.component';
import { AudioComponent } from '../../../../../../../common/element-components/audio.component';
import { VideoComponent } from '../../../../../../../common/element-components/video.component';
import { CorrectionComponent } from '../../../../../../../common/element-components/compound-components/correction.component';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <ng-template #elementContainer></ng-template>
    `
})
export class CanvasSectionComponent implements OnInit {
  @Input() section!: UnitPageSection;
  @Input() manualPositioning: boolean = false;
  @Output() elementSelected = new EventEmitter<{ componentElement: CanvasElementComponent, multiSelect: boolean }>();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  private canvasComponents: CanvasElementComponent[] = [];

  constructor(public unitService: UnitService,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.renderSection();
  }

  renderSection(): void {
    this.canvasComponents = [];
    this.elementContainer.clear();
    this.section.elements.forEach((element: UnitUIElement) => {
      this.createCanvasElement(element);
    });
  }

  updateElementStyles(): void {
    this.canvasComponents.forEach((component: CanvasElementComponent) => {
      component.updateStyle();
    });
  }

  updateSelection(selectedElements: UnitUIElement[]): void {
    this.canvasComponents.forEach((component: CanvasElementComponent) => {
      selectedElements.forEach((selectedElement: UnitUIElement) => {
        if (component.elementModel === selectedElement) {
          component.selected = true;
        }
      });
    });
  }

  clearSelection(): void {
    this.canvasComponents.forEach((canvasComponent: CanvasElementComponent) => {
      canvasComponent.selected = false;
    });
  }

  private createCanvasElement(element: UnitUIElement): void {
    const componentFactory = this.getComponentFactory(element);
    const componentRef = this.elementContainer.createComponent(componentFactory);
    componentRef.instance.elementModel = element;
    componentRef.instance.draggable = this.manualPositioning;
    componentRef.instance.updateStyle();

    componentRef.instance.elementSelected.subscribe(
      (event: { componentElement: CanvasElementComponent, multiSelect: boolean }) => {
        this.elementSelected.emit(event);
      }
    );
    this.canvasComponents.push(componentRef.instance);
  }

  private getComponentFactory(element: UnitUIElement) {
    switch (element.type) {
      case 'label':
        return this.componentFactoryResolver.resolveComponentFactory(LabelComponent);
      case 'button':
        return this.componentFactoryResolver.resolveComponentFactory(ButtonComponent);
      case 'text-field':
        return this.componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
      case 'checkbox':
        return this.componentFactoryResolver.resolveComponentFactory(CheckboxComponent);
      case 'dropdown':
        return this.componentFactoryResolver.resolveComponentFactory(DropdownComponent);
      case 'radio':
        return this.componentFactoryResolver.resolveComponentFactory(RadioButtonGroupComponent);
      case 'image':
        return this.componentFactoryResolver.resolveComponentFactory(ImageComponent);
      case 'audio':
        return this.componentFactoryResolver.resolveComponentFactory(AudioComponent);
      case 'video':
        return this.componentFactoryResolver.resolveComponentFactory(VideoComponent);
      case 'correction':
        return this.componentFactoryResolver.resolveComponentFactory(CorrectionComponent);
      default:
        throw new Error('unknown element');
    }
  }
}

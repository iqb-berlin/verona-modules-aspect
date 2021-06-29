import {
  Component, OnInit, Input, Output,
  EventEmitter,
  ComponentFactory, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitUIElement } from '../../../../../../../common/unit';
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
import { CanvasElementComponent } from '../../../../../../../common/canvas-element-component.directive';

@Component({
  selector: 'app-canvas-drag-overlay',
  template: `
    <div cdkDrag [cdkDragData]="this.element" (click)="click($event)"
         [ngStyle]="style">
      <ng-template #elementContainer></ng-template>
    </div>
    `,
  styles: [
    'div {position: absolute}'
  ]
})
export class CanvasDragOverlayComponent implements OnInit {
  @Input() element!: UnitUIElement;
  @Output() elementSelected = new EventEmitter<{
    componentElement: CanvasDragOverlayComponent,
    multiSelect: boolean }>();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  private childComponent!: CanvasElementComponent;
  _selected = false;
  style: Record<string, string> = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.updateStyle();
    const componentFactory = this.getComponentFactory(this.element.type);
    this.childComponent = this.elementContainer.createComponent(componentFactory).instance;
    this.childComponent.elementModel = this.element;
  }

  set selected(newValue: boolean) {
    this._selected = newValue;
    this.updateStyle();
  }

  updateStyle(): void {
    this.style = {
      border: this._selected ? '5px solid' : '',
      width: `${this.element.width}px`,
      height: `${this.element.height}px`,
      left: `${this.element.xPosition.toString()}px`,
      top: `${this.element.yPosition.toString()}px`
    };
    this.childComponent?.updateStyle();
  }

  click(event: MouseEvent): void {
    if (event.shiftKey) {
      this.elementSelected.emit({
        componentElement: this, multiSelect: true
      });
    } else {
      this.elementSelected.emit({
        componentElement: this, multiSelect: false
      });
    }
  }

  private getComponentFactory(elementType: string): ComponentFactory<CanvasElementComponent> {
    switch (elementType) {
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

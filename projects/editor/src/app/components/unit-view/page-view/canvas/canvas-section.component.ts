import {
  Component, OnInit,
  EventEmitter, Input, Output,
  ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import { CanvasDragOverlayComponent } from './canvas-drag-overlay.component';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <ng-template #elementContainer></ng-template>
    `
})
export class CanvasSectionComponent implements OnInit {
  @Input() section!: UnitPageSection;
  @Output() elementSelected = new EventEmitter<{ componentElement: CanvasDragOverlayComponent, multiSelect: boolean }>();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  private canvasComponents: CanvasDragOverlayComponent[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

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

  updateSelection(selectedElements: UnitUIElement[]): void {
    this.canvasComponents.forEach((component: CanvasDragOverlayComponent) => {
      selectedElements.forEach((selectedElement: UnitUIElement) => {
        if (component.element === selectedElement) {
          component.setSelected(true);
        }
      });
    });
  }

  clearSelection(): void {
    this.canvasComponents.forEach((canvasComponent: CanvasDragOverlayComponent) => {
      canvasComponent.setSelected(false);
    });
  }

  private createCanvasElement(element: UnitUIElement): void {
    const overlayFactory = this.componentFactoryResolver.resolveComponentFactory(CanvasDragOverlayComponent);
    const overlayRef = this.elementContainer.createComponent(overlayFactory);
    overlayRef.instance.element = element;

    overlayRef.instance.elementSelected.subscribe(
      (event: { componentElement: CanvasDragOverlayComponent, multiSelect: boolean }) => {
        this.elementSelected.emit(event);
      }
    );
    this.canvasComponents.push(overlayRef.instance);
  }
}

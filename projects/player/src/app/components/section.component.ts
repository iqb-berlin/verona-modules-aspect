import {
  Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitPageSection, UnitUIElement } from '../../../../common/unit';
import { ElementOverlayComponent } from './element-overlay.component';

@Component({
  selector: 'app-section',
  template: `
    <ng-template #elementContainer></ng-template>
  `
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() section!: UnitPageSection;
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.renderSection();
  }

  private renderSection() {
    this.section.elements.forEach((element: UnitUIElement) => {
      this.createSectionElement(element);
    });
  }

  private createSectionElement(element: UnitUIElement): void {
    const overlayFactory: ComponentFactory<ElementOverlayComponent> =
      this.componentFactoryResolver.resolveComponentFactory(ElementOverlayComponent);
    const overlayRef: ComponentRef<ElementOverlayComponent> =
      this.elementContainer.createComponent(overlayFactory);
    overlayRef.instance.elementModel = element;
    overlayRef.instance.parentForm = this.parentForm;
  }
}

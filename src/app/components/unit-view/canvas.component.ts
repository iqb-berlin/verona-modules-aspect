import {
  Component, ComponentFactoryResolver, ElementRef, Input, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ButtonElement, LabelElement, TextFieldElement, UnitPage, UnitUIElement
} from '../../model/unit';
import { ButtonComponent } from './unit-view-components/button.component';
import { UnitService } from '../../unit.service';
import { LabelComponent } from './unit-view-components/label.component';
import { TextFieldComponent } from './unit-view-components/text-field.component';

@Component({
  selector: 'app-unit-view-canvas',
  template: `
    <div #canvas
         class="elementCanvas"
         [style.width.px]="page.width"
         [style.height.px]="page.height"
         [style.background-color]="page.backgroundColor">
      <template #elementContainer></template>
    </div>
    `
})
export class UnitCanvasComponent implements OnDestroy {
  @Input() page!: UnitPage;

  @ViewChild('canvas') canvas!: ElementRef;
  @ViewChild('elementContainer', { read: ViewContainerRef }) elementContainer: any;

  newElementSubscription: Subscription;
  pageSelectedSubscription: Subscription;

  constructor(public unitService: UnitService, private componentFactoryResolver: ComponentFactoryResolver) {
    this.newElementSubscription = this.unitService.newElement.subscribe(elementType => {
      this.addElement(elementType);
    });
    this.pageSelectedSubscription = this.unitService.pageSelected.subscribe(() => {
      this.clearElements();
      this.renderPage(this.unitService.getActivePage());
    });
  }

  private renderPage(activePage: UnitPage) {
    for (const element of activePage.elements) {
      this.addElement(element);
    }
  }

  addElement(element: UnitUIElement): void {
    let componentFactory;
    if (element instanceof LabelElement) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(LabelComponent);
    } else if (element instanceof ButtonElement) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(ButtonComponent);
    } else if (element instanceof TextFieldElement) {
      componentFactory = this.componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
    } else {
      console.error('unknown element: ', element);
      return;
    }
    const componentRef = this.elementContainer.createComponent(componentFactory);
    componentRef.instance.element = element;
    componentRef.instance.canvasSize = [this.page.width, this.page.height];
    componentRef.instance.elementSelected.subscribe((event: { element: UnitUIElement | undefined; }) => {
      this.unitService.elementSelected.next(event.element);
    });
  }

  private clearElements() {
    this.elementContainer.clear();
  }

  ngOnDestroy(): void {
    this.newElementSubscription.unsubscribe();
    this.pageSelectedSubscription.unsubscribe();
  }
}

import {
  Component, ComponentFactoryResolver, Input, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ButtonElement, LabelElement, TextFieldElement, UnitPage, UnitUIElement
} from '../../model/unit';
import { ButtonComponent } from './unit-view-components/button.component';
import { UnitService } from '../../unit.service';
import { LabelComponent } from './unit-view-components/label.component';
import { TextFieldComponent } from './unit-view-components/text-field.component';
import { ElementComponent } from './element.component';

@Component({
  selector: 'app-unit-view-canvas',
  template: `
    <app-canvas-toolbar></app-canvas-toolbar>
    <div class="canvasFrame" fxLayoutAlign="center center">
      <div class="elementCanvas"
           [style.width.px]="page.width"
           [style.height.px]="page.height"
           [style.background-color]="page.backgroundColor">
        <ng-template #elementContainer></ng-template>
      </div>
    </div>
    `,
  styles: [
    '.canvasFrame {background-color: lightgrey; padding: 15px}'
  ]
})
export class UnitCanvasComponent implements OnDestroy {
  @Input() page!: UnitPage;
  @ViewChild('elementContainer', { read: ViewContainerRef }) elementContainer: any;

  newElementSubscription: Subscription;
  pageSelectedSubscription: Subscription;
  propertyChangeSubscription: Subscription;

  selectedElements: ElementComponent[];

  constructor(public unitService: UnitService, private componentFactoryResolver: ComponentFactoryResolver) {
    this.newElementSubscription = this.unitService.newElement.subscribe(elementType => {
      this.addElement(elementType);
    });
    this.pageSelectedSubscription = this.unitService.pageSelected.subscribe((page: UnitPage) => {
      this.selectedElements = [];
      this.page = page;
      this.renderPage();
    });
    this.propertyChangeSubscription = this.unitService.propertyChanged.subscribe(() => {
      this.selectedElements.forEach(element => {
        element.updateStyle();
      });
    });
    this.selectedElements = [];
  }

  private renderPage() {
    this.elementContainer.clear();
    for (const element of this.page.elements) {
      this.addElement(element);
    }
  }

  addElement(element: UnitUIElement): void {
    const componentFactory = this.getComponentFactory(element);
    const componentRef = this.elementContainer.createComponent(componentFactory);
    componentRef.instance.elementModel = element;
    componentRef.instance.canvasSize = [this.page.width, this.page.height];

    this.clearSelection();
    componentRef.instance.selected = true;
    this.selectedElements.push(componentRef.instance);
    this.unitService.elementSelected.next(componentRef.instance.elementModel);

    componentRef.instance.elementSelected.subscribe((event: { componentElement: ElementComponent, multiSelect: boolean }) => {
      if (event.multiSelect) {
        this.unitService.elementSelected.next(undefined); // clear properties panel, because selection is dubious
      } else {
        this.clearSelection();
        this.unitService.elementSelected.next(event.componentElement.elementModel);
      }
      this.selectedElements.push(event.componentElement);
      event.componentElement.selected = true;
    });
  }

  private clearSelection() {
    for (const element of this.selectedElements) {
      element.selected = false;
    }
    this.selectedElements = [];
    this.unitService.elementSelected.next(undefined);
  }

  }

  ngOnDestroy(): void {
    this.newElementSubscription.unsubscribe();
    this.pageSelectedSubscription.unsubscribe();
    this.propertyChangeSubscription.unsubscribe();
  }

  private getComponentFactory(element: UnitUIElement) {
    if (element instanceof LabelElement) {
      return this.componentFactoryResolver.resolveComponentFactory(LabelComponent);
    }
    if (element instanceof ButtonElement) {
      return this.componentFactoryResolver.resolveComponentFactory(ButtonComponent);
    }
    if (element instanceof TextFieldElement) {
      return this.componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
    }
    console.error('unknown element: ', element);
    throw new Error('unknown element'); // TODO test
  }
}

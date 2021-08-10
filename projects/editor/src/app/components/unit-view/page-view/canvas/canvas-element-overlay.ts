import {
  Directive, Input,
  ComponentFactoryResolver, ComponentRef,
  HostListener,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// eslint-disable-next-line import/no-cycle
import { UnitService } from '../../../../unit.service';
import { UnitUIElement } from '../../../../../../../common/unit';
import * as ComponentUtils from '../../../../../../../common/component-utils';
import { FormElementComponent } from '../../../../../../../common/form-element-component.directive';
import { ValueChangeElement } from '../../../../../../../common/form';
import { ElementComponent } from '../../../../../../../common/element-component.directive';

@Directive()
export abstract class CanvasElementOverlay {
  @Input() element!: UnitUIElement;
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  selected = false;
  protected childComponent!: ComponentRef<ElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  constructor(protected unitService: UnitService,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory);
    this.childComponent.instance.elementModel = this.element;

    if (this.childComponent.instance instanceof FormElementComponent) {
      this.childComponent.instance.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitService.updateSelectedElementProperty('value', changeElement.values[1]);
        });

      this.unitService.elementPropertyUpdated
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          (this.childComponent.instance as FormElementComponent).updateFormValue(
            this.element.value as string | number | boolean | undefined
          );
        });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!(event.target as Element).tagName.includes('input'.toUpperCase()) &&
      !(event.target as Element).tagName.includes('textarea'.toUpperCase()) &&
      event.key === 'Delete') {
      this.unitService.deleteSelectedElements();
    }
  }

  setSelected(newValue: boolean): void {
    this.selected = newValue;
  }

  click(event: MouseEvent): void {
    if (event.shiftKey) {
      this.unitService.selectElement({ componentElement: this, multiSelect: true });
    } else {
      this.unitService.selectElement({ componentElement: this, multiSelect: false });
    }
  }

  openEditDialog(): void {
    this.unitService.showDefaultEditDialog(this.element);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import {
  Directive, Input,
  ComponentFactoryResolver, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../unit.service';
import * as ElementFactory from '../../../../../../common/util/element.factory';
import { FormElementComponent } from '../../../../../../common/form-element-component.directive';
import { ElementComponent } from '../../../../../../common/element-component.directive';
import { SelectionService } from '../../../selection.service';
import { InputElement, UIElement, ValueChangeElement } from '../../../../../../common/models/uI-element';

@Directive()
export abstract class CanvasElementOverlay implements OnInit, OnDestroy {
  @Input() element!: UIElement;
  @Input() viewMode: boolean = false;
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  isSelected = false;
  protected childComponent!: ComponentRef<ElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              protected unitService: UnitService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    const componentFactory = ElementFactory.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory);
    this.childComponent.instance.elementModel = this.element;

    // Make children not clickable. This way the only relevant events are managed by the overlay.
    this.childComponent.location.nativeElement.style.pointerEvents = 'none';

    this.selectionService.selectElement({ componentElement: this, multiSelect: false });

    if (this.childComponent.instance instanceof FormElementComponent) {
      this.childComponent.instance.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitService.updateElementProperty([this.element], 'value', changeElement.values[1]);
        });

      this.unitService.elementPropertyUpdated
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          (this.childComponent.instance as FormElementComponent).updateFormValue(
            (this.element as InputElement).value as string | number | boolean | null
          );
        });
    }
  }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    // This avoids: "NG0100: Expression has changed after it was checked"
    // The selection service may change the "selected" variable after onInit has run.
    // Therefore we need to run it again after this.
    this.changeDetectorRef.detectChanges();
  }

  selectElement(multiSelect: boolean = false): void {
    if (multiSelect) {
      this.selectionService.selectElement({ componentElement: this, multiSelect: true });
    } else {
      this.selectionService.selectElement({ componentElement: this, multiSelect: false });
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

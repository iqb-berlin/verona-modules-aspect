import {
  Directive, Input,
  ComponentFactoryResolver, ComponentRef,
  HostListener,
  ViewChild, ViewContainerRef, OnInit, AfterViewInit, OnDestroy
} from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import * as ComponentUtils from '../../../../../../../common/component-utils';
import { FormElementComponent } from '../../../../../../../common/form-element-component.directive';
import { ValueChangeElement } from '../../../../../../../common/form';
import { ElementComponent } from '../../../../../../../common/element-component.directive';
import { SelectionService } from '../../../../selection.service';

@Directive()
export abstract class CanvasElementOverlay implements OnInit, OnDestroy {
  @Input() element!: UnitUIElement;
  @Input() viewMode: boolean = false;
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  selected = false;
  protected childComponent!: ComponentRef<ElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              protected unitService: UnitService,
              private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    const componentFactory = ComponentUtils.getComponentFactory(this.element.type, this.componentFactoryResolver);
    this.childComponent = this.elementContainer.createComponent(componentFactory);
    this.childComponent.instance.elementModel = this.element;

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
      forkJoin([
        this.selectionService.selectedElements.pipe(take(1)),
        this.selectionService.selectedPageSection.pipe(take(1))
      ])
        .subscribe((results: [UnitUIElement[], UnitPageSection]) => {
          this.unitService.deleteElementsFromSection(results[0], results[1]);
          this.selectionService.clearElementSelection();
        })
        .unsubscribe();
    }
  }

  setSelected(newValue: boolean): void {
    this.selected = newValue;
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

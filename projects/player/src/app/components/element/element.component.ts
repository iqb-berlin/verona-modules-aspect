import {
  Component, OnInit, Input, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as ComponentUtils from '../../../../../common/component-utils';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../../../../common/form.service';
import { ValueChangeElement } from '../../../../../common/form';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import { UIElement } from '../../../../../common/classes/uI-element';

@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.css']
})
export class ElementComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;

  isKeyboardOpen!: boolean;

  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(public keyboardService: KeyboardService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private formService: FormService,
              private unitStateService: UnitStateService,
              private formBuilder: FormBuilder,
              private markingService: MarkingService) {
  }

  ngOnInit(): void {
    const elementComponentFactory =
      ComponentUtils.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;

    const unitStateElementCode = this.unitStateService.getUnitStateElement(this.elementModel.id);
    if (unitStateElementCode) {
      if (this.elementModel.type === 'text') {
        elementComponent.elementModel.text = unitStateElementCode.value;
      } else {
        elementComponent.elementModel.value = unitStateElementCode.value;
      }
    }

    this.unitStateService.registerElement(elementComponent.elementModel);

    if (elementComponent.onFocusin) {
      elementComponent.onFocusin
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.unitStateService.changeElementStatus({ id: this.elementModel.id, status: 'TOUCHED' });
        });
    }

    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selection: { color: string; element: HTMLElement; clear: boolean }) => {
          this.unitStateService.changeElementStatus({ id: this.elementModel.id, status: 'TOUCHED' });
          this.applySelection(selection.color, selection.element, selection.clear);
        });
    }

    if (Object.prototype.hasOwnProperty.call(this.elementModel, 'required')) {
      const elementForm = this.formBuilder.group({});
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);

      elementComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitStateService.changeElementValue(changeElement);
        });

      if (this.keyboardService.isActive &&
        (this.elementModel.type === 'text-field' || this.elementModel.type === 'text-area')) {
        this.initEventsForKeyboard(elementComponent);
      }
    } // no else
  }

  private registerFormGroup(elementForm: FormGroup): void {
    this.formService.registerFormGroup({
      formGroup: elementForm,
      parentForm: this.parentForm,
      parentArray: 'elements',
      parentArrayIndex: this.parentArrayIndex
    });
  }

  private initEventsForKeyboard(elementComponent: TextFieldComponent | TextAreaComponent): void {
    elementComponent.onFocus
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((focussedInputControl: HTMLElement): void => {
        const inputElement = this.elementModel.type === 'text-area' ?
          focussedInputControl as HTMLTextAreaElement :
          focussedInputControl as HTMLInputElement;
        this.isKeyboardOpen = this.keyboardService.openKeyboard(inputElement);
      });

    elementComponent.onBlur
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => {
        this.isKeyboardOpen = this.keyboardService.closeKeyboard();
      });
  }

  private applySelection(color: string, element: HTMLElement, clear: boolean): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (this.isDescendantOf(range.startContainer, element) &&
        this.isDescendantOf(range.endContainer, element)) {
        this.markingService.applySelection(range, selection, clear, color);
        this.unitStateService.changeElementValue({
          id: this.elementModel.id,
          values: [this.elementModel.text as string, element.innerHTML]
        });
        this.elementModel.text = element.innerHTML;
      }
      selection.removeRange(range);
    } // nothing to do!
  }

  private isDescendantOf(node: Node | null, element: HTMLElement): boolean {
    if (!node || node === document) {
      return false;
    }
    if (node.parentElement === element) {
      return true;
    }
    return this.isDescendantOf(node.parentNode, element);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

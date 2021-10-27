import {
  Component, OnInit, Input, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as ElementFactory from '../../../../../common/util/element.factory';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../../../../common/form.service';
import { ValueChangeElement } from '../../../../../common/form';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import { InputElementValue, UIElement } from '../../../../../common/models/uI-element';
import { TextFieldElement } from '../../../../../common/models/text-field-element';
import { FormElementComponent } from '../../../../../common/form-element-component.directive';

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
  keyboardLayout!: 'french' | 'numbers' | 'numbersAndOperators' | 'none';

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
      ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;

    const unitStateElementCode = this.unitStateService.getUnitStateElement(this.elementModel.id);
    if (unitStateElementCode && unitStateElementCode.value !== undefined) {
      switch (this.elementModel.type) {
        case 'text':
          elementComponent.elementModel.text = unitStateElementCode.value;
          break;
        case 'video':
        case 'audio':
          elementComponent.elementModel.playbackTime = unitStateElementCode.value;
          break;
        default:
          elementComponent.elementModel.value = unitStateElementCode.value;
      }
    }

    this.unitStateService.registerElement(elementComponent.elementModel.id, elementComponent.elementModel.value);

    if (this.elementModel.type === 'likert') {
      elementComponent.getChildElementValues()
        .forEach((element: { id: string, value: InputElementValue }) => (
          this.unitStateService.registerElement(element.id, element.value)
        ));
    }

    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selection: { color: string; element: HTMLElement; clear: boolean }) => {
          this.applySelection(selection.color, selection.element, selection.clear);
        });
    }

    if (elementComponent.playbackTimeChanged) {
      elementComponent.playbackTimeChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playbackTimeChanged: ValueChangeElement) => {
          this.unitStateService.changeElementValue(playbackTimeChanged);
        });
    }

    if (elementComponent instanceof FormElementComponent || this.elementModel.type === 'likert') {
      const elementForm = this.formBuilder.group({});
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);

      elementComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitStateService.changeElementValue(changeElement);
        });

      if (this.elementModel.inputAssistancePreset !== 'none' &&
        (this.elementModel.type === 'text-field' || this.elementModel.type === 'text-area')) {
        this.keyboardLayout = (this.elementModel as TextFieldElement).inputAssistancePreset;
        if (this.elementModel.type === 'text-field') {
          this.initEventsForKeyboard(elementComponent as TextFieldComponent);
        } else {
          this.initEventsForKeyboard(elementComponent as TextAreaComponent);
        }
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
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        if (this.isDescendantOf(range.startContainer, element) &&
          this.isDescendantOf(range.endContainer, element)) {
          this.markingService.applySelection(range, selection, clear, color);
          this.unitStateService.changeElementValue({
            id: this.elementModel.id,
            values: [this.elementModel.text as string, element.innerHTML]
          });
          this.elementModel.text = element.innerHTML;
        }
      }
      selection.removeAllRanges();
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

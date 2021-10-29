import {
  Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewContainerRef, QueryList
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as ElementFactory from '../../../../../common/util/element.factory';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../services/form.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import {
  InputElement, InputElementValue,
  UIElement,
  ValueChangeElement
} from '../../../../../common/models/uI-element';
import { TextFieldElement } from '../../../../../common/models/text-field-element';
import { FormElementComponent } from '../../../../../common/form-element-component.directive';
import { ElementComponent } from '../../../../../common/element-component.directive';
import { CompoundElementComponent }
  from '../../../../../common/element-components/compound-elements/compound-element.directive';
import { TextElement } from '../../../../../common/models/text-element';
import { VideoElement } from '../../../../../common/models/video-element';
import { AudioElement } from '../../../../../common/models/audio-element';

@Component({
  selector: 'app-element-container',
  templateUrl: './element-container.component.html',
  styleUrls: ['./element-container.component.css']
})
export class ElementContainerComponent implements OnInit {
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
    elementComponent.elementModel = this.restoreUnitStateValue(this.elementModel);

    if (elementComponent.domElement) {
      this.unitStateService.registerElement(
        this.initUnitStateValue(elementComponent.elementModel), elementComponent.domElement
      );
    }

    if (elementComponent.childrenAdded) {
      elementComponent.childrenAdded
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((children: QueryList<ElementComponent>) => {
          children.forEach(child => {
            if (child.domElement) {
              this.unitStateService.registerElement(this.initUnitStateValue(child.elementModel), child.domElement);
            }
          });
        });
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

    if (elementComponent.formValueChanged) {
      elementComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.unitStateService.changeElementValue(changeElement);
        });
    }

    if (elementComponent.setValidators) {
      elementComponent.setValidators
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((validators: ValidatorFn[]) => {
          this.formService.setValidators({
            id: this.elementModel.id,
            validators: validators,
            formGroup: elementForm
          });
        });
    }

    const elementForm = this.formBuilder.group({});
    if (elementComponent instanceof FormElementComponent) {
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);
      this.formService.registerFormControl({
        id: this.elementModel.id,
        formControl: new FormControl((this.elementModel as InputElement).value),
        formGroup: elementForm
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
    } else if (elementComponent instanceof CompoundElementComponent) {
      elementComponent.parentForm = elementForm;
      elementComponent.getFormElementModelChildren()
        .forEach((element: InputElement) => {
          this.registerFormGroup(elementForm);
          this.formService.registerFormControl({
            id: element.id,
            formControl: new FormControl(element.value),
            formGroup: elementForm
          });
        });
    }
  }

  private restoreUnitStateValue(elementModel: UIElement): UIElement {
    const unitStateElementCode = this.unitStateService.getUnitStateElement(elementModel.id);
    if (unitStateElementCode && unitStateElementCode.value !== undefined) {
      switch (elementModel.type) {
        case 'text':
          elementModel.text = unitStateElementCode.value;
          break;
        case 'video':
        case 'audio':
          elementModel.playbackTime = unitStateElementCode.value;
          break;
        default:
          elementModel.value = unitStateElementCode.value;
      }
    }
    return elementModel;
  }

  private initUnitStateValue = (elementModel: UIElement): { id: string, value: InputElementValue } => {
    switch (elementModel.type) {
      case 'text':
        return { id: elementModel.id, value: (elementModel as TextElement).text };
      case 'video':
        return { id: elementModel.id, value: (elementModel as VideoElement).playbackTime };
      case 'audio':
        return { id: elementModel.id, value: (elementModel as AudioElement).playbackTime };
      default:
        return { id: elementModel.id, value: (elementModel as InputElement).value };
    }
  };

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

import {
  Component, OnInit, Input, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UnitUIElement } from '../../../../../common/unit';
import * as ComponentUtils from '../../../../../common/component-utils';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../../../../common/form.service';
import { ValueChangeElement } from '../../../../../common/form';
import { UnitStateElementCode } from '../../models/verona';
import { UnitStateService } from '../../services/unit-state.service';

@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.css']
})
export class ElementComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;
  @Input() unitStateElementCodes!: UnitStateElementCode[];

  isKeyboardOpen!: boolean;

  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(public keyboardService: KeyboardService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private formService: FormService,
              private unitStateService: UnitStateService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    const elementComponentFactory =
      ComponentUtils.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;

    const unitStateElementCode = this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === this.elementModel.id);
    if (unitStateElementCode) {
      elementComponent.elementModel.value = unitStateElementCode.value;
    }

    this.unitStateService.registerElement(elementComponent.elementModel);

    if (Object.prototype.hasOwnProperty.call(this.elementModel, 'required')) {
      const elementForm = this.formBuilder.group({});
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);

      elementComponent.formValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((changeElement: ValueChangeElement) => {
          this.formService.changeElementValue(changeElement);
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

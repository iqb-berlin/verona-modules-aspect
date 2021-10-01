import {
  Component, OnInit, Input, ComponentFactoryResolver,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { UnitUIElement } from '../../../../../common/unit';
import * as ComponentUtils from '../../../../../common/component-utils';
import { SpecialCharacterService } from '../../services/special-character.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../../../../common/form.service';

@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.css']
})
export class ElementComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;

  private isInputElement!: boolean;
  private focussedInputSubscription!: Subscription;
  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(private specialCharacterService: SpecialCharacterService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private formService: FormService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    const elementComponentFactory =
      ComponentUtils.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);

    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.elementModel;
    this.isInputElement = Object.prototype.hasOwnProperty.call(this.elementModel, 'required');
    if (this.isInputElement) {
      const elementForm = this.formBuilder.group({});
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);
      if (this.specialCharacterService.isActive &&
        (this.elementModel.type === 'text-field' || this.elementModel.type === 'text-area')) {
        this.initEventsForKeyboard(elementComponent);
      }
    }
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
        this.openKeyboard(focussedInputControl);
      });

    elementComponent.onBlur
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => {
        this.closeKeyboard();
      });
  }

  private closeKeyboard(): void {
    this.specialCharacterService.closeKeyboard();
    this.focussedInputSubscription.unsubscribe();
  }

  private openKeyboard(focussedInputControl: HTMLElement): void {
    this.specialCharacterService.openKeyboard();
    this.focussedInputSubscription = this.specialCharacterService.characterInput
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((character: string): void => {
        this.onKeyboardInput(character, focussedInputControl);
      });
  }

  private onKeyboardInput = (character: string, focussedInputControl: HTMLElement): void => {
    const inputElement = focussedInputControl as HTMLInputElement;
    const selectionStart = inputElement.selectionStart || 0;
    const selectionEnd = inputElement.selectionEnd || inputElement.value.length;
    const startText = inputElement.value.substring(0, selectionStart);
    const endText = inputElement.value.substring(selectionEnd);
    inputElement.value = startText + character + endText;
    const selection = selectionStart ? selectionStart + 1 : 1;
    inputElement.setSelectionRange(selection, selection);
  };

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

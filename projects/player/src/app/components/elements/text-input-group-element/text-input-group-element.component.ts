import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { InputElement } from 'common/models/elements/element';
import { DeviceService } from '../../../services/device.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { ElementFormGroupDirective } from '../../../directives/element-form-group.directive';
import { ValidationService } from '../../../services/validation.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { KeypadService } from '../../../services/keypad.service';

@Component({
  selector: 'aspect-text-input-group-element',
  templateUrl: './text-input-group-element.component.html',
  styleUrls: ['./text-input-group-element.component.scss']
})
export class TextInputGroupElementComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;
  SpellCorrectElement!: SpellCorrectElement;

  isKeypadOpen: boolean = false;

  constructor(
    private keyboardService: KeyboardService,
    public keypadService: KeypadService,
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validationService: ValidationService,
    public deviceService: DeviceService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm([this.elementModel as InputElement]);
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      ElementModelElementCodeMappingService
        .mapToElementCodeValue((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }

  private shallOpenKeypad(): boolean {
    return !!this.elementModel.inputAssistancePreset &&
      !(this.elementModel.showSoftwareKeyboard &&
        this.elementModel.addInputAssistanceToKeyboard &&
        this.deviceService.isMobileWithoutHardwareKeyboard);
  }

  toggleKeyInput(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                 elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): void {
    if (this.shallOpenKeypad()) {
      this.keypadService.toggle(focusedTextInput, elementComponent);
      this.isKeypadOpen = this.keypadService.isOpen;
    }
    if (this.elementModel.showSoftwareKeyboard && !this.elementModel.readOnly) {
      this.keyboardService
        .toggle(focusedTextInput, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
    }
  }

  checkInputLimitation(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement
  }): void {
    if (this.elementModel.maxLength &&
      this.elementModel.isLimitedToMaxLength &&
      event.inputElement.value.length === this.elementModel.maxLength &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.keyboardEvent.key)) {
      event.keyboardEvent.preventDefault();
    }
  }

  detectHardwareKeyboard(): void {
    if (this.elementModel.showSoftwareKeyboard) {
      this.deviceService.hasHardwareKeyboard = true;
      this.keyboardService.close();
    }
  }
}

import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeypadService } from '../../services/keypad.service';
import {
  InputElement, TextAreaElement, TextFieldElement, SpellCorrectElement
} from 'common/interfaces/elements';
import { UnitStateService } from '../../services/unit-state.service';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValidatorService } from '../../services/validator.service';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';
import { TextAreaComponent } from 'common/components/ui-elements/text-area.component';
import { TextFieldComponent } from 'common/components/ui-elements/text-field.component';
import { KeyboardService } from '../../services/keyboard.service';
import { SpellCorrectComponent } from 'common/components/ui-elements/spell-correct.component';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'aspect-element-text-input-group',
  templateUrl: './element-text-input-group.component.html',
  styleUrls: ['./element-text-input-group.component.scss']
})
export class ElementTextInputGroupComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;
  SpellCorrectElement!: SpellCorrectElement;

  isKeypadOpen!: boolean;

  constructor(
    private keyboardService: KeyboardService,
    public keypadService: KeypadService,
    public unitStateService: UnitStateService,
    public unitStateElementMapperService: UnitStateElementMapperService,
    public translateService: TranslateService,
    public messageService: MessageService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validatorService: ValidatorService,
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
      this.unitStateElementMapperService.toUnitState((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }

  onFocusChanged(inputElement: HTMLElement | null,
                 elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): void {
    if (this.elementModel.inputAssistance !== 'none') {
      this.isKeypadOpen = this.keypadService.toggle(inputElement, elementComponent);
    }
    if (this.elementModel.showSoftwareKeyboard && !this.elementModel.readOnly) {
      this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
    }
  }

  registerHardwareKeyboard(inputElement: HTMLElement | null,
                           elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): void {
    this.deviceService.registerHardwareKeyboard();
    this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
  }
}

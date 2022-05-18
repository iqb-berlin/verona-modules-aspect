import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeypadService } from '../../../services/keypad.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValidationService } from '../../../services/validation.service';
import { ElementFormGroupDirective } from '../../../directives/element-form-group.directive';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { KeyboardService } from '../../../services/keyboard.service';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { DeviceService } from '../../../services/device.service';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { InputElement } from 'common/models/elements/element';

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
    public translateService: TranslateService,
    public messageService: MessageService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validatorService: ValidationService,
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
      this.elementModelElementCodeMappingService
        .mapToElementCodeValue((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }

  onFocusChanged(inputElement: HTMLElement | null,
                 elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): void {
    if (this.elementModel) {
      this.isKeypadOpen = this.keypadService.toggle(inputElement, elementComponent);
    }
    if (this.elementModel.showSoftwareKeyboard && !this.elementModel.readOnly) {
      this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
    }
  }

  detectHardwareKeyboard(inputElement: HTMLElement | null,
                         elementComponent: TextAreaComponent | TextFieldComponent | SpellCorrectComponent): void {
    this.deviceService.hasHardwareKeyboard = true;
    this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
  }
}

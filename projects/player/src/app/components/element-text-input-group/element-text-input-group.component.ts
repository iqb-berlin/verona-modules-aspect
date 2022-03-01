import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeyboardService } from '../../services/keyboard.service';
import {
  InputElement, TextAreaElement, TextFieldElement
} from '../../../../../common/interfaces/elements';
import { TextFieldComponent } from '../../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../../common/components/ui-elements/text-area.component';
import { UnitStateService } from '../../services/unit-state.service';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';
import { MessageService } from '../../../../../common/services/message.service';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { ValidatorService } from '../../services/validator.service';

@Component({
  selector: 'aspect-element-text-input-group',
  templateUrl: './element-text-input-group.component.html',
  styleUrls: ['./element-text-input-group.component.scss']
})
export class ElementTextInputGroupComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  isKeyboardOpen!: boolean;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;

  constructor(
    public keyboardService: KeyboardService,
    public unitStateService: UnitStateService,
    public unitStateElementMapperService: UnitStateElementMapperService,
    public translateService: TranslateService,
    public messageService: MessageService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validatorService: ValidatorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm([this.elementModel as InputElement]);
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id, (this.elementModel as InputElement).value, this.elementComponent, this.pageIndex
    );
  }

  onFocusChanged(focussedElement: HTMLElement | null, elementComponent: TextAreaComponent | TextFieldComponent) : void {
    if (focussedElement) {
      const focussedInputElement = this.elementModel.type === 'text-area' ?
        focussedElement as HTMLTextAreaElement :
        focussedElement as HTMLInputElement;
      const preset = (this.elementModel as TextFieldElement).inputAssistancePreset;
      const position = (this.elementModel as TextFieldElement).inputAssistancePosition;
      this.isKeyboardOpen = this.keyboardService
        .openKeyboard(focussedInputElement, preset, position, elementComponent);
    } else {
      this.isKeyboardOpen = this.keyboardService.closeKeyboard();
    }
  }
}

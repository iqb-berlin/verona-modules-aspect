import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KeyboardService } from '../../services/keyboard.service';
import {
  InputElement, TextAreaElement, TextFieldElement
} from '../../../../../common/interfaces/elements';
import { UnitStateService } from '../../services/unit-state.service';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { MessageService } from '../../../../../common/services/message.service';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { ValidatorService } from '../../services/validator.service';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';

@Component({
  selector: 'aspect-element-text-input-group',
  templateUrl: './element-text-input-group.component.html',
  styleUrls: ['./element-text-input-group.component.scss']
})
export class ElementTextInputGroupComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;

  isKeyboardOpen!: boolean;

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
}

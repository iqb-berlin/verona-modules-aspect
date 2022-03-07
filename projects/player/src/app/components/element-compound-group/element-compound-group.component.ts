import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ClozeElement, InputElement, LikertElement
} from '../../../../../common/interfaces/elements';
import { ClozeUtils } from '../../../../../common/util/cloze';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { MessageService } from '../../../../../common/services/message.service';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { ValidatorService } from '../../services/validator.service';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/components/ui-elements/text-field.component';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';

@Component({
  selector: 'aspect-element-compound-group',
  templateUrl: './element-compound-group.component.html',
  styleUrls: ['./element-compound-group.component.scss']
})
export class ElementCompoundGroupComponent extends ElementFormGroupDirective implements OnInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ClozeElement!: ClozeElement;
  LikertElement!: LikertElement;

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
    const childModels = this.elementModel.type === 'cloze' ?
      ClozeUtils.getClozeChildElements((this.elementModel as ClozeElement).document) :
      (this.elementModel as LikertElement).rows;
    this.createForm(childModels);
  }

  onChildrenAdded(children: ElementComponent[]): void {
    children.forEach(child => {
      const childModel = child.elementModel as InputElement;
      this.registerAtUnitStateService(childModel.id, childModel.value, child, this.pageIndex);
      if (childModel.type === 'text-field') {
        (child as TextFieldComponent)
          .onFocusChanged.subscribe(element => {
            this.isKeyboardOpen = this.keyboardService.toggleKeyboard(element, child as TextFieldComponent);
          });
      }
    });
  }
}

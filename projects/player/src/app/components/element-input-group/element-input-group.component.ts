import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  CheckboxElement, DropListElement, InputElement, SliderElement,
  RadioButtonGroupElement, RadioButtonGroupComplexElement, DropdownElement
} from 'common/interfaces/elements';
import { UnitStateService } from '../../services/unit-state.service';
import { UnitStateElementValueMappingService } from '../../services/unit-state-element-value-mapping.service';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValidatorService } from '../../services/validator.service';

@Component({
  selector: 'aspect-element-input-group',
  templateUrl: './element-input-group.component.html',
  styleUrls: ['./element-input-group.component.scss']
})
export class ElementInputGroupComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  CheckboxElement!: CheckboxElement;
  SliderElement!: SliderElement;
  DropListElement!: DropListElement;
  RadioButtonGroupElement!: RadioButtonGroupElement;
  RadioButtonGroupComplexElement!: RadioButtonGroupComplexElement;
  DropdownElement!: DropdownElement;

  constructor(
    public unitStateService: UnitStateService,
    public unitStateElementValueMappingService: UnitStateElementValueMappingService,
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
      this.elementModel.id,
      this.unitStateElementValueMappingService
        .mapToUnitState((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }
}

import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { ElementFormGroupDirective } from '../../../directives/element-form-group.directive';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValidationService } from '../../../services/validation.service';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { InputElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-input-group-element',
  templateUrl: './input-group-element.component.html',
  styleUrls: ['./input-group-element.component.scss']
})
export class InputGroupElementComponent extends ElementFormGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  CheckboxElement!: CheckboxElement;
  SliderElement!: SliderElement;
  DropListElement!: DropListElement;
  RadioButtonGroupElement!: RadioButtonGroupElement;
  RadioButtonGroupComplexElement!: RadioButtonGroupComplexElement;
  DropdownElement!: DropdownElement;

  constructor(
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public translateService: TranslateService,
    public messageService: MessageService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validatorService: ValidationService
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
}

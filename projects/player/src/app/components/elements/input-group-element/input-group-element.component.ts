import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { InputElement } from 'common/models/elements/element';
import { HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { ValidationService } from '../../../services/validation.service';
import { ElementFormGroupDirective } from '../../../directives/element-form-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { UnitStateService } from '../../../services/unit-state.service';

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
  HotspotImageElement!: HotspotImageElement;

  constructor(
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    public validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm([this.elementModel as InputElement]);
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      ElementModelElementCodeMappingService
        .mapToElementCodeValue((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }
}

import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { TextAreaMathElement } from 'common/models/elements/input-elements/text-area-math';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { InputElement } from 'common/models/elements/element';
import { TextInputGroupDirective } from 'player/src/app/directives/text-input-group.directive';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
import { DeviceService } from '../../../services/device.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { ValidationService } from '../../../services/validation.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { KeypadService } from '../../../services/keypad.service';

@Component({
  selector: 'aspect-text-input-group-element',
  templateUrl: './text-input-group-element.component.html',
  styleUrls: ['./text-input-group-element.component.scss']
})

export class TextInputGroupElementComponent
  extends TextInputGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;
  SpellCorrectElement!: SpellCorrectElement;
  TextAreaMathElement!: TextAreaMathElement;
  MathFieldElement!: MathFieldElement;

  constructor(
    public keyboardService: KeyboardService,
    public keypadService: KeypadService,
    public mathKeyboardService: MathKeyboardService,
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
      this.elementModel.alias,
      ElementModelElementCodeMappingService
        .mapToElementCodeValue((this.elementModel as InputElement).value, this.elementModel.type),
      this.elementComponent,
      this.pageIndex
    );
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import {
  ClozeElement, InputElement, LikertElement
} from 'common/interfaces/elements';
import { ClozeUtils } from 'common/util/cloze';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ElementModelElementCodeMappingService } from '../../services/element-model-element-code-mapping.service';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'verona/services/verona-subscription.service';
import { ValidationService } from '../../services/validation.service';
import { KeypadService } from '../../services/keypad.service';
import { ElementFormGroupDirective } from '../../directives/element-form-group.directive';
import { KeyboardService } from '../../services/keyboard.service';
import { DeviceService } from '../../services/device.service';
import { TextFieldSimpleComponent } from 'common/components/ui-elements/text-field-simple.component';

@Component({
  selector: 'aspect-element-compound-group',
  templateUrl: './element-compound-group.component.html',
  styleUrls: ['./element-compound-group.component.scss']
})
export class ElementCompoundGroupComponent extends ElementFormGroupDirective implements OnInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ClozeElement!: ClozeElement;
  LikertElement!: LikertElement;

  isKeypadOpen: boolean = false;

  constructor(
    private keyboardService: KeyboardService,
    private deviceService: DeviceService,
    public keypadService: KeypadService,
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
    const childModels = this.elementModel.type === 'cloze' ?
      ClozeUtils.getClozeChildElements(this.elementModel as ClozeElement) :
      (this.elementModel as LikertElement).rows;
    this.createForm(childModels);
  }

  onChildrenAdded(children: ElementComponent[]): void {
    children.forEach(child => {
      const childModel = child.elementModel as InputElement;
      this.registerAtUnitStateService(
        childModel.id,
        this.elementModelElementCodeMappingService.mapToElementCodeValue(childModel.value, childModel.type),
        child,
        this.pageIndex);
      if (childModel.type === 'text-field-simple') {
        const textFieldSimpleComponent = child as TextFieldSimpleComponent;
        (child as TextFieldSimpleComponent)
          .onFocusChanged
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(element => {
            this.onFocusChanged(element, textFieldSimpleComponent, childModel);
          });
        (child as TextFieldSimpleComponent)
          .onKeyDown
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(element => {
            this.registerHardwareKeyboard(element, textFieldSimpleComponent);
          });
      }
    });
  }

  private onFocusChanged(inputElement: HTMLElement | null,
                         elementComponent: TextFieldSimpleComponent,
                         elementModel: InputElement): void {
    if (elementModel.inputAssistance !== 'none') {
      this.isKeypadOpen = this.keypadService.toggle(inputElement, elementComponent);
    }
    if (elementModel.showSoftwareKeyboard && !elementModel.readOnly) {
      this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
    }
  }

  private registerHardwareKeyboard(inputElement: HTMLElement | null,
                                   elementComponent: TextFieldSimpleComponent): void {
    this.deviceService.registerHardwareKeyboard();
    this.keyboardService.toggle(inputElement, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MessageService } from 'common/services/message.service';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { CompoundElement, InputElement } from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { ValidationService } from '../../../services/validation.service';
import { KeypadService } from '../../../services/keypad.service';
import { ElementFormGroupDirective } from '../../../directives/element-form-group.directive';
import { KeyboardService } from '../../../services/keyboard.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'aspect-compound-group-element',
  templateUrl: './compound-group-element.component.html',
  styleUrls: ['./compound-group-element.component.scss']
})
export class CompoundGroupElementComponent extends ElementFormGroupDirective implements OnInit {
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
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService,
    public validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm((this.elementModel as CompoundElement).getChildElements() as InputElement[]);
  }

  registerCompoundChildren(children: ElementComponent[]): void {
    children.forEach(child => {
      const childModel = child.elementModel as InputElement;
      this.registerAtUnitStateService(
        childModel.id,
        this.elementModelElementCodeMappingService.mapToElementCodeValue(childModel.value, childModel.type),
        child,
        this.pageIndex);
      if (childModel.type === 'text-field-simple') {
        this.manageKeyInputToggling(child as TextFieldSimpleComponent, childModel);
        this.manageHardwareKeyBoardDetection(child as TextFieldSimpleComponent);
      }
      if (childModel.type === 'button') {
        this.addNavigationEventListener(child as ButtonComponent);
      }
    });
  }

  private manageHardwareKeyBoardDetection(textFieldSimpleComponent: TextFieldSimpleComponent): void {
    (textFieldSimpleComponent)
      .hardwareKeyDetected
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectHardwareKeyboard();
      });
  }

  private manageKeyInputToggling(textFieldSimpleComponent: TextFieldSimpleComponent, elementModel: InputElement): void {
    (textFieldSimpleComponent)
      .focusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(focusedTextInput => {
        this.toggleKeyInput(focusedTextInput, textFieldSimpleComponent, elementModel);
      });
  }

  private toggleKeyInput(focusedTextInput: { inputElement: HTMLElement; focused: boolean },
                         elementComponent: TextFieldSimpleComponent,
                         elementModel: InputElement): void {
    if (elementModel.inputAssistancePreset) {
      this.keypadService.toggle(focusedTextInput, elementComponent);
      this.isKeypadOpen = this.keypadService.isOpen;
    }
    if (elementModel.showSoftwareKeyboard && !elementModel.readOnly) {
      this.keyboardService
        .toggle(focusedTextInput, elementComponent, this.deviceService.isMobileWithoutHardwareKeyboard);
    }
  }

  private detectHardwareKeyboard(): void {
    this.deviceService.hasHardwareKeyboard = true;
    this.keyboardService.close();
  }

  private addNavigationEventListener(button: ButtonComponent) {
    button.navigateTo
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(navigationEvent => {
        if (navigationEvent.action === 'unitNav') {
          this.veronaPostService.sendVopUnitNavigationRequestedNotification(
            (navigationEvent.param as 'previous' | 'next' | 'first' | 'last' | 'end'));
        } else {
          this.navigationService.setPage(navigationEvent.param as number);
        }
      });
  }
}

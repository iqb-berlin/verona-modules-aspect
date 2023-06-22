import { Component, OnInit, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import {
  TextFieldSimpleComponent
} from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import {
  CompoundElement, InputElement, InputElementValue, ValueChangeElement
} from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { UnitNavParam } from 'common/models/elements/button/button';
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
    public veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService,
    private anchorService: AnchorService,
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
      const initialValue: InputElementValue = childModel.type === 'button' ?
        null :
        this.elementModelElementCodeMappingService.mapToElementCodeValue(childModel.value, childModel.type);
      this.registerAtUnitStateService(childModel.id, initialValue, child, this.pageIndex);
      if (childModel.type === 'text-field-simple') {
        this.manageKeyInputToggling(child as TextFieldSimpleComponent, childModel);
        this.manageOnKeyDown(child as TextFieldSimpleComponent, childModel);
      }
      if (childModel.type === 'button') {
        this.addNavigationEventListener(child as ButtonComponent);
      }
    });
  }

  private manageOnKeyDown(textFieldSimpleComponent: TextFieldSimpleComponent, elementModel: InputElement): void {
    (textFieldSimpleComponent)
      .onKeyDown
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(event => {
        this.onKeyDown(event, elementModel);
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

  private onKeyDown(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement
  }, elementModel: InputElement): void {
    this.detectHardwareKeyboard(elementModel);
    CompoundGroupElementComponent.checkInputLimitation(event, elementModel);
  }

  private static checkInputLimitation(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement
  }, elementModel: InputElement): void {
    if (elementModel.maxLength &&
      elementModel.isLimitedToMaxLength &&
      event.inputElement.value.length === elementModel.maxLength &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.keyboardEvent.key)) {
      event.keyboardEvent.preventDefault();
    }
  }

  private detectHardwareKeyboard(elementModel: InputElement): void {
    if (elementModel.showSoftwareKeyboard) {
      this.deviceService.hasHardwareKeyboard = true;
      this.keyboardService.close();
    }
  }

  private addNavigationEventListener(button: ButtonComponent) {
    button.navigateTo
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(navigationEvent => {
        switch (navigationEvent.action) {
          case 'unitNav':
            this.veronaPostService.sendVopUnitNavigationRequestedNotification(
              (navigationEvent.param as UnitNavParam)
            );
            break;
          case 'pageNav':
            this.navigationService.setPage(navigationEvent.param as number);
            break;
          case 'highlightText':
            this.anchorService.toggleAnchor(navigationEvent.param as string);
            break;
          case 'stateVariableChange':
            this.unitStateService.changeElementCodeValue(navigationEvent.param as ValueChangeElement);
            break;
          default:
        }
      });
  }
}

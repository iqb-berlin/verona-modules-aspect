import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
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
import { AnchorService } from 'player/src/app/services/anchor.service';
import { UnitNavParam } from 'common/models/elements/button/button';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subscription } from 'rxjs';
import { TextInputGroupDirective } from 'player/src/app/directives/text-input-group.directive';
import { ResponseValueType } from '@iqb/responses';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { ValidationService } from '../../../services/validation.service';
import { KeypadService } from '../../../services/keypad.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'aspect-compound-group-element',
  templateUrl: './compound-group-element.component.html',
  styleUrls: ['./compound-group-element.component.scss']
})
export class CompoundGroupElementComponent extends TextInputGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  ClozeElement!: ClozeElement;
  LikertElement!: LikertElement;

  isKeypadOpen: boolean = false;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;

  constructor(
    public keyboardService: KeyboardService,
    public deviceService: DeviceService,
    public keypadService: KeypadService,
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService,
    private anchorService: AnchorService,
    public validationService: ValidationService,
    private stateVariableStateService: StateVariableStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm((this.elementModel as CompoundElement).getChildElements() as InputElement[]);
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      null,
      this.elementComponent,
      this.pageIndex
    );
  }

  registerCompoundChildren(children: ElementComponent[]): void {
    children.forEach(child => {
      const childModel = child.elementModel as InputElement;
      const initialValue: ResponseValueType = childModel.type === 'button' ?
        null :
        ElementModelElementCodeMappingService.mapToElementCodeValue(childModel.value, childModel.type);
      this.registerAtUnitStateService(childModel.id, initialValue, child, this.pageIndex);
      if (childModel.type === 'text-field-simple') {
        this.manageKeyInputToggling(child as TextFieldSimpleComponent);
        this.manageOnKeyDown(child as TextFieldSimpleComponent, childModel);
      }
      if (childModel.type === 'button') {
        this.addButtonActionEventListener(child as ButtonComponent);
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

  private manageKeyInputToggling(textFieldSimpleComponent: TextFieldSimpleComponent): void {
    (textFieldSimpleComponent)
      .focusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(focusedTextInput => {
        this.toggleKeyInput(focusedTextInput, textFieldSimpleComponent);
      });
  }

  private onKeyDown(event: {
    keyboardEvent: KeyboardEvent;
    inputElement: HTMLInputElement | HTMLTextAreaElement
  }, elementModel: InputElement): void {
    this.detectHardwareKeyboard(elementModel);
    this.checkInputLimitation(event, elementModel);
  }

  private addButtonActionEventListener(button: ButtonComponent) {
    button.buttonActionEvent
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(buttonEvent => {
        switch (buttonEvent.action) {
          case 'unitNav':
            this.veronaPostService.sendVopUnitNavigationRequestedNotification(
              (buttonEvent.param as UnitNavParam)
            );
            break;
          case 'pageNav':
            this.navigationService.setPage(buttonEvent.param as number);
            break;
          case 'highlightText':
            this.anchorService.toggleAnchor(buttonEvent.param as string);
            break;
          case 'stateVariableChange':
            this.stateVariableStateService.changeElementCodeValue(
              buttonEvent.param as { id: string, value: string }
            );
            break;
          default:
        }
      });
  }
}

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
import {
  CompoundElement, InputElement, PositionedUIElement, UIElement
} from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { UnitNavParam } from 'common/models/elements/button/button';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subscription } from 'rxjs';
import { TextInputGroupDirective } from 'player/src/app/directives/text-input-group.directive';
import { ResponseValueType } from '@iqb/responses';
import { TableElement } from 'common/models/elements/compound-elements/table/table';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { ImageComponent } from 'common/components/media-elements/image.component';
import { AudioComponent } from 'common/components/media-elements/audio.component';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { MediaPlayerService } from 'player/src/app/services/media-player.service';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { TextComponent } from 'common/components/text/text.component';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
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
  TableElement!: TableElement;
  ImageElement!: ImageElement;

  isKeypadOpen: boolean = false;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;

  savedPlaybackTimes: { [key: string]: number } = {};
  savedTexts: { [key: string]: string } = {};
  textMarkingSupports: { [key: string]: TextMarkingSupport } = {};

  constructor(
    public keyboardService: KeyboardService,
    public deviceService: DeviceService,
    public keypadService: KeypadService,
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService,
    private nativeEventService: NativeEventService,
    private anchorService: AnchorService,
    public validationService: ValidationService,
    private stateVariableStateService: StateVariableStateService,
    public mediaPlayerService: MediaPlayerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm((this.elementModel as CompoundElement).getChildElements() as InputElement[]);
    if (this.elementModel.type === 'table') {
      this.initAudioTableChildren();
      this.initTextChildren();
    }
  }

  private initTextChildren(): void {
    (this.elementModel as TableElement).elements
      .filter(child => child.type === 'text')
      .forEach(element => {
        this.setTextMarkingSupportForText(element);
      });
  }

  private setTextMarkingSupportForText(element: UIElement): void {
    this.textMarkingSupports[element.id] = new TextMarkingSupport(this.nativeEventService, this.anchorService);
    this.savedTexts[element.id] = this.elementModelElementCodeMappingService
      .mapToElementModelValue(
        this.unitStateService.getElementCodeById(element.id)?.value, element
      ) as string;
  }

  private initAudioTableChildren(): void {
    (this.elementModel as TableElement).elements
      .filter(child => child.type === 'audio')
      .forEach(element => {
        this.setSavedPlaybackTimeForAudio(element);
        this.registerAtMediaPlayerService(element as AudioElement);
      });
  }

  private registerAtMediaPlayerService(audioElement: AudioElement): void {
    this.mediaPlayerService.registerMediaElement(
      audioElement.id,
      audioElement.player?.minRuns as number === 0
    );
  }

  private setSavedPlaybackTimeForAudio(element: UIElement): void {
    this.savedPlaybackTimes[element.id] = this.elementModelElementCodeMappingService.mapToElementModelValue(
      this.unitStateService.getElementCodeById(element.id)?.value, element) as number;
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
      const childModel = child.elementModel;
      let initialValue: ResponseValueType;
      switch (childModel.type) {
        case 'image':
          initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
            (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type);
          break;
        case 'audio':
          initialValue = this.elementModelElementCodeMappingService.mapToElementModelValue(
            this.unitStateService.getElementCodeById(childModel.id)?.value, childModel) as number;
          break;
        case 'button':
          initialValue = null;
          break;
        case 'text':
          // initialValue = ElementModelElementCodeMappingService
          //   .mapToElementCodeValue((childModel as TextElement).text, childModel.type);
          initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
            this.savedTexts[childModel.id], childModel.type);
          break;
        default:
          initialValue = ElementModelElementCodeMappingService
            .mapToElementCodeValue((childModel as InputElement).value, childModel.type);
      }
      this.registerAtUnitStateService(childModel.id, initialValue, child, this.pageIndex);
      this.registerChildEvents(child, childModel);
    });
  }

  private registerChildEvents(child: ElementComponent, childModel: UIElement): void {
    if (childModel.type === 'text-field-simple') {
      this.manageKeyInputToggling(child as TextFieldSimpleComponent);
      this.manageOnKeyDown(child as TextFieldSimpleComponent, childModel as InputElement);
    }
    if (childModel.type === 'text-field') {
      this.manageKeyInputToggling(child as TextFieldComponent);
      this.manageOnKeyDown(child as TextFieldComponent, childModel as InputElement);
    }
    if (childModel.type === 'button') {
      this.addButtonActionEventListener(child as ButtonComponent);
    }
    if (childModel.type === 'text') {
      this.addMarkingDataChangedSubscription(child as TextComponent, childModel);
      this.addTextSelectionStartSubscription(child as TextComponent, childModel);
      this.addElementCodeValueSubscription(child as TextComponent, childModel);
    }
    if (childModel.type === 'image') {
      this.addElementCodeValueSubscription(child as ImageComponent, childModel);
    }
    if (childModel.type === 'audio') {
      this.addElementCodeValueSubscription(child as AudioComponent, childModel);
      this.addMediaSubscriptions(child as AudioComponent);
    }
  }

  private addTextSelectionStartSubscription(child: TextComponent, childModel: UIElement): void {
    child.textSelectionStart
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.textMarkingSupports[childModel.id]
          .startTextSelection(data, child);
      });
  }

  private addMarkingDataChangedSubscription(child: TextComponent, childModel: UIElement): void {
    child.markingDataChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => this.textMarkingSupports[childModel.id]
        .applyMarkingData(data, child));
  }

  private addMediaSubscriptions(child: AudioComponent): void {
    child.mediaValidStatusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(mediaId => {
        this.mediaPlayerService.setValidStatusChanged(mediaId);
      });

    child.mediaPlayStatusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(mediaId => {
        this.mediaPlayerService.setActualPlayingId(mediaId);
      });
  }

  private addElementCodeValueSubscription(
    child: ImageComponent | AudioComponent | TextComponent,
    childModel: UIElement
  ): void {
    child.elementValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        this.unitStateService.changeElementCodeValue({
          id: value.id,
          value: ElementModelElementCodeMappingService
            .mapToElementCodeValue(value.value, childModel.type)
        });
      });
  }

  private manageOnKeyDown(
    textInputComponent: TextFieldSimpleComponent | TextFieldComponent,
    elementModel: InputElement): void {
    textInputComponent
      .onKeyDown
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(event => {
        this.onKeyDown(event, elementModel);
      });
  }

  private manageKeyInputToggling(textInputComponent: TextFieldSimpleComponent | TextFieldComponent): void {
    textInputComponent
      .focusChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(focusedTextInput => {
        this.toggleKeyInput(focusedTextInput, textInputComponent);
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

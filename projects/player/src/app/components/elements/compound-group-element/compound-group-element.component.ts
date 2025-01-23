import {
  AfterViewInit, ApplicationRef, Component, OnDestroy, OnInit, Renderer2, ViewChild
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
  CompoundElement, InputElement, UIElement
} from 'common/models/elements/element';
import { ButtonComponent } from 'common/components/button/button.component';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { UnitNavParam } from 'common/models/elements/button/button';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { Subscription, take } from 'rxjs';
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
import { TextElement } from 'common/models/elements/text/text';
import { MarkableSupport } from 'player/src/app/classes/markable-support';
import { NavigationTarget } from 'player/modules/verona/models/verona';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import {
  TextGroupElementComponent
} from 'player/src/app/components/elements/text-group-element/text-group-element.component';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
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
export class CompoundGroupElementComponent extends TextInputGroupDirective implements OnInit, AfterViewInit, OnDestroy {
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
  savedMarks: { [key: string]: string[] } = {};
  textMarkingSupports: { [key: string]: TextMarkingSupport } = {};
  markableSupports: { [key: string]: MarkableSupport } = {};

  constructor(
    public keyboardService: KeyboardService,
    public deviceService: DeviceService,
    public keypadService: KeypadService,
    public mathKeyboardService: MathKeyboardService,
    public unitStateService: UnitStateService,
    public elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public veronaSubscriptionService: VeronaSubscriptionService,
    private veronaPostService: VeronaPostService,
    private navigationService: NavigationService,
    private nativeEventService: NativeEventService,
    private anchorService: AnchorService,
    public validationService: ValidationService,
    private stateVariableStateService: StateVariableStateService,
    public mediaPlayerService: MediaPlayerService,
    private renderer: Renderer2,
    private applicationRef: ApplicationRef,
    private markingPanelService: MarkingPanelService
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
        this.setTextMarkingSupportForText(element as TextElement);
      });
  }

  private setTextMarkingSupportForText(element: TextElement): void {
    this.textMarkingSupports[element.id] = new TextMarkingSupport(this.nativeEventService, this.anchorService);
    this.markableSupports[element.id] = new MarkableSupport(
      this.renderer, this.applicationRef, this.markingPanelService
    );
    this.savedMarks[element.id] = this.unitStateService.getElementCodeById(element.id)?.value as string[] || [];
    this.savedTexts[element.id] = this.elementModelElementCodeMappingService
      .mapToElementModelValue(
        this.savedMarks[element.id], element
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
      this.elementModel.alias,
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
          if (childModel.markingMode === 'word' || childModel.markingMode === 'range') {
            this.markableSupports[childModel.id]
              .createMarkables(this.savedMarks[childModel.id], child as TextComponent);
            this.markableSupports[childModel.id].registerRangeClicks(child as TextComponent);
          }
          initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
            this.getTextChildModelValue(childModel as TextElement),
            childModel.type,
            {
              markingMode: (childModel as TextElement).markingMode
            });
          break;
        default:
          initialValue = ElementModelElementCodeMappingService
            .mapToElementCodeValue((childModel as InputElement).value, childModel.type);
      }
      this.registerAtUnitStateService(
        childModel.id,
        childModel.alias,
        initialValue,
        child,
        this.pageIndex);
      this.registerChildEvents(child, childModel);
    });
  }

  private getTextChildModelValue(childModel: TextElement): string | string[] {
    return childModel.markingMode === 'word' || childModel.markingMode === 'range' ?
      this.savedMarks[childModel.id] :
      this.savedTexts[childModel.id];
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
      this.addEnabledNavigationListener(child as ButtonComponent);
    }
    if (childModel.type === 'text') {
      this.addMarkingDataChangedSubscription(child as TextComponent, childModel);
      this.addTextSelectionStartSubscription(child as TextComponent, childModel);
      this.addElementCodeValueSubscription(
        child as TextComponent,
        childModel,
        { markingMode: (childModel as TextElement).markingMode }
      );
      this.subscribeToMarkingPanelMarkingDataChanged(child as TextComponent, childModel as TextElement);
      this.subscribeToTextSelectedColorChanged(child as TextComponent, childModel as TextElement);
      // timeout is needed to give marking panels on other pages time to initialize
      setTimeout(() => this.broadcastMarkingColorChange(undefined, childModel as TextElement));
    }
    if (childModel.type === 'image') {
      this.addElementCodeValueSubscription(child as ImageComponent, childModel);
    }
    if (childModel.type === 'audio') {
      this.addElementCodeValueSubscription(child as AudioComponent, childModel);
      this.addMediaSubscriptions(child as AudioComponent);
    }
  }

  private subscribeToTextSelectedColorChanged(child: TextComponent, childModel: TextElement) {
    child.selectedColorChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(color => this.broadcastMarkingColorChange(color, childModel));
  }

  private broadcastMarkingColorChange(color: string | undefined, childModel: TextElement): void {
    this.markingPanelService
      .broadcastMarkingColorData({
        color: color,
        id: childModel.id,
        markingMode: childModel.markingMode,
        markingPanels: childModel.markingPanels
      });
  }

  private subscribeToMarkingPanelMarkingDataChanged(child: TextComponent, childModel: TextElement) {
    this.markingPanelService.markingPanelMarkingDataChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: MarkingPanelMarkingData) => {
        if (childModel.markingPanels.includes(data.id)) {
          child.selectedColor
            .next(TextGroupElementComponent.getSelectedColorValue(data.markingData));
          this.textMarkingSupports[childModel.id].applyMarkingData(data.markingData, child);
          child.textSelectionStart
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe(pointerEvent => {
              this.textMarkingSupports[childModel.id].startTextSelection(pointerEvent, child);
            });
        }
      });
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
    childModel: UIElement,
    options?: Record<string, string>
  ): void {
    child.elementValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => {
        this.unitStateService.changeElementCodeValue({
          id: value.id,
          value: ElementModelElementCodeMappingService
            .mapToElementCodeValue(value.value, childModel.type, options)
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
    inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement
  }, elementModel: InputElement): void {
    this.detectHardwareKeyboard(elementModel);
    this.checkInputLimitation(event, elementModel);
  }

  private addEnabledNavigationListener(button: ButtonComponent) {
    if (button.elementModel.action === 'unitNav') {
      this.navigationService.enabledNavigationTargets
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(enabledNavigationTargets => {
          if (enabledNavigationTargets && enabledNavigationTargets
            .includes(button.elementModel.actionParam as NavigationTarget)) {
            this.renderer.removeClass(button.domElement, 'hide-navigation');
            this.renderer.addClass(button.domElement, 'hide-navigation');
          } else {
            this.renderer.removeClass(button.domElement, 'hide-navigation');
          }
        });
    }
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

  ngOnDestroy(): void {
    Object.keys(this.markableSupports).forEach(key => this.markableSupports[key].reset());
    super.ngOnDestroy();
  }
}

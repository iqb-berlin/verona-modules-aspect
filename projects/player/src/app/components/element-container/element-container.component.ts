import {
  Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewContainerRef, QueryList
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as ElementFactory from '../../../../../common/util/element.factory';
import { KeyboardService } from '../../services/keyboard.service';
import { TextFieldComponent } from '../../../../../common/element-components/text-field.component';
import { TextAreaComponent } from '../../../../../common/element-components/text-area.component';
import { FormService } from '../../services/form.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import {
  InputElement, InputElementValue,
  UIElement,
  ValueChangeElement
} from '../../../../../common/models/uI-element';
import { TextFieldElement } from '../../../../../common/models/text-field-element';
import { FormElementComponent } from '../../../../../common/form-element-component.directive';
import { ElementComponent } from '../../../../../common/element-component.directive';
import { CompoundElementComponent }
  from '../../../../../common/element-components/compound-elements/compound-element.directive';
import { TextElement } from '../../../../../common/models/text-element';
import { VideoElement } from '../../../../../common/models/video-element';
import { AudioElement } from '../../../../../common/models/audio-element';
import { ImageElement } from '../../../../../common/models/image-element';
import { VeronaPostService } from '../../services/verona-post.service';
import { MediaPlayerElementComponent } from '../../../../../common/media-player-element-component.directive';
import { MediaPlayerService } from '../../services/media-player.service';
import { TextComponent } from '../../../../../common/element-components/text.component';

@Component({
  selector: 'app-element-container',
  templateUrl: './element-container.component.html',
  styleUrls: ['./element-container.component.css']
})
export class ElementContainerComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;
  @Input() pageIndex!: number;

  isKeyboardOpen!: boolean;
  keyboardLayout!: 'french' | 'numbers' | 'numbersAndOperators' | 'none';

  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(public keyboardService: KeyboardService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private formService: FormService,
              private unitStateService: UnitStateService,
              private formBuilder: FormBuilder,
              private veronaPostService: VeronaPostService,
              private mediaPlayerService: MediaPlayerService,
              private markingService: MarkingService) {
  }

  ngOnInit(): void {
    const elementComponentFactory =
      ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.restoreUnitStateValue(this.elementModel);

    if (elementComponent.domElement) {
      this.unitStateService.registerElement(
        this.initUnitStateValue(elementComponent.elementModel),
        elementComponent.domElement,
        this.pageIndex
      );
    }

    if (elementComponent.childrenAdded) {
      elementComponent.childrenAdded
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((children: QueryList<ElementComponent>) => {
          children.forEach(child => {
            if (child.domElement) {
              this.unitStateService.registerElement(
                this.initUnitStateValue(child.elementModel),
                child.domElement,
                this.pageIndex
              );
            }
          });
        });
    }

    if (elementComponent.startSelection) {
      elementComponent.startSelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((mouseEvent: MouseEvent) => {
          const selection = window.getSelection();
          if (mouseEvent.ctrlKey && selection?.rangeCount) {
            selection.removeAllRanges();
          }
        });
    }

    if (elementComponent.mediaPause) {
      elementComponent.mediaPause
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.mediaPlayerService.broadCastPlayChanges(null);
        });
    }

    if (elementComponent.mediaPlay) {
      elementComponent.mediaPlay
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playId: string) => {
          this.mediaPlayerService.broadCastPlayChanges(playId);
        });
    }

    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selection:
        { mode: 'mark' | 'underline' | 'delete', color: string; element: HTMLElement; clear: boolean }) => {
          this.markingService
            .applySelection(selection.mode, selection.color, selection.element, elementComponent as TextComponent);
        });
    }

    if (elementComponent.navigationRequested) {
      elementComponent.navigationRequested
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((target: 'previous' | 'next' | 'first' | 'last' | 'end') => {
          this.veronaPostService.sendVopUnitNavigationRequestedNotification(target);
        });
    }

    if (elementComponent.elementValueChanged) {
      elementComponent.elementValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playbackTimeChanged: ValueChangeElement) => {
          this.unitStateService.changeElementValue(playbackTimeChanged);
        });
    }

    if (elementComponent.setValidators) {
      elementComponent.setValidators
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((validators: ValidatorFn[]) => {
          this.formService.setValidators({
            id: this.elementModel.id,
            validators: validators,
            formGroup: elementForm
          });
        });
    }

    const elementForm = this.formBuilder.group({});
    if (elementComponent instanceof FormElementComponent) {
      elementComponent.parentForm = elementForm;
      this.registerFormGroup(elementForm);
      this.formService.registerFormControl({
        id: this.elementModel.id,
        formControl: new FormControl((this.elementModel as InputElement).value),
        formGroup: elementForm
      });

      if (this.elementModel.inputAssistancePreset !== 'none' &&
        (this.elementModel.type === 'text-field' || this.elementModel.type === 'text-area')) {
        this.keyboardLayout = (this.elementModel as TextFieldElement).inputAssistancePreset;
        if (this.elementModel.type === 'text-field') {
          this.initEventsForKeyboard(elementComponent as TextFieldComponent);
        } else {
          this.initEventsForKeyboard(elementComponent as TextAreaComponent);
        }
      }
    } else if (elementComponent instanceof CompoundElementComponent) {
      elementComponent.parentForm = elementForm;
      elementComponent.getFormElementModelChildren()
        .forEach((element: InputElement) => {
          this.registerFormGroup(elementForm);
          this.formService.registerFormControl({
            id: element.id,
            formControl: new FormControl(element.value),
            formGroup: elementForm
          });
        });
    } else if (elementComponent instanceof MediaPlayerElementComponent) {
      this.mediaPlayerService.registerMediaElement(elementComponent);
    }
  }

  private restoreUnitStateValue(elementModel: UIElement): UIElement {
    const unitStateElementCode = this.unitStateService.getUnitStateElement(elementModel.id);
    if (unitStateElementCode && unitStateElementCode.value !== undefined) {
      switch (elementModel.type) {
        case 'text':
          elementModel.text = unitStateElementCode.value;
          break;
        case 'image':
          elementModel.magnifierUsed = unitStateElementCode.value;
          break;
        case 'video':
        case 'audio':
          elementModel.playbackTime = unitStateElementCode.value;
          break;
        default:
          elementModel.value = unitStateElementCode.value;
      }
    }
    return elementModel;
  }

  private initUnitStateValue = (elementModel: UIElement): { id: string, value: InputElementValue } => {
    switch (elementModel.type) {
      case 'text':
        return { id: elementModel.id, value: (elementModel as TextElement).text };
      case 'image':
        return { id: elementModel.id, value: (elementModel as ImageElement).magnifierUsed };
      case 'video':
        return { id: elementModel.id, value: (elementModel as VideoElement).playbackTime };
      case 'audio':
        return { id: elementModel.id, value: (elementModel as AudioElement).playbackTime };
      default:
        return { id: elementModel.id, value: (elementModel as InputElement).value };
    }
  };

  private registerFormGroup(elementForm: FormGroup): void {
    this.formService.registerFormGroup({
      formGroup: elementForm,
      parentForm: this.parentForm,
      parentArray: 'elements',
      parentArrayIndex: this.parentArrayIndex
    });
  }

  private initEventsForKeyboard(elementComponent: TextFieldComponent | TextAreaComponent): void {
    elementComponent.onFocus
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((focussedInputControl: HTMLElement): void => {
        const inputElement = this.elementModel.type === 'text-area' ?
          focussedInputControl as HTMLTextAreaElement :
          focussedInputControl as HTMLInputElement;
        this.isKeyboardOpen = this.keyboardService.openKeyboard(inputElement);
      });

    elementComponent.onBlur
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => {
        this.isKeyboardOpen = this.keyboardService.closeKeyboard();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

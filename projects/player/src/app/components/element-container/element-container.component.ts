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
import { FormService } from '../../services/form.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import {
  InputElement, InputElementValue, UIElement, ValueChangeElement
} from '../../../../../common/models/uI-element';
import { FormElementComponent } from '../../../../../common/directives/form-element-component.directive';
import { CompoundElementComponent }
  from '../../../../../common/directives/compound-element.directive';
import { TextElement } from '../../../../../common/ui-elements/text/text-element';
import { VideoElement } from '../../../../../common/ui-elements/video/video-element';
import { AudioElement } from '../../../../../common/ui-elements/audio/audio-element';
import { ImageElement } from '../../../../../common/ui-elements/image/image-element';
import { VeronaPostService } from '../../services/verona-post.service';
import { MediaPlayerElementComponent } from '../../../../../common/directives/media-player-element-component.directive';
import { MediaPlayerService } from '../../services/media-player.service';
import { TextComponent } from '../../../../../common/ui-elements/text/text.component';
import { TextFieldElement } from '../../../../../common/ui-elements/text-field/text-field-element';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';

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
  keyboardLayout!: 'french' | 'numbers' | 'numbersAndOperators' | 'comparisonOperators' | 'none';
  focussedInputElement!: HTMLTextAreaElement | HTMLInputElement;

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
    const elementComponent: ElementComponent | CompoundElementComponent = this.initElementComponent();
    this.registerAtUnitStateService(elementComponent);

    if (elementComponent instanceof FormElementComponent) {
      this.initFormElement(elementComponent);
    } else if (elementComponent instanceof CompoundElementComponent) {
      this.initCompoundElement(elementComponent);
    } else if (elementComponent instanceof MediaPlayerElementComponent) {
      this.mediaPlayerService.registerMediaElement(
        this.elementModel.id,
        elementComponent,
        this.elementModel.activeAfterID as string,
        this.elementModel.minRuns as number === 0
      );
    }
    this.subscribeStartSelection(elementComponent);
    this.subscribeApplySelection(elementComponent);
    this.subscribeMediaPlayStatusChanged(elementComponent);
    this.subscribeMediaValidStatusChanged(elementComponent);
    this.subscribeNavigationRequested(elementComponent);
    this.subscribeElementValueChanged(elementComponent);
    this.subscribeForKeyboardEvents(elementComponent);
  }

  private initElementComponent(): ElementComponent | CompoundElementComponent {
    const elementComponentFactory =
      ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.restoreUnitStateValue(this.elementModel);
    return elementComponent;
  }

  private initFormElement(elementComponent: any): void {
    const elementForm = this.formBuilder.group({});
    elementComponent.parentForm = elementForm;
    this.subscribeSetValidators(elementComponent, elementForm);
    this.registerFormGroup(elementForm);
    this.formService.registerFormControl({
      id: this.elementModel.id,
      formControl: new FormControl((this.elementModel as InputElement).value),
      formGroup: elementForm
    });
  }

  private initCompoundElement(elementComponent: any): void {
    const elementForm = this.formBuilder.group({});
    elementComponent.parentForm = elementForm;
    this.subscribeCompoundChildren(elementComponent);
    elementComponent.getFormElementModelChildren()
      .forEach((element: InputElement) => {
        this.registerFormGroup(elementForm);
        this.formService.registerFormControl({
          id: element.id,
          formControl: new FormControl(element.value),
          formGroup: elementForm
        });
      });
  }

  private registerAtUnitStateService(elementComponent: any): void {
    if (!(elementComponent instanceof CompoundElementComponent)) {
      this.unitStateService.registerElement(
        this.initUnitStateValue(elementComponent.elementModel),
        elementComponent.domElement,
        this.pageIndex
      );
    }
  }

  private subscribeCompoundChildren(elementComponent: any): void {
    if (elementComponent.childrenAdded) {
      elementComponent.childrenAdded
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((children: QueryList<ElementComponent>) => {
          children.forEach(child => {
            this.unitStateService.registerElement(
              this.initUnitStateValue(child.elementModel),
              child.domElement,
              this.pageIndex
            );
          });
        });
    }
  }

  private subscribeStartSelection(elementComponent: any): void {
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
  }

  private subscribeApplySelection(elementComponent: any): void {
    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selection:
        { mode: 'mark' | 'underline' | 'delete',
          color: string;
          element: HTMLElement;
          clear: boolean }) => {
          this.markingService
            .applySelection(selection.mode, selection.color, selection.element, elementComponent as TextComponent);
        });
    }
  }

  private subscribeMediaPlayStatusChanged(elementComponent: any): void {
    if (elementComponent.onMediaPlayStatusChanged) {
      elementComponent.onMediaPlayStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playStatus: string | null) => {
          this.mediaPlayerService.setActualPlayingMediaId(playStatus);
        });
    }
  }

  private subscribeMediaValidStatusChanged(elementComponent: any): void {
    if (elementComponent.onMediaValidStatusChanged) {
      elementComponent.onMediaValidStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((validId: string) => {
          this.mediaPlayerService.setValidStatusChanged(validId);
        });
    }
  }

  private subscribeNavigationRequested(elementComponent: any): void {
    if (elementComponent.navigationRequested) {
      elementComponent.navigationRequested
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((target: 'previous' | 'next' | 'first' | 'last' | 'end') => {
          this.veronaPostService.sendVopUnitNavigationRequestedNotification(target);
        });
    }
  }

  private subscribeElementValueChanged(elementComponent: any): void {
    if (elementComponent.elementValueChanged) {
      elementComponent.elementValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playbackTimeChanged: ValueChangeElement) => {
          this.unitStateService.changeElementValue(playbackTimeChanged);
        });
    }
  }

  private subscribeSetValidators(elementComponent: any, elementForm: FormGroup): void {
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
  }

  private subscribeForKeyboardEvents(elementComponent: any): void {
    if (elementComponent.onFocusChanged) {
      elementComponent.onFocusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((focussedInputControl: HTMLElement | null): void => {
          if (focussedInputControl) {
            this.focussedInputElement = this.elementModel.type === 'text-area' ?
              focussedInputControl as HTMLTextAreaElement :
              focussedInputControl as HTMLInputElement;
            this.keyboardLayout = (this.elementModel as TextFieldElement).inputAssistancePreset;
            this.isKeyboardOpen = this.keyboardService.openKeyboard(this.focussedInputElement, elementComponent);
          } else {
            this.isKeyboardOpen = this.keyboardService.closeKeyboard();
          }
        });
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

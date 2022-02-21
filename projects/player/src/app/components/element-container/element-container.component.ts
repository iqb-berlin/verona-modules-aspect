import {
  Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewContainerRef, ChangeDetectorRef
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormElementComponent } from '../../../../../common/directives/form-element-component.directive';
import { CompoundElementComponent }
  from '../../../../../common/directives/compound-element.directive';
import { MediaPlayerElementComponent } from '../../../../../common/directives/media-player-element-component.directive';
import { TextComponent } from '../../../../../common/components/ui-elements/text.component';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { ImageComponent } from '../../../../../common/components/ui-elements/image.component';
import { ButtonComponent } from '../../../../../common/components/ui-elements/button.component';
import { TextFieldComponent } from '../../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../../common/components/ui-elements/text-area.component';
import { ElementFactory } from '../../../../../common/util/element.factory';
import { KeyboardService } from '../../services/keyboard.service';
import { FormService } from '../../services/form.service';
import { UnitStateService } from '../../services/unit-state.service';

import { MediaPlayerService } from '../../services/media-player.service';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { VeronaPostService } from '../../services/verona-post.service';
import { NativeEventService } from '../../services/native-event.service';
import { TextMarker } from '../../classes/text-marker';
import {
  InputElement, InputElementValue,
  TextFieldElement,
  UIElement,
  ValueChangeElement
} from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-container',
  templateUrl: './element-container.component.html',
  styleUrls: ['./element-container.component.css']
})
export class ElementContainerComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;
  @Input() pageIndex!: number;

  elementComponent!: ElementComponent;
  isKeyboardOpen!: boolean;
  selectedColor!: string | null;
  selectedMode!: 'mark' | 'delete' | null;

  isMarkingBarOpen!: boolean;
  markingBarPosition: { top: number, left: number } = { top: 0, left: 0 };
  textComponentRect!: DOMRect;
  textComponentContainerScrollTop!: number;

  private ngUnsubscribe = new Subject<void>();

  @ViewChild('elementComponentContainer',
    { read: ViewContainerRef, static: true }) private elementComponentContainer!: ViewContainerRef;

  constructor(public keyboardService: KeyboardService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private formService: FormService,
              private unitStateService: UnitStateService,
              private formBuilder: FormBuilder,
              private nativeEventService: NativeEventService,
              private veronaPostService: VeronaPostService,
              private mediaPlayerService: MediaPlayerService,
              private unitStateElementMapperService: UnitStateElementMapperService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.elementComponent = this.initElementComponent();
    this.registerAtUnitStateService(this.elementComponent);
    if (this.elementComponent instanceof FormElementComponent) {
      this.initFormElement(this.elementComponent);
    } else if (this.elementComponent instanceof CompoundElementComponent) {
      this.initCompoundElement(this.elementComponent);
    } else if (this.elementComponent instanceof MediaPlayerElementComponent) {
      this.mediaPlayerService.registerMediaElement(
        this.elementModel.id,
        this.elementComponent,
        this.elementModel.playerProps?.activeAfterID as string,
        this.elementModel.playerProps?.minRuns as number === 0
      );
    }
    this.subscribeStartSelection(this.elementComponent as TextComponent);
    this.subscribeApplySelection(this.elementComponent as TextComponent);
    this.subscribeMediaPlayStatusChanged(this.elementComponent as MediaPlayerElementComponent);
    this.subscribeMediaValidStatusChanged(this.elementComponent as MediaPlayerElementComponent);
    this.subscribeNavigationRequested(this.elementComponent as ButtonComponent);
    this.subscribeElementValueChanged(
      this.elementComponent as FormElementComponent | TextComponent | ImageComponent | MediaPlayerElementComponent
    );
    this.subscribeForKeyboardEvents(this.elementComponent as TextFieldComponent | TextAreaComponent);
  }

  applySelectionToText(mode: 'mark' | 'delete', color: string): void {
    TextMarker
      .applySelection(
        mode,
        color,
        this.elementComponent as TextComponent
      );
    this.isMarkingBarOpen = false;
  }

  private initElementComponent(): ElementComponent {
    const elementComponentFactory =
      ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.unitStateElementMapperService
      .mapToElementValue(
        this.elementModel,
        this.unitStateService.getUnitStateElement(this.elementModel.id)
      );
    return elementComponent;
  }

  private initFormElement(elementComponent: FormElementComponent): void {
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

  private initCompoundElement(elementComponent: CompoundElementComponent): void {
    const elementForm = this.formBuilder.group({});
    elementComponent.parentForm = elementForm;
    const compoundChildren = elementComponent.getFormElementModelChildren();
    this.subscribeCompoundChildren(elementComponent, compoundChildren, elementForm);
    this.registerFormGroup(elementForm);
    compoundChildren.forEach((element: InputElement) => {
      this.formService.registerFormControl({
        id: element.id,
        formControl: new FormControl(element.value),
        formGroup: elementForm
      });
    });
  }

  private registerAtUnitStateService(elementComponent: ElementComponent): void {
    if (!(elementComponent instanceof CompoundElementComponent)) {
      this.unitStateService.registerElement(
        this.unitStateElementMapperService.mapToUnitStateValue(
          elementComponent.elementModel,
          this.unitStateService.getUnitStateElement(elementComponent.elementModel.id)
        ),
        elementComponent.domElement,
        this.pageIndex
      );
    }
  }

  private subscribeCompoundChildren(
    elementComponent: CompoundElementComponent, compoundChildren: InputElement[], elementForm: FormGroup
  ): void {
    if (elementComponent.childrenAdded) {
      elementComponent.childrenAdded
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((children: ElementComponent[]) => {
          children.forEach((child, index) => {
            const childModel = compoundChildren[index];
            child.elementModel = this.unitStateElementMapperService
              .mapToElementValue(
                childModel,
                this.unitStateService.getUnitStateElement(child.elementModel.id)
              );
            this.unitStateService.registerElement(
              this.unitStateElementMapperService.mapToUnitStateValue(
                child.elementModel,
                this.unitStateService.getUnitStateElement(child.elementModel.id)
              ),
              child.domElement,
              this.pageIndex
            );
            const formChild = (child as FormElementComponent);
            if (formChild) {
              this.subscribeSetValidators(formChild, elementForm);
              formChild.setFormValue(child.elementModel.value as InputElementValue, { emitEvent: false });
              formChild.setFormControlValidator();
            }
          });
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  private subscribeStartSelection(elementComponent: TextComponent): void {
    if (elementComponent.startSelection) {
      elementComponent.startSelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((pointerDown: MouseEvent | TouchEvent) => {
          this.isMarkingBarOpen = false;

          this.nativeEventService.pointerUp
            .pipe(takeUntil(this.ngUnsubscribe), first())
            .subscribe((pointerUp: TouchEvent | MouseEvent) => {
              if (pointerUp.cancelable) {
                pointerUp.preventDefault();
              }
              this.stopSelection(
                this.getClientPointFromEvent(pointerUp),
                pointerUp.ctrlKey,
                this.getClientPointFromEvent(pointerDown),
                elementComponent
              );
            });
        });
    }
  }

  private stopSelection(
    mouseUp: { clientX: number, clientY: number },
    ctrlKey: boolean,
    downPosition: { clientX: number, clientY: number },
    elementComponent: TextComponent
  ) {
    const selection = window.getSelection();
    if (selection && TextMarker.isSelectionValid(selection) && selection.rangeCount > 0) {
      if (!TextMarker.isRangeInside(selection.getRangeAt(0), elementComponent.textContainerRef.nativeElement) ||
        (ctrlKey)) {
        selection.removeAllRanges();
      } else if (this.selectedMode && this.selectedColor) {
        this.applySelectionToText(this.selectedMode, this.selectedColor);
      } else if (!this.isMarkingBarOpen) {
        this.openMarkingBar(mouseUp, downPosition);
      }
    }
  }

  private getClientPointFromEvent = (event: MouseEvent | TouchEvent): { clientX: number, clientY: number } => ({
    clientX: (event instanceof MouseEvent) ? event.clientX : event.changedTouches[0].clientX,
    clientY: (event instanceof MouseEvent) ? event.clientY : event.changedTouches[0].clientY
  });

  private openMarkingBar(
    mouseUp: { clientX: number, clientY: number },
    downPosition: { clientX: number, clientY: number }
  ) {
    this.markingBarPosition.left = downPosition.clientY > mouseUp.clientY ? downPosition.clientX : mouseUp.clientX;
    this.markingBarPosition.top = downPosition.clientY > mouseUp.clientY ? downPosition.clientY : mouseUp.clientY;
    this.textComponentContainerScrollTop =
      this.elementComponent.domElement.closest('.fixed-size-content')?.scrollTop || 0;
    this.textComponentRect = this.elementComponent.domElement.getBoundingClientRect();
    this.isMarkingBarOpen = true;
    this.nativeEventService.pointerDown
      .pipe(takeUntil(this.ngUnsubscribe), first())
      .subscribe(() => this.closeMarkingBar());
  }

  private closeMarkingBar() {
    this.isMarkingBarOpen = false;
  }

  private subscribeApplySelection(elementComponent: TextComponent): void {
    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((
          selection: {
            active: boolean,
            mode: 'mark' | 'delete',
            color: string;
          }
        ) => {
          if (selection.active) {
            this.selectedColor = selection.color;
            this.selectedMode = selection.mode;
            this.applySelectionToText(selection.mode, selection.color);
          } else {
            this.selectedColor = null;
            this.selectedMode = null;
          }
        });
    }
  }

  private subscribeMediaPlayStatusChanged(elementComponent: MediaPlayerElementComponent): void {
    if (elementComponent.onMediaPlayStatusChanged) {
      elementComponent.onMediaPlayStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playStatus: string | null) => {
          this.mediaPlayerService.setActualPlayingMediaId(playStatus);
        });
    }
  }

  private subscribeMediaValidStatusChanged(elementComponent: MediaPlayerElementComponent): void {
    if (elementComponent.onMediaValidStatusChanged) {
      elementComponent.onMediaValidStatusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((validId: string) => {
          this.mediaPlayerService.setValidStatusChanged(validId);
        });
    }
  }

  private subscribeNavigationRequested(elementComponent: ButtonComponent): void {
    if (elementComponent.navigationRequested) {
      elementComponent.navigationRequested
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((target: 'previous' | 'next' | 'first' | 'last' | 'end') => {
          this.veronaPostService.sendVopUnitNavigationRequestedNotification(target);
        });
    }
  }

  private subscribeElementValueChanged(
    elementComponent: FormElementComponent | TextComponent | ImageComponent | MediaPlayerElementComponent
  ): void {
    if (elementComponent.elementValueChanged) {
      elementComponent.elementValueChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((playbackTimeChanged: ValueChangeElement) => {
          this.unitStateService.changeElementValue(playbackTimeChanged);
        });
    }
  }

  private subscribeSetValidators(elementComponent: FormElementComponent, elementForm: FormGroup): void {
    if (elementComponent.setValidators) {
      elementComponent.setValidators
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((validators: ValidatorFn[]) => {
          this.formService.setValidators({
            id: elementComponent.elementModel.id,
            validators: validators,
            formGroup: elementForm
          });
        });
    }
  }

  private subscribeForKeyboardEvents(elementComponent: TextFieldComponent | TextAreaComponent): void {
    if (elementComponent.onFocusChanged) {
      elementComponent.onFocusChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((focussedElement: HTMLElement | null): void => {
          if (focussedElement) {
            const focussedInputElement = this.elementModel.type === 'text-area' ?
              focussedElement as HTMLTextAreaElement :
              focussedElement as HTMLInputElement;
            const preset = (this.elementModel as TextFieldElement).inputAssistancePreset;
            const position = (this.elementModel as TextFieldElement).inputAssistancePosition;
            this.isKeyboardOpen = this.keyboardService
              .openKeyboard(focussedInputElement, preset, position, elementComponent);
          } else {
            this.isKeyboardOpen = this.keyboardService.closeKeyboard();
          }
        });
    }
  }

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

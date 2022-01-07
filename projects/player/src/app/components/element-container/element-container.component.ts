import {
  Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewContainerRef, QueryList, ChangeDetectorRef
} from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  InputElement, UIElement, ValueChangeElement
} from '../../../../../common/models/uI-element';
import { FormElementComponent } from '../../../../../common/directives/form-element-component.directive';
import { CompoundElementComponent }
  from '../../../../../common/directives/compound-element.directive';
import { MediaPlayerElementComponent } from '../../../../../common/directives/media-player-element-component.directive';
import { TextComponent } from '../../../../../common/ui-elements/text/text.component';
import { TextFieldElement } from '../../../../../common/ui-elements/text-field/text-field-element';
import { ElementComponent } from '../../../../../common/directives/element-component.directive';
import { ImageComponent } from '../../../../../common/ui-elements/image/image.component';
import { ButtonComponent } from '../../../../../common/ui-elements/button/button.component';
import { TextFieldComponent } from '../../../../../common/ui-elements/text-field/text-field.component';
import { TextAreaComponent } from '../../../../../common/ui-elements/text-area/text-area.component';
import { ElementFactory } from '../../../../../common/util/element.factory';
import { KeyboardService } from '../../services/keyboard.service';
import { FormService } from '../../services/form.service';
import { UnitStateService } from '../../services/unit-state.service';
import { MarkingService } from '../../services/marking.service';
import { MediaPlayerService } from '../../services/media-player.service';
import { UnitStateElementMapperService } from '../../services/unit-state-element-mapper.service';
import { VeronaPostService } from '../../services/verona-post.service';
import { NativeEventService } from '../../services/native-event.service';

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
              private nativeEventService: NativeEventService,
              private veronaPostService: VeronaPostService,
              private mediaPlayerService: MediaPlayerService,
              private unitStateElementMapperService: UnitStateElementMapperService,
              private markingService: MarkingService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const elementComponent: ElementComponent = this.initElementComponent();
    this.registerAtUnitStateService(elementComponent);

    if (elementComponent instanceof FormElementComponent) {
      this.initFormElement(elementComponent);
    } else if (elementComponent instanceof CompoundElementComponent) {
      this.initCompoundElement(elementComponent);
    } else if (elementComponent instanceof MediaPlayerElementComponent) {
      this.mediaPlayerService.registerMediaElement(
        this.elementModel.id,
        elementComponent,
        this.elementModel.playerProps?.activeAfterID as string,
        this.elementModel.playerProps?.minRuns as number === 0
      );
    }
    this.subscribeStartSelection(elementComponent as TextComponent);
    this.subscribeApplySelection(elementComponent as TextComponent);
    this.subscribeMediaPlayStatusChanged(elementComponent as MediaPlayerElementComponent);
    this.subscribeMediaValidStatusChanged(elementComponent as MediaPlayerElementComponent);
    this.subscribeNavigationRequested(elementComponent as ButtonComponent);
    this.subscribeElementValueChanged(
      elementComponent as FormElementComponent | TextComponent | ImageComponent | MediaPlayerElementComponent
    );
    this.subscribeForKeyboardEvents(elementComponent as TextFieldComponent | TextAreaComponent);
  }

  private initElementComponent(): ElementComponent {
    const elementComponentFactory =
      ElementFactory.getComponentFactory(this.elementModel.type, this.componentFactoryResolver);
    const elementComponent = this.elementComponentContainer.createComponent(elementComponentFactory).instance;
    elementComponent.elementModel = this.unitStateElementMapperService
      .mapToElementValue(
        this.elementModel,
        this.unitStateService.getUnitStateElement(this.elementModel.id),
        this.markingService
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
    this.subscribeCompoundChildren(elementComponent, compoundChildren);
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
    elementComponent: CompoundElementComponent, compoundChildren: InputElement[]
  ): void {
    if (elementComponent.childrenAdded) {
      elementComponent.childrenAdded
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((children: QueryList<ElementComponent>) => {
          children.forEach((child, index) => {
            const childModel = compoundChildren[index];
            child.elementModel = this.unitStateElementMapperService
              .mapToElementValue(
                childModel,
                this.unitStateService.getUnitStateElement(child.elementModel.id),
                this.markingService
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
              formChild.setFormValue(child.elementModel.value);
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
        .subscribe((mouseEvent: MouseEvent) => {
          this.nativeEventService.mouseUp
            .pipe(takeUntil(this.ngUnsubscribe), first())
            .subscribe(() => this.startSelection(mouseEvent, elementComponent));
        });
    }
  }

  private startSelection(mouseEvent: MouseEvent, elementComponent: TextComponent) {
    const selection = window.getSelection();
    if (selection) {
      if (!this.markingService.isDescendantOf(selection.anchorNode, elementComponent.containerDiv.nativeElement) ||
        !this.markingService.isDescendantOf(selection.focusNode, elementComponent.containerDiv.nativeElement) ||
      (mouseEvent.ctrlKey && selection.rangeCount)) {
        selection.removeAllRanges();
      }
    }
  }

  private subscribeApplySelection(elementComponent: TextComponent): void {
    if (elementComponent.applySelection) {
      elementComponent.applySelection
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selection:
        {
          mode: 'mark' | 'delete',
          color: string;
          element: HTMLElement;
        }) => {
          this.markingService
            .applySelection(selection.mode, selection.color, selection.element, elementComponent as TextComponent);
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
            id: this.elementModel.id,
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

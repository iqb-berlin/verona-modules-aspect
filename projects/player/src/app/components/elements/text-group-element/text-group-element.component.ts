import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TextComponent } from 'common/components/text/text.component';
import { TextElement } from 'common/models/elements/text/text';
import { ValueChangeElement } from 'common/models/elements/element';
import { TextMarkingService } from '../../../services/text-marking.service';
import { NativeEventService } from '../../../services/native-event.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-text-group-element',
  templateUrl: './text-group-element.component.html',
  styleUrls: ['./text-group-element.component.scss']
})
export class TextGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: TextComponent;
  TextElement!: TextElement;

  initialValue: string = '';
  isMarkingBarOpen: boolean = false;
  selectedColor: string | null = null;
  selectedMode: 'mark' | 'delete' | null = null;
  markingBarPosition: { top: number, left: number } = { top: 0, left: 0 };
  textComponentContainerScrollTop: number = 0;
  textComponentRect!: DOMRect;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private nativeEventService: NativeEventService,
    private unitStateElementMapperService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialValue = this.unitStateElementMapperService
      .mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as string;
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      ElementModelElementCodeMappingService.mapToElementCodeValue(this.initialValue, this.elementModel.type),
      this.elementComponent,
      this.pageIndex);
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }

  applyMarkingData(
    selection: { active: boolean; mode: 'mark' | 'delete'; color: string; colorName: string | undefined }
  ): void {
    if (selection.active) {
      this.selectedColor = selection.color;
      this.selectedMode = selection.mode;
      this.applyMarkingDataToText(selection.mode, selection.color);
    } else {
      this.selectedColor = null;
      this.selectedMode = null;
    }
  }

  startTextSelection(pointerDown: PointerEvent): void {
    this.isMarkingBarOpen = false;
    this.nativeEventService.pointerUp
      .pipe(takeUntil(this.ngUnsubscribe), first())
      .subscribe((pointerUp: PointerEvent) => {
        this.stopTextSelection(
          {
            startSelectionX: pointerDown.clientX,
            startSelectionY: pointerDown.clientY,
            stopSelectionX: pointerUp.clientX,
            stopSelectionY: pointerUp.clientY
          },
          pointerUp.ctrlKey
        );
        pointerUp.preventDefault();
        pointerUp.stopPropagation();
      });
  }

  applyMarkingDataToText(mode: 'mark' | 'delete', color: string): void {
    TextMarkingService
      .applyMarkingDataToText(
        mode,
        color,
        this.elementComponent
      );
    this.isMarkingBarOpen = false;
  }

  private stopTextSelection(
    textSelectionPosition: {
      stopSelectionX: number, stopSelectionY: number, startSelectionX: number, startSelectionY: number
    },
    isControlKeyPressed: boolean // do not allow multiple selections (FF)
  ) {
    const selection = window.getSelection();
    if (selection && TextMarkingService.isSelectionValid(selection) && selection.rangeCount > 0) {
      if (!TextMarkingService
        .isRangeInside(
          selection.getRangeAt(0), this.elementComponent.textContainerRef.nativeElement
        ) || (isControlKeyPressed)) {
        selection.removeAllRanges();
      } else if (this.selectedMode && this.selectedColor) {
        this.applyMarkingDataToText(this.selectedMode, this.selectedColor);
      } else if (!this.isMarkingBarOpen) {
        this.openMarkingBar(textSelectionPosition);
      }
    }
  }

  private openMarkingBar(
    textSelectionPosition: {
      stopSelectionX: number, stopSelectionY: number, startSelectionX: number, startSelectionY: number
    }
  ) {
    this.markingBarPosition.left =
      textSelectionPosition.startSelectionX > textSelectionPosition.stopSelectionX ?
        textSelectionPosition.startSelectionX : textSelectionPosition.stopSelectionX;
    this.markingBarPosition.top =
      textSelectionPosition.startSelectionY > textSelectionPosition.stopSelectionY ?
        textSelectionPosition.startSelectionY : textSelectionPosition.stopSelectionY;
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

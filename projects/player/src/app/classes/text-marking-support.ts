import { take, takeUntil } from 'rxjs/operators';
import { TextMarkingUtils } from 'player/src/app/classes/text-marking-utils';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { Subject } from 'rxjs';
import { TextComponent } from 'common/components/elements/text/text.component';
import { MarkingData } from 'common/models/marking-data';
import { RangeSelectionService } from 'common/services/range-selection.service';

export class TextMarkingSupport {
  isMarkingBarOpen: boolean = false;
  selectedColor: string | null = null;
  selectedMode: 'mark' | 'delete' | null = null;
  markingBarPosition: { top: number, left: number } = { top: 0, left: 0 };
  textComponentContainerScrollTop: number = 0;
  textComponentRect!: DOMRect;

  private ngUnsubscribe = new Subject<void>();
  private openMarkingBarTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private nativeEventService: NativeEventService,
              private anchorService: AnchorService) {
  }

  applyMarkingData(
    markingData: MarkingData,
    elementComponent: TextComponent
  ): void {
    if (markingData.active) {
      this.selectedColor = markingData.color;
      this.selectedMode = markingData.mode;
      this.applyMarkingDataToText(markingData.mode, markingData.color, elementComponent);
    } else {
      this.selectedColor = null;
      this.selectedMode = null;
    }
  }

  startTextSelection(pointerDown: PointerEvent, elementComponent: TextComponent): void {
    this.isMarkingBarOpen = false;
    this.anchorService.hideAllAnchors();
    this.nativeEventService.pointerUp
      .pipe(takeUntil(this.ngUnsubscribe), take(1))
      .subscribe((pointerUp: PointerEvent) => {
        this.stopTextSelection(
          {
            startSelectionX: pointerDown.clientX,
            startSelectionY: pointerDown.clientY,
            stopSelectionX: pointerUp.clientX,
            stopSelectionY: pointerUp.clientY
          },
          pointerUp.ctrlKey,
          elementComponent
        );
        pointerUp.preventDefault();
        pointerUp.stopPropagation();
      });
  }

  applyMarkingDataToText(mode: 'mark' | 'delete', color: string, elementComponent: TextComponent): void {
    TextMarkingUtils
      .applyMarkingDataToText(
        mode,
        color,
        elementComponent
      );
    this.isMarkingBarOpen = false;
  }

  private stopTextSelection(
    textSelectionPosition: {
      stopSelectionX: number, stopSelectionY: number, startSelectionX: number, startSelectionY: number
    },
    isControlKeyPressed: boolean, // do not allow multiple selections (FF)
    elementComponent: TextComponent
  ): void {
    const selection = window.getSelection();
    if (selection && TextMarkingUtils.isSelectionValid(selection) && selection.rangeCount > 0) {
      if (!RangeSelectionService
        .isRangeInside(
          selection.getRangeAt(0), elementComponent.textContainerRef.nativeElement
        ) || (isControlKeyPressed)) {
        selection.removeAllRanges();
      } else if (this.selectedMode && this.selectedColor) {
        this.applyMarkingDataToText(this.selectedMode, this.selectedColor, elementComponent);
      } else if (!this.isMarkingBarOpen) {
        // hack for windows mobile to prevent opening marking bar while selection is removed on FF
        this.openMarkingBarTimeout = setTimeout(() => {
          const selectionTest = window.getSelection();
          if (selectionTest && TextMarkingUtils.isSelectionValid(selectionTest) && selectionTest.rangeCount > 0) {
            this.openMarkingBar(textSelectionPosition, elementComponent);
          }
        }, 100);
      }
    }
  }

  private openMarkingBar(
    textSelectionPosition: {
      stopSelectionX: number, stopSelectionY: number, startSelectionX: number, startSelectionY: number
    },
    elementComponent: TextComponent
  ): void {
    this.markingBarPosition.left =
      textSelectionPosition.startSelectionX > textSelectionPosition.stopSelectionX ?
        textSelectionPosition.startSelectionX : textSelectionPosition.stopSelectionX;
    this.markingBarPosition.top =
      textSelectionPosition.startSelectionY > textSelectionPosition.stopSelectionY ?
        textSelectionPosition.startSelectionY : textSelectionPosition.stopSelectionY;
    this.textComponentContainerScrollTop =
      elementComponent.domElement.closest('.fixed-size-content')?.scrollTop || 0;
    this.textComponentRect = elementComponent.domElement.getBoundingClientRect();
    this.isMarkingBarOpen = true;
    this.nativeEventService.pointerDown
      .pipe(takeUntil(this.ngUnsubscribe), take(1))
      .subscribe(() => this.closeMarkingBar());
  }

  private closeMarkingBar() {
    this.isMarkingBarOpen = false;
  }

  /* The delayed opening of the marking bar has to be cancelled explicitly: a completed
   * ngUnsubscribe does not stop takeUntil from passing on a subscription that is created
   * afterwards, so a timeout that survives would leave a pointer subscription behind. */
  destroy(): void {
    if (this.openMarkingBarTimeout !== null) {
      clearTimeout(this.openMarkingBarTimeout);
      this.openMarkingBarTimeout = null;
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

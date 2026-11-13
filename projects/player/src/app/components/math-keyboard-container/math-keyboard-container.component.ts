import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
import { MathKeyboardAdapter } from 'common/modules/math-editor/utils/math-keyboard-adapter';

@Component({
  selector: 'aspect-math-keyboard-container',
  standalone: false,
  templateUrl: './math-keyboard-container.component.html',
  styleUrl: './math-keyboard-container.component.scss'
})
export class MathKeyboardContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mathKeyboard') mathKeyboard!: ElementRef;

  /**
   * Held, not written twice: `removeEventListener` compares by reference, so the arrow ngOnDestroy
   * used to create was never the one ngAfterViewInit had registered. mathVirtualKeyboard is a window
   * singleton, so the closure kept the destroyed component and its detached container alive for the
   * rest of the page -- one orphan per unit load, since configureUnit empties `pages` and takes the
   * whole layout down with it. Not per page and not tied to math fields: the container sits
   * unconditionally in the player layout, which page navigation never destroys (#1123).
   */
  private readonly onGeometryChange = (): void => this.updateKeyboard();

  constructor(public mathKeyboardService: MathKeyboardService) {}

  ngAfterViewInit(): void {
    MathKeyboardAdapter.keyboard.container = this.mathKeyboard.nativeElement;
    MathKeyboardAdapter.keyboard.addEventListener('geometrychange', this.onGeometryChange);
  }

  updateKeyboard(): void {
    this.mathKeyboardService.keyboardHeight =
      MathKeyboardAdapter.keyboard.boundingRect.height;
    if (this.mathKeyboardService.keyboardHeight) {
      setTimeout(() => this.mathKeyboardService.scrollElement());
    }
  }

  ngOnDestroy(): void {
    MathKeyboardAdapter.keyboard.removeEventListener('geometrychange', this.onGeometryChange);
  }
}

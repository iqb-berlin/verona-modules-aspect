import { Injectable } from '@angular/core';
import { InputService } from 'player/src/app/services/input-service';

/**
 * The part of an input aid that keeps the field in sight: an aid covering the lower part of the screen
 * would otherwise hide what is being typed into.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class ScrollToInputService extends InputService {
  /**
   * How much of the screen the aid takes. `KeyboardService` sets it when it opens and never puts it
   * back -- after the first open it keeps the last height, closed or not, and only `scrollElement`'s
   * `isOpen` guard keeps that from mattering. `MathKeyboardService` re-measures it and does return to 0.
   */
  keyboardHeight: number = 0;

  /**
   * Scrolls the field into the part of the screen the aid leaves free -- centred if it fits there,
   * otherwise with its top edge at the top. Does nothing while the aid is closed or the field is
   * already clear of it.
   */
  scrollElement(): void {
    if (this.isOpen && this.isElementHiddenByKeyboard()) {
      const scrollPositionTarget = this.isViewHighEnoughToCenterElement() ? 'center' : 'start';
      this.elementComponent.domElement.scrollIntoView({ block: scrollPositionTarget });
    }
  }

  private isViewHighEnoughToCenterElement(): boolean {
    return window.innerHeight - this.keyboardHeight > this.elementComponent.domElement.getBoundingClientRect().height;
  }

  private isElementHiddenByKeyboard(): boolean {
    return window.innerHeight - this.elementComponent.domElement.getBoundingClientRect().bottom < this.keyboardHeight;
  }
}

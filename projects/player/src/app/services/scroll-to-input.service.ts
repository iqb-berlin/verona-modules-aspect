import { Injectable } from '@angular/core';
import { InputService } from 'player/src/app/services/input-service';

@Injectable({
  providedIn: 'root'
})
export abstract class ScrollToInputService extends InputService {
  keyboardHeight: number = 0;

  scrollElement(): void {
    if (this.isOpen && this.isElementHiddenByKeyboard()) {
      const scrollPositionTarget = this.isViewHighEnoughToCenterElement() ? 'center' : 'start';
      console.log('scrollPositionTarget', scrollPositionTarget);
      this.elementComponent.domElement.scrollIntoView({ block: scrollPositionTarget });
    }
  }

  private isViewHighEnoughToCenterElement(): boolean {
    return window.innerHeight - this.keyboardHeight >
      this.elementComponent.domElement.getBoundingClientRect().height;
  }

  private isElementHiddenByKeyboard(): boolean {
    return window.innerHeight - this.elementComponent.domElement.getBoundingClientRect().bottom <
      this.keyboardHeight;
  }
}

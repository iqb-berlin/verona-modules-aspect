import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly isTouch!: boolean;
  private hasHardwareKeyboard!: boolean; // TODO

  constructor() {
    this.isTouch = (('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0));
  }

  get isMobileWithoutHardwareKeyboard(): boolean {
    return this.isTouch && !this.hasHardwareKeyboard;
  }

  registerHardwareKeyboard(): void {
    this.hasHardwareKeyboard = true;
  }
}

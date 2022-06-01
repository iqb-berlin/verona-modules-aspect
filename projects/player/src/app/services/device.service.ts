import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  hasHardwareKeyboard: boolean = false;
  private readonly isTouch!: boolean;

  constructor() {
    this.isTouch = (('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0));
  }

  get isMobileWithoutHardwareKeyboard(): boolean {
    return this.isTouch && !this.hasHardwareKeyboard;
  }
}

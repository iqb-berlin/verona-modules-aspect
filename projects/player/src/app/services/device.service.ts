import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  hasHardwareKeyboard: boolean = false;
  private readonly isTouch!: boolean;

  constructor() {
    /* Only the number of touch points is evaluated. 'ontouchstart' in window merely tells whether the
       browser exposes the touch events API; the Safe Exam Browser enables it unconditionally, which made
       every desktop machine look like a touch device.
       The threshold is intentionally > 1: it excludes single point digitizers (pen enabled Windows
       laptops without a touchscreen), see 57b19f85. Real multi touch displays report 5 to 10 points. */
    this.isTouch = navigator.maxTouchPoints > 1;
  }

  get isMobileWithoutHardwareKeyboard(): boolean {
    return this.isTouch && !this.hasHardwareKeyboard;
  }
}

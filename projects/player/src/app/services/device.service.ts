import { Injectable } from '@angular/core';

/**
 * Whether the device needs the player's own input assistance -- the on-screen keyboard is only shown
 * where the operating system offers none of its own.
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  /**
   * Not detectable up front, so it is set from outside: a key event on an input element that asked for
   * the on-screen keyboard proves a physical one is there, and closes the on-screen one.
   */
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

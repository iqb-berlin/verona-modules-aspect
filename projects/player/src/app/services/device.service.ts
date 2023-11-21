import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  hasHardwareKeyboard: boolean = false;
  private readonly isTouch!: boolean;
  private readonly isMobile!: boolean;

  constructor() {
    this.isTouch = ('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0);
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  get isMobileWithoutHardwareKeyboard(): boolean {
    return this.isMobile && this.isTouch && !this.hasHardwareKeyboard;
  }
}

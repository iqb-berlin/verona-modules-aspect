import { Injectable } from '@angular/core';
import NoSleep from 'nosleep.js';
import { LogService } from 'player/modules/logging/services/log.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly isTouch!: boolean;
  private hasHardwareKeyboard: boolean = false;
  private noSleep!: NoSleep; // Cannot be instanced in a constructor, must be instanced by a user event

  constructor() {
    this.isTouch = (('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0));
  }

  dontSleep(): void {
    if (this.isTouch && (!this.noSleep || !this.noSleep.isEnabled )) {
      this.noSleep = new NoSleep();
      this.noSleep.enable().then(() => {},
        () => LogService.error('player: enabling noSleep instance failed'));
    }
  }

  get isMobileWithoutHardwareKeyboard(): boolean {
    return this.isTouch && !this.hasHardwareKeyboard;
  }

  registerHardwareKeyboard(): void {
    this.hasHardwareKeyboard = true;
  }
}

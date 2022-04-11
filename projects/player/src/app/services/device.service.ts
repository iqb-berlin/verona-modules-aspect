import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  isTouch!: boolean;

  constructor() {
    this.isTouch = (('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0));
  }
}

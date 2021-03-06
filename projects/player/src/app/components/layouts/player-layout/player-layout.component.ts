import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { KeypadService } from '../../../services/keypad.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { DeviceService } from '../../../services/device.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'aspect-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.css'],
  animations: [
    trigger('keypadSlideInOut', [
      transition(':enter', [
        style({ width: 0 }),
        animate(200, style({ width: '*' }))
      ]),
      transition(':leave', [
        animate(200, style({ width: 0 }))
      ])
    ]),
    trigger('keyboardSlideInOut', [
      transition(':enter', [
        style({ height: 0 }),
        animate(200, style({ height: '*' }))
      ]),
      transition(':leave', [
        animate(200, style({ height: 0 }))
      ])
    ])
  ]
})
export class PlayerLayoutComponent {
  isPlayerRunning: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    public keypadService: KeypadService,
    public keyboardService: KeyboardService,
    public deviceService: DeviceService
  ) { }

}

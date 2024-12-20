import { Component, OnDestroy } from '@angular/core';
import {
  animate, style, transition, trigger
} from '@angular/animations';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { KeypadService } from '../../../services/keypad.service';
import { KeyboardService } from '../../../services/keyboard.service';

@Component({
  selector: 'aspect-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.scss'],
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
export class PlayerLayoutComponent implements OnDestroy {
  isKeypadAnimationDisabled: boolean = false;
  isKeyboardAnimationDisabled: boolean = false;
  private isKeypadToggling: number = 0;
  private isKeyboardToggling: number = 0;
  private ngUnsubscribe = new Subject<void>();

  protected readonly window = window;

  constructor(
    public keypadService: KeypadService,
    public keyboardService: KeyboardService
  ) {
    this.keypadService.willToggle
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (!this.isKeypadToggling) {
          this.setIsKeypadToggling(); // to check whether there is a directly consecutive opening and closing
        } else {
          this.isKeypadAnimationDisabled = true;
        }
      });
    this.keyboardService.willToggle
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (!this.isKeyboardToggling) {
          this.setIsKeyboardToggling(); // to check whether there is a directly consecutive opening and closing
        } else {
          this.isKeyboardAnimationDisabled = true;
        }
      });
  }

  setIsKeypadToggling(): void {
    this.isKeypadToggling = window.setTimeout(() => {
      clearTimeout(this.isKeypadToggling);
      this.isKeypadToggling = 0;
      this.isKeypadAnimationDisabled = false;
    }, 200);
  }

  setIsKeyboardToggling(): void {
    this.isKeyboardToggling = window.setTimeout(() => {
      clearTimeout(this.isKeyboardToggling);
      this.isKeyboardToggling = 0;
      this.isKeyboardAnimationDisabled = false;
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.isKeypadToggling) clearTimeout(this.isKeypadToggling);
    if (this.isKeyboardToggling) clearTimeout(this.isKeyboardToggling);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

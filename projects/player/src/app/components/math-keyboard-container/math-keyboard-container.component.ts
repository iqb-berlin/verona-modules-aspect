import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';

@Component({
  selector: 'aspect-math-keyboard-container',
  standalone: true,
  imports: [],
  templateUrl: './math-keyboard-container.component.html',
  styleUrl: './math-keyboard-container.component.scss'
})
export class MathKeyboardContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mathKeyboard') mathKeyboard!: ElementRef;

  constructor(public mathKeyboardService: MathKeyboardService) {}

  ngAfterViewInit(): void {
    window.mathVirtualKeyboard.container = this.mathKeyboard.nativeElement;
    window.mathVirtualKeyboard.addEventListener('geometrychange', () => this.updateKeyboard());
  }

  updateKeyboard(): void {
    this.mathKeyboardService.keyboardHeight =
      window.mathVirtualKeyboard.boundingRect.height;
    if (this.mathKeyboardService.keyboardHeight) {
      setTimeout(() => this.mathKeyboardService.scrollElement());
    }
  }

  ngOnDestroy(): void {
    window.mathVirtualKeyboard.removeEventListener('geometrychange', () => this.updateKeyboard());
  }
}

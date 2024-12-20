import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MathfieldElement } from '@iqb/mathlive';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { IQB_MATH_KEYBOARD_LAYOUTS } from 'common/math-editor/keyboard-layout.config';

@Component({
  selector: 'aspect-math-input',
  template: `
    <mat-button-toggle-group *ngIf="enableModeSwitch"
                             [value]="mathFieldElement.mode"
                             (change)="setParseMode($event)">
      <mat-button-toggle value="math">Formel</mat-button-toggle>
      <mat-button-toggle value="text">Text</mat-button-toggle>
    </mat-button-toggle-group>
    <div #inputRef
         (input)="onInput()"
         [class.full-width]="fullWidth"
         [class.inline-block]="!fullWidth"
         [class.read-only]="readonly"
         (focusin)="onFocusIn()"
         (focusout)="onFocusOut()">
    </div>
  `,
  styles: [`
    mat-button-toggle-group {
      height: auto;
    }
    :host ::ng-deep .full-width math-field {
      display: block;
    }

    .inline-block{
      display: inline-block;
    }

    :host ::ng-deep  math-field::part(virtual-keyboard-toggle) {
      display: none;
    }
    :host ::ng-deep math-field::part(menu-toggle) {
      display: none;
    }
    :host ::ng-deep .read-only math-field {
      outline: unset;
      border: unset;
    }
    :host ::ng-deep .mat-button-toggle-label-content {
      line-height: unset;
    }`
  ]
})
export class MathInputComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<MathfieldElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<MathfieldElement> = new EventEmitter();
  @ViewChild('inputRef') inputRef!: ElementRef;

  protected readonly window = window;
  private readonly mathKeyboardLayout = IQB_MATH_KEYBOARD_LAYOUTS;

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  constructor(public elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupMathField();
    this.setKeyboardLayout();
    MathInputComponent.setupMathKeyboard();
  }

  private setupMathField(): void {
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.value = this.value;
    this.mathFieldElement.readOnly = this.readonly;
    setTimeout(() => {
      this.mathFieldElement.menuItems = [];
    }); // Disable context menu
  }

  private static setupMathKeyboard(): void {
    window.mathVirtualKeyboard.addEventListener('virtual-keyboard-layer-change', () => MathInputComponent.resetShift());
  }

  private static resetShift(): void {
    window.mathVirtualKeyboard.shiftPressCount = 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.mathFieldElement.setValue(changes.value.currentValue, { mode: 'text' });
    }
  }

  // eslint-disable-next-line
  setFocus(offset?: number): void {
    this.mathFieldElement.focus();
  }

  setParseMode(event: MatButtonToggleChange) {
    this.mathFieldElement.mode = event.value;
    (this.inputRef.nativeElement.childNodes[0] as HTMLElement).focus();
  }

  onInput() {
    this.valueChange.emit(this.mathFieldElement.getValue());
  }

  onFocusIn() {
    // give iqb keyboard time to animate
    setTimeout(() => {
      this.focusIn.emit(this.mathFieldElement);
      window.mathVirtualKeyboard.show({ firstLayer: true, resetShift: true });
    }, 250);
  }

  private setKeyboardLayout(): void {
    window.mathVirtualKeyboard.layouts = [
      this.mathKeyboardLayout.iqbNumeric,
      this.mathKeyboardLayout.iqbSymbols,
      this.mathKeyboardLayout.iqbText,
      this.mathKeyboardLayout.iqbGreek
    ];
  }

  onFocusOut() {
    this.focusOut.emit(this.mathFieldElement);
    window.mathVirtualKeyboard.hide();
  }

  // eslint-disable-next-line class-methods-use-this
  ngOnDestroy(): void {
    window.mathVirtualKeyboard
      .removeEventListener('virtual-keyboard-layer-change', () => MathInputComponent.resetShift());
  }
}

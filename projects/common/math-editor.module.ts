// eslint-disable-next-line max-classes-per-file
import {
  NgModule, CUSTOM_ELEMENTS_SCHEMA,
  Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathfieldElement } from 'mathlive';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

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
         (focusin)="onFocusIn($event)"
         (focusout)="onFocusOut($event)">
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
export class MathInputComponent implements AfterViewInit, OnChanges {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<FocusEvent> = new EventEmitter();
  @Output() focusOut: EventEmitter<FocusEvent> = new EventEmitter();
  @ViewChild('inputRef') inputRef!: ElementRef;
  @ViewChild('container') container!: ElementRef;

  protected readonly window = window;

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  constructor(public elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.setupMathfield();
  }

  private setupMathfield(): void {
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.value = this.value;
    this.mathFieldElement.readOnly = this.readonly;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.mathFieldElement.setValue(changes.value.currentValue, { mode: 'text' });
    }
  }

  setFocus(offset?: number): void {
    this.mathFieldElement.focus();
  }

  setParseMode(event: MatButtonToggleChange) {
    // TODO Keyboard moving up and down on focus loss may be avoided by using useSharedVirtualKeyboard
    this.mathFieldElement.mode = event.value;
    (this.inputRef.nativeElement.childNodes[0] as HTMLElement).focus();
  }

  getMathMLValue(): string {
    return this.mathFieldElement.getValue('math-ml');
  }

  onInput() {
    this.valueChange.emit(this.mathFieldElement.getValue());
  }

  onFocusIn(event: FocusEvent) {
    this.focusIn.emit(event);
    window.mathVirtualKeyboard.show();
  }

  onFocusOut(event: FocusEvent) {
    window.mathVirtualKeyboard.hide();
    this.focusOut.emit(event);
  }
}

@NgModule({
  declarations: [
    MathInputComponent
  ],
  imports: [
    CommonModule,
    MatButtonToggleModule
  ],
  exports: [
    MathInputComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MathEditorModule {}

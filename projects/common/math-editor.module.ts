// eslint-disable-next-line max-classes-per-file
import {
  NgModule, CUSTOM_ELEMENTS_SCHEMA,
  Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathfieldElement } from '@iqb/mathlive';
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
export class MathInputComponent implements AfterViewInit, OnChanges {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<MathfieldElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<MathfieldElement> = new EventEmitter();
  @ViewChild('inputRef') inputRef!: ElementRef;
  @ViewChild('container') container!: ElementRef;

  protected readonly window = window;

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  constructor(public elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    this.setupMathField();
  }

  private setupMathField(): void {
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.value = this.value;
    this.mathFieldElement.readOnly = this.readonly;
    setTimeout(() => { this.mathFieldElement.menuItems = []; }); // Disable context menu
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
    this.focusIn.emit(this.mathFieldElement);
    window.mathVirtualKeyboard.show();
  }

  onFocusOut() {
    this.focusOut.emit(this.mathFieldElement);
    window.mathVirtualKeyboard.hide();
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

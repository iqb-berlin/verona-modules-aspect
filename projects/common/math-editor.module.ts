// eslint-disable-next-line max-classes-per-file
import {
  NgModule, CUSTOM_ELEMENTS_SCHEMA,
  Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathfieldElement, VirtualKeyboardLayout } from 'mathlive';
// import { VirtualKeyboardLayer } from 'mathlive/dist/public/options';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { KeyboardLayouts } from 'common/math-editor/keyboard-layouts';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'aspect-mathlive-math-field',
  template: `
    <mat-button-toggle-group *ngIf="enableModeSwitch"
                             [value]="mathFieldElement.mode"
                             (change)="setParseMode($event)">
      <mat-button-toggle value="math">Formel</mat-button-toggle>
      <mat-button-toggle value="text">Text</mat-button-toggle>
    </mat-button-toggle-group>
    <div #mathfield [class.read-only]="readonly">
    </div>
  `,
  styles: [`
    mat-button-toggle-group {
      height: auto;
    }
    :host ::ng-deep .read-only math-field {
      outline: unset; border: unset;
    }
    :host ::ng-deep .mat-button-toggle-label-content {
      line-height: unset;
    }`
  ]
})
export class MathInputComponent implements AfterViewInit, OnChanges {
  @Input() value!: string;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @ViewChild('mathfield') mathfieldRef!: ElementRef;
  mathFieldElement: MathfieldElement;

  constructor() {
    this.mathFieldElement = new MathfieldElement();
    MathfieldElement.keypressSound = null;
    MathfieldElement.plonkSound = null;
    MathfieldElement.decimalSeparator = ',';
    window.mathVirtualKeyboard.alphabeticLayout = 'qwertz';
    window.mathVirtualKeyboard.layouts = [
      KeyboardLayouts.createFormulaKeyboardLayout(),
      KeyboardLayouts.createAlphabeticKeyboardLayout(),
      KeyboardLayouts.createGreekKeyboardLayout(),
      'alphabetic'
    ];
    console.log('window.mathVirtualKeyboard.layouts', window.mathVirtualKeyboard);
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        console.log('bla', event);
        if ((event as MessageEvent).data.type === 'mathlive#virtual-keyboard-message' &&
          (event as MessageEvent).data.action === 'execute-command') {
          console.log('yooo');
        }
      });
  }

  ngAfterViewInit(): void {
    this.setupMathfield();
  }

  setupMathfield(): void {
    this.mathfieldRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.value = this.value;
    this.mathFieldElement.readOnly = this.readonly;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.mathFieldElement.setValue(changes.value.currentValue, { mode: 'text' });
    }
  }

  setParseMode(event: MatButtonToggleChange) {
    // TODO Keyboard moving up and down on focus loss may be avoided by using useSharedVirtualKeyboard
    this.mathFieldElement.mode = event.value;
    (this.mathfieldRef.nativeElement.childNodes[0] as HTMLElement).focus();
  }

  getMathMLValue(): string {
    return this.mathFieldElement.getValue('math-ml');
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

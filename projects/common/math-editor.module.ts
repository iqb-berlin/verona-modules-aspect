// eslint-disable-next-line max-classes-per-file
import {
  NgModule, CUSTOM_ELEMENTS_SCHEMA,
  Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathfieldElement, VirtualKeyboardDefinition } from 'mathlive';
import { VirtualKeyboardLayer } from 'mathlive/dist/public/options';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'aspect-mathlive-math-field',
  template: `
    <mat-button-toggle-group *ngIf="enableModeSwitch"
                             [value]="mathFieldElement.mode"
                             (change)="setParseMode($event)">
      <mat-button-toggle value="math">Formel</mat-button-toggle>
      <mat-button-toggle value="text">Text</mat-button-toggle>
    </mat-button-toggle-group>
    <div #mathfield>
    </div>
  `,
  styles: [
    'mat-button-toggle-group {height: 20px;}',
    ':host ::ng-deep .mat-button-toggle-label-content {line-height: unset}'
  ]
})
export class MathInputComponent implements AfterViewInit, OnChanges {
  @Input() value!: string;
  @Input() enableModeSwitch: boolean = false;
  @ViewChild('mathfield') mathfieldRef!: ElementRef;

  mathFieldElement: MathfieldElement = new MathfieldElement({
    virtualKeyboardMode: 'onfocus',
    customVirtualKeyboardLayers: MathInputComponent.setupKeyboadLayer(),
    customVirtualKeyboards: MathInputComponent.setupKeyboard(),
    virtualKeyboards: 'aspect-keyboard roman greek',
    keypressSound: null,
    plonkSound: null,
    decimalSeparator: ',',
    // defaultMode: 'math'
  });

  ngAfterViewInit(): void {
    this.setupMathfield();
  }

  setupMathfield(): void {
    this.mathfieldRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.value = this.value;
  }

  static setupKeyboard(): Record<string, VirtualKeyboardDefinition> {
    return {
      'aspect-keyboard': {
        label: 'Formel', // Label displayed in the Virtual Keyboard Switcher
        tooltip: 'Zahlen & Formeln', // Tooltip when hovering over the label
        layer: 'aspect-keyboard-layer'
      }
    };
  }

  static setupKeyboadLayer(): Record<string, string | Partial<VirtualKeyboardLayer>> {
    return {
      'aspect-keyboard-layer': {
        styles: '',
        rows: [
          [
            { label: '7', key: '7' },
            { label: '8', key: '8' },
            { label: '9', key: '9' },
            { class: 'separator w5' },
            { latex: '+' },
            { class: 'separator w5' },
            { latex: '<' },
            { latex: '>' },
            { latex: '\\neq' },
            { class: 'separator w5' },
            { latex: '€' },
            { class: 'separator w5' },
            { label: '<span><i>x</i>&thinsp;²</span>', insert: '$$#@^{2}$$' },
            { latex: '$$#@^{#?}' },
            { latex: '$$#@_{#?}' }
          ],
          [
            { label: '4', latex: '4' },
            { label: '5', key: '5' },
            { label: '6', key: '6' },
            { class: 'separator w5' },
            { latex: '-' },
            { class: 'separator w5' },
            { latex: '\\le' },
            { latex: '\\ge' },
            { latex: '\\approx' },
            { class: 'separator w5' },
            { latex: '\\%' },
            { class: 'separator w5' },
            { class: 'small', latex: '\\frac{#0}{#0}' },
            { latex: '\\sqrt{#0}', insert: '$$\\sqrt{#0}$$' },
            { class: 'separator' }
          ],
          [
            { label: '1', key: '1' },
            { label: '2', key: '2' },
            { label: '3', key: '3' },
            { class: 'separator w5' },
            { latex: '\\times' },
            { class: 'separator w5' },
            { latex: '(' },
            { latex: ')' },
            { latex: '\\Rightarrow' },
            { class: 'separator w5' },
            { latex: '°' },
            { class: 'separator w5' },
            { latex: '\\overline' },
            { class: 'separator' },
            { class: 'separator' }
          ],
          [
            { label: '0', key: '0' },
            { latex: ',' },
            { latex: '=' },
            { class: 'separator w5' },
            { latex: '\\div' },
            { class: 'separator w5' },
            { latex: '[' },
            { latex: ']' },
            { latex: '\\Leftrightarrow' },
            { class: 'separator w5' },
            { latex: '\\mid' },
            { class: 'separator w5' },
            {
              class: 'action',
              label: "<svg><use xlink:href='#svg-arrow-left' /></svg>",
              // command: ['performWithFeedback', 'moveToPreviousChar']
              // command: ['performWithFeedback', 'moveToPreviousChar']
              command: ['switchMode', 'math',
                '\\frac{#0}{#0}']
              // command: ['insert', '\\frac{#0}{#0}']
            },
            {
              class: 'action',
              label: "<svg><use xlink:href='#svg-arrow-right' /></svg>",
              // command: ['performWithFeedback', 'moveToNextChar']
              command: ['switchMode', 'math']
            },
            {
              class: 'action font-glyph bottom right',
              label: '&#x232b;',
              // ifMode: 'math',
              command: ['performWithFeedback', 'deleteBackward']
              // command: ['insert', '\\sqrt{#0}', { format: 'latex' }]
            }
          ]
        ]
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.mathFieldElement.setValue(changes.value.currentValue, { mode: 'text' });
  }

  setParseMode(event: MatButtonToggleChange) {
    // TODO Keyboard moving up and down on focus loss may be avoided by using useSharedVirtualKeyboard
    this.mathFieldElement.mode = event.value;
    (this.mathfieldRef.nativeElement.childNodes[0] as HTMLElement).focus();
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

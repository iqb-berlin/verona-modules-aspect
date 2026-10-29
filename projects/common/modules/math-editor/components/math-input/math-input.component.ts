import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MathfieldElement } from '@iqb/mathlive';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FORMULA_KEYBOARD_PRESETS } from 'common/modules/math-editor/configs/formula-keyboard-presets.config';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';

@Component({
  selector: 'aspect-math-input',
  templateUrl: './math-input.component.html',
  styleUrls: ['./math-input.component.scss'],
  standalone: false
})
export class MathInputComponent implements AfterViewInit, OnChanges {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Input() mathKeyboardPresets: MathKeyboardPreset[] = [];
  @Input() placeholder: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<MathfieldElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<MathfieldElement> = new EventEmitter();
  @ViewChild('inputRef') inputRef!: ElementRef;

  protected readonly window = window;

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  /** Held so that the two focusout events of one blur -- the browser's and mathlive's own -- are acted on once. */
  private focusOutTimeout?: ReturnType<typeof setTimeout>;

  constructor(public elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupMathField();
    MathInputComponent.setupMathKeyboard();
  }

  private setupMathField(): void {
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.readOnly = this.readonly;
    this.mathFieldElement.placeholder = this.placeholder;
    this.mathFieldElement.setValue(this.value || '', { format: 'latex' });
    setTimeout(() => {
      this.mathFieldElement.menuItems = [];
    }); // Disable context menu
  }

  /** Static and held, so the keyboard registers it exactly once no matter how many math inputs a unit
     has: mathlive keeps its listeners in a Set, and the fresh arrow this used to pass grew that Set by
     one entry per component, each firing resetShift again on every layer change. No component leaked
     with it -- the arrow calls a static and captures no `this` -- which is why this half of #1123 is
     the harmless one. */
  private static readonly onLayerChange = (): void => MathInputComponent.resetShift();

  private static setupMathKeyboard(): void {
    window.mathVirtualKeyboard.addEventListener('virtual-keyboard-layer-change', MathInputComponent.onLayerChange);
  }

  private static resetShift(): void {
    window.mathVirtualKeyboard.shiftPressCount = 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && !changes.value.firstChange &&
      changes.value.currentValue !== this.mathFieldElement.getValue()) {
      this.mathFieldElement.setValue(changes.value.currentValue, { format: 'latex' });
    }
    if (changes.placeholder && this.mathFieldElement) {
      this.mathFieldElement.placeholder = changes.placeholder.currentValue;
    }
    if (changes.readonly && this.mathFieldElement) {
      this.mathFieldElement.readOnly = changes.readonly.currentValue;
    }
  }

  // eslint-disable-next-line
  setFocus(offset?: number): void {
    this.mathFieldElement.focus();
  }

  setParseMode(event: MatButtonToggleChange) {
    this.mathFieldElement.mode = event.value;
    this.mathFieldElement.focus();
    if (event.value === 'math') {
      // Exit any current group (like \text{}) to allow formula entry
      this.mathFieldElement.executeCommand('moveAfterParent');
    }
  }

  onInput() {
    this.valueChange.emit(this.mathFieldElement.getValue());
  }

  onFocusIn() {
    this.updateKeyboardLayout();
    this.focusIn.emit(this.mathFieldElement);
    window.mathVirtualKeyboard.show({ firstLayer: true, resetShift: true });
  }

  /** Assigns the layouts only when they differ from the keyboard's: mathlive rebuilds the keyboard on
      every assignment, with new layer IDs, and so drops back to the first layer. On the iPad the focus
      bounces back into the field after every key tap, and the layout jumped back to the first one
      after each character (#1600). */
  private updateKeyboardLayout(): void {
    const layouts = [
      ...(this.mathKeyboardPresets.includes('physics') ? [FORMULA_KEYBOARD_PRESETS.iqbPhysics] : []),
      ...(this.mathKeyboardPresets.includes('math') ? [FORMULA_KEYBOARD_PRESETS.iqbNumeric] : []),
      ...(this.mathKeyboardPresets.includes('symbols') ? [FORMULA_KEYBOARD_PRESETS.iqbSymbols] : []),
      ...(this.mathKeyboardPresets.includes('latin') ? [FORMULA_KEYBOARD_PRESETS.iqbText] : []),
      ...(this.mathKeyboardPresets.includes('greek') ? [FORMULA_KEYBOARD_PRESETS.iqbGreek] : [])
    ];
    const currentLayouts = window.mathVirtualKeyboard.layouts;
    if (currentLayouts.length === layouts.length &&
      layouts.every((layout, index) => currentLayouts[index] === layout)) return;
    window.mathVirtualKeyboard.layouts = layouts;
  }

  onFocusOut(event: FocusEvent) {
    /* On the iPad every tap on a key of the formula keyboard takes the focus away from the field for
       a moment, without a relatedTarget, and the field has it back at once. Closing the keyboard on
       that focusout closed it after every character, and since mathlive still counted the field as
       focused, tapping it again opened nothing (#1600). Such a focusout, and one into the keyboard
       itself, is therefore only acted on when the field has not got its focus back a moment later.
       One that names another element as the new focus is acted on at once as before. */
    if (event.relatedTarget && !MathInputComponent.isInsideMathKeyboard(event.relatedTarget)) {
      this.focusOut.emit(this.mathFieldElement);
      window.mathVirtualKeyboard.hide();
      return;
    }
    clearTimeout(this.focusOutTimeout);
    this.focusOutTimeout = setTimeout(() => {
      const focusedElement = this.mathFieldElement.ownerDocument.activeElement;
      if (focusedElement === this.mathFieldElement) return;
      this.focusOut.emit(this.mathFieldElement);
      this.hideKeyboardUnlessMathFieldFocused();
    });
  }

  /** A field that has the focus by now has already shown the keyboard for itself -- the focus out of the
      field left behind can arrive after it, mathlive's own focusout as well. */
  private hideKeyboardUnlessMathFieldFocused(): void {
    if (!(this.mathFieldElement.ownerDocument.activeElement instanceof MathfieldElement)) {
      window.mathVirtualKeyboard.hide();
    }
  }

  private static isInsideMathKeyboard(target: EventTarget): boolean {
    return target instanceof Element && !!target.closest('.ML__keyboard');
  }

  /* No teardown for the layer-change listener, deliberately: it belongs to the window-wide keyboard
     singleton, not to one component, and the single shared registration means the first math input
     destroyed would otherwise take shift-reset away from every one still on the page. It never was
     removed -- the removeEventListener here matched nothing -- so nothing regresses by saying so. */
}

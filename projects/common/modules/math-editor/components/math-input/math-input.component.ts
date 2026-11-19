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
import { MathfieldElement, ParseMode } from 'mathlive';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FORMULA_KEYBOARD_PRESETS } from 'common/modules/math-editor/configs/formula-keyboard-presets.config';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';
import { MathKeyboardAdapter } from 'common/modules/math-editor/utils/math-keyboard-adapter';

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
  /** Lets Enter start a new line and wraps text that is too long for one; a formula stays on one line.
      MathLive adds a row only inside a multi-line environment, so the field gets its value wrapped in
      `\displaylines{}`; MathLive drops the wrapper again from a value of one line, which is therefore
      stored as before. Wrapping is display only: it changes nothing in the value. */
  @Input() multiline: boolean = false;
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() focusIn: EventEmitter<MathfieldElement> = new EventEmitter();
  @Output() focusOut: EventEmitter<MathfieldElement> = new EventEmitter();
  @ViewChild('inputRef') inputRef!: ElementRef;

  protected readonly window = window;

  /** MathLive keeps its content on one line (`nowrap`, `width: min-content`) and lets it scroll sideways.
      These rules let text wrap at its spaces, at the field's width (`width: auto`). A formula stays in
      one piece: a break between the boxes MathLive builds it from would part an exponent from its base,
      a unit from its number, and the inside of a root or a fraction. For the same reason only text
      directly in a line wraps, not text inside a fraction or a root. A formula wider than the field runs
      out of it sideways, and the field then scrolls sideways as a whole, with all its lines.
      Each line is capped at the field's width (`100cqw` of the content, which is made the container):
      the boxes MathLive lays around the lines grow to their widest content, so a formula that does not
      fit would widen them all, and text beside or below it would wrap only past the field's edge.
      The rules rest on MathLive's internal classes and markup and go into its shadow root, which no
      stylesheet outside reaches.
      The rows of `\displaylines` (the lines made with Enter) are boxes of a height MathLive measured for
      one line, hung from their baseline; a wrapped row would grow upwards out of the field and over the
      row above. So those rows -- and only they, by child selectors, not the fractions or exponents
      inside them, which are built the same way -- are laid out as plain blocks of their own height.
      The two struts beside the block are left out as well: MathLive sizes them for unwrapped rows, and
      below the last row they added most of a line of empty space. */
  private static readonly WRAP_STYLE = MathInputComponent.createWrapStyle();

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  /** The mode the field was in when Enter was pressed. MathLive starts every new line in math mode,
      where a space is not typed at all; a line of text is to be followed by another one. */
  private modeBeforeEnter?: ParseMode;

  /** Whether MathLive has built the field before, see `onMount`. */
  private mountedBefore = false;

  /** Held so that the two focusout events of one blur -- the browser's and mathlive's own -- are acted on once. */
  private focusOutTimeout?: ReturnType<typeof setTimeout>;

  constructor(public elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupMathField();
    MathKeyboardAdapter.listen();
  }

  private setupMathField(): void {
    // Before the field joins the page, so that its first mount is heard as well.
    this.mathFieldElement.addEventListener('mount', this.onMount);
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.readOnly = this.readonly;
    this.mathFieldElement.placeholder = this.placeholder;
    if (this.multiline) {
      this.addWrapStyle();
      // Captured before MathLive adds the line, and back here after it, in the same keydown: the
      // next character may follow at once.
      this.mathFieldElement.addEventListener('keydown', event => {
        if (event.key === 'Enter') this.modeBeforeEnter = this.mathFieldElement.mode;
      }, { capture: true });
      this.mathFieldElement.addEventListener('keydown', event => {
        if (event.key === 'Enter' && this.modeBeforeEnter === 'text') this.mathFieldElement.mode = 'text';
      });
    }
    this.mathFieldElement.setValue(this.toFieldValue(this.value), { format: 'latex' });
    this.mathFieldElement.addEventListener('pointerdown', this.onFramePointerDown);
  }

  /** MathLive builds the field each time it joins the page: the first time, possibly later than the
      setup, and anew after every move in the page, as in a drag in the editor. Its context menu is
      switched off then, as the menu exists only while the field is on the page and setting it before
      throws. A field built anew comes from what MathLive kept of the old one, which is the value as
      text, and the text of one line has no `\displaylines`: a multi-line field gets it back, or Enter
      starts no new line. The first build keeps the value the setup gave it. */
  private readonly onMount = (): void => {
    this.mathFieldElement.menuItems = [];
    if (this.multiline && this.mountedBefore) {
      this.mathFieldElement.setValue(this.toFieldValue(this.mathFieldElement.getValue()), { format: 'latex' });
    }
    this.mountedBefore = true;
  };

  /** A press on the field's own frame -- its padding and border -- or on MathLive's container around
      its content reaches MathLive, which counts the field as focused but leaves the browser's focus
      where it was: no cursor, no keyboard. The fork (`@iqb/mathlive`) focused the field there (#1648).
      So the focus is moved here, on the element itself, which hands it on into the field
      (`delegatesFocus`); `MathfieldElement.focus()` would do nothing, as MathLive already counts the
      field as focused. The place is told by the element first hit: `target` names the field for a
      press anywhere in it. The container matters for a multi-line field, whose container reaches up to
      where a single-line field has its frame. */
  private readonly onFramePointerDown = (event: PointerEvent): void => {
    const field = this.mathFieldElement;
    const pressed = event.composedPath()[0];
    const outsideContent = pressed === field || (pressed instanceof Element && pressed.matches('[part=container]'));
    if (!outsideContent || field.ownerDocument.activeElement === field) return;
    HTMLElement.prototype.focus.call(field, { preventScroll: true });
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && !changes.value.firstChange &&
      changes.value.currentValue !== this.mathFieldElement.getValue()) {
      this.mathFieldElement.setValue(this.toFieldValue(changes.value.currentValue), { format: 'latex' });
    }
    if (changes.placeholder && this.mathFieldElement) {
      this.mathFieldElement.placeholder = changes.placeholder.currentValue;
    }
    if (changes.readonly && this.mathFieldElement) {
      this.mathFieldElement.readOnly = changes.readonly.currentValue;
    }
  }

  private static createWrapStyle(): string {
    const row = '.ML__multiline_environment > .col-align-l > .ML__vlist-t > .ML__vlist-r';
    const line = `${row} > .ML__vlist > span > span`;
    const struts = '.ML__latex:has(> .ML__multiline_environment) > :is(.ML__strut, .ML__strut--bottom)';
    return `
      .ML__latex, .ML__base { width: auto !important; }
      .ML__content { container-type: inline-size; }
      ${line} > .ML__text { white-space: pre-wrap !important; }
      ${row} > .ML__vlist { height: auto !important; }
      ${row} > .ML__vlist > span { position: static !important; display: block !important; height: auto !important; }
      ${row} > .ML__vlist > span + span { margin-top: 0.2em; }
      ${row} > .ML__vlist > span > .ML__pstrut { display: none !important; }
      ${line} { height: auto !important; max-width: 100cqw; }
      ${row}:not(:first-child) { display: none !important; }
      ${struts} { display: none !important; }`;
  }

  /** A `<style>` of its own per field rather than one shared constructed sheet: `new CSSStyleSheet()`
      throws in Safari before 16.4, and would take every math input down with it. */
  private addWrapStyle(): void {
    const style = this.mathFieldElement.ownerDocument.createElement('style');
    style.textContent = MathInputComponent.WRAP_STYLE;
    this.mathFieldElement.shadowRoot?.appendChild(style);
  }

  private toFieldValue(value: string | undefined): string {
    if (!this.multiline || value?.startsWith('\\displaylines{')) return value || '';
    return `\\displaylines{${value || ''}}`;
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
    MathKeyboardAdapter.open();
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
    const currentLayouts = MathKeyboardAdapter.keyboard.layouts;
    if (currentLayouts.length === layouts.length &&
      layouts.every((layout, index) => currentLayouts[index] === layout)) return;
    MathKeyboardAdapter.keyboard.layouts = layouts;
  }

  onFocusOut(event: FocusEvent) {
    /* On the iPad every tap on a key of the formula keyboard takes the focus away from the field for
       a moment, without a relatedTarget, and the field has it back at once. Closing the keyboard on
       that focusout closed it after every character, and since mathlive still counted the field as
       focused, tapping it again opened nothing (#1600). Such a focusout, and one into the keyboard
       itself, is therefore only acted on when the field has not got its focus back a moment later.
       One that names another element as the new focus is acted on at once as before. */
    if (event.relatedTarget && !MathKeyboardAdapter.contains(event.relatedTarget)) {
      this.focusOut.emit(this.mathFieldElement);
      MathKeyboardAdapter.keyboard.hide();
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
      MathKeyboardAdapter.keyboard.hide();
    }
  }
}

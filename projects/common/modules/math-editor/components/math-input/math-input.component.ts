import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MathfieldElement, ParseMode } from 'mathlive';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';
import { MathKeyboardAdapter } from 'common/modules/math-editor/utils/math-keyboard-adapter';
import { MathKeyboardLayouts } from 'common/modules/math-editor/utils/math-keyboard-layouts';
import { EmptyBoxRestorer } from 'common/modules/math-editor/utils/empty-box-restorer';

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

  /** The input shortcuts of the field, in place of MathLive's own table of 259, which turned what was
      typed on a physical keyboard into something else: nn into ∩, mm into the unit millimetre, sin into
      the function, <= into ≤ (#760). The formula keyboard never triggered them, as MathLive clears the
      keys it collects for a shortcut after every key pressed on it; typed keys now stay as typed as well.
      The one shortcut kept gives `*` the multiplication sign of the formula keyboard's × key. */
  private static readonly INLINE_SHORTCUTS = { '*': '\\cdot' };

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  /** The mode the field was in when Enter was pressed. MathLive starts every new line in math mode,
      where a space is not typed at all; a line of text is to be followed by another one. */
  private modeBeforeEnter?: ParseMode;

  /** Whether MathLive has built the field before, see `onMount`. */
  private mountedBefore = false;

  /** How many boxes the field held before the change under way, see `onInput`. MathLive announces a change
      before it makes it (`beforeinput`) and after it only one turn of the event loop later (`input`). */
  private boxesBeforeInput = 0;

  /** Whether a change made in text mode is under way, see `onModeChange`. */
  private textInputUnderway = false;

  /** Held so that the two focusout events of one blur -- the browser's and mathlive's own -- are acted on once. */
  private focusOutTimeout?: ReturnType<typeof setTimeout>;

  constructor(public elementRef: ElementRef, private ngZone: NgZone) {}

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
      this.addShadowStyle(MathInputComponent.WRAP_STYLE);
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
    this.mathFieldElement.addEventListener('mode-change', this.onModeChange);
    this.mathFieldElement.addEventListener('selection-change', this.endTextInput);
  }

  /** In a field whose input mode can be switched, what is typed or inserted in text mode leaves the field in
      text mode (#1692): the keys of the formula keyboard but the letters insert formulas, and MathLive then
      put the field into formula mode, so that after an α the switch showed Formel and further letters
      became variables. MathLive announces a change before it makes it (`beforeinput`, see `onBeforeInput`)
      and lets a change of mode be called off. The cursor moved into a formula makes no change, and its
      change of mode goes through. */
  private readonly onModeChange = (event: Event): void => {
    if (this.textInputUnderway) event.preventDefault();
  };

  /** MathLive announces the selection of a change last, after the change of mode it brings. */
  private readonly endTextInput = (): void => {
    this.textInputUnderway = false;
  };

  /** MathLive builds the field each time it joins the page: the first time, possibly later than the
      setup, and anew after every move in the page, as in a drag in the editor. Its context menu is
      switched off then and its input shortcuts are replaced, as both exist only while the field is on
      the page and setting them before throws; MathLive keeps neither across a move, and takes the
      shortcuts as a constructor option only with a warning. A field built anew comes from what
      MathLive kept of the old one, which is the value as text, and the text of one line has no
      `\displaylines`: a multi-line field gets it back, or Enter starts no new line. The first build
      keeps the value the setup gave it. */
  private readonly onMount = (): void => {
    this.mathFieldElement.menuItems = [];
    this.mathFieldElement.inlineShortcuts = MathInputComponent.INLINE_SHORTCUTS;
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

  /** Rules for MathLive's shadow root, which no stylesheet outside reaches. A `<style>` of its own per field
      rather than one shared constructed sheet: `new CSSStyleSheet()` throws in Safari before 16.4, and
      would take every math input down with it. */
  private addShadowStyle(rules: string): void {
    const style = this.mathFieldElement.ownerDocument.createElement('style');
    style.textContent = rules;
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

  /** The keyboard turns to the tab of the new mode (#1692) here, not on the focus: Safari leaves the focus
      in the field when the switch is pressed, so no focusin follows. A closed keyboard opens on it. */
  setParseMode(event: MatButtonToggleChange) {
    this.mathFieldElement.mode = event.value;
    this.mathFieldElement.focus();
    if (event.value === 'math') {
      // Exit any current group (like \text{}) to allow formula entry
      this.mathFieldElement.executeCommand('moveAfterParent');
    }
    MathKeyboardAdapter.showLayout(this.openingIndex());
  }

  /** Also marks something typed or inserted in text mode for `onModeChange`, until MathLive announces its
      selection (`endTextInput`). A change that ends without one is unmarked on the next turn of the event
      loop; not on the next microtask, which zone.js runs as soon as this listener returns, before the change
      is made. A deletion is not marked: it takes the field into formula mode where it ends in a formula, as
      before, and the box a root or fraction gets back after it is a formula's (`onInput`). */
  onBeforeInput(event: Event) {
    this.boxesBeforeInput = EmptyBoxRestorer.countBoxes(this.mathFieldElement);
    this.textInputUnderway = this.enableModeSwitch && this.mathFieldElement.mode === 'text' &&
      !MathInputComponent.isDeletion(event);
    if (this.textInputUnderway) {
      this.ngZone.runOutsideAngular(() => setTimeout(this.endTextInput));
    }
  }

  /** After a deletion, a root or fraction that was emptied gets its box back before the value goes out
      (#760). */
  onInput(event: Event) {
    if (MathInputComponent.isDeletion(event)) {
      EmptyBoxRestorer.restore(this.mathFieldElement, this.boxesBeforeInput);
    }
    this.valueChange.emit(this.mathFieldElement.getValue());
  }

  /** Whether MathLive's `beforeinput` or `input` is of a deletion. Safari strips `inputType` from the event,
      so MathLive also hands it on as `data`. */
  private static isDeletion(event: Event): boolean {
    return event instanceof InputEvent && (event.inputType || event.data || '').startsWith('delete');
  }

  /** A keyboard that was closed opens on the tab of `openingIndex`; one that is open keeps its tab, see
      `MathKeyboardAdapter.open`. */
  onFocusIn() {
    this.updateKeyboardLayout();
    this.focusIn.emit(this.mathFieldElement);
    MathKeyboardAdapter.open(this.openingIndex());
  }

  /** The tab the keyboard opens on, and turns to when the switch is pressed: in a field whose input mode
      can be switched the one of the mode (#1692), the first otherwise. Typing, moving the cursor and undo
      leave the tab as it is, so that a tab the student chose stays. */
  private openingIndex(): number {
    if (!this.enableModeSwitch) return 0;
    const mode = this.mathFieldElement.mode === 'text' ? 'text' : 'math';
    return MathKeyboardLayouts.openingIndex(this.mathKeyboardPresets, mode);
  }

  /** Assigns the layouts only when they differ from the keyboard's: mathlive rebuilds the keyboard on
      every assignment, with new layer IDs, and so drops back to the first layer. On the iPad the focus
      bounces back into the field after every key tap, and the layout jumped back to the first one
      after each character (#1600). */
  private updateKeyboardLayout(): void {
    const layouts = MathKeyboardLayouts.select(this.mathKeyboardPresets);
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

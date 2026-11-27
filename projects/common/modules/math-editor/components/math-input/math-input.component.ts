import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
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
export class MathInputComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Input() mathKeyboardPresets: MathKeyboardPreset[] = [];
  @Input() placeholder: string = '';
  /** Lets Enter start a new line in text mode (`onBeforeInput`) and wraps text that is too long for one; a
      formula stays on one line.
      MathLive adds a row only inside a multi-line environment, so the field gets its value wrapped in
      `\displaylines{}`; MathLive drops the wrapper again from a value of one line, which is therefore
      stored as before. Wrapping is display only: it changes nothing in the value. The letters of the
      formula keyboard get an Enter key for text mode (#1696). Can change after the setup: the editor
      switches it on the field it shows. */
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

  /** The commands of MathLive's keyboard shortcuts that add a line in formula mode, Ctrl+Enter and Alt+Enter
      among them. They add it directly, without the line break that `onBeforeInput` lets through only in text
      mode, and are taken out of the field's shortcuts (#1696). */
  private static readonly ROW_COMMANDS: readonly string[] = ['addRowAfter', 'addRowBefore'];

  mathFieldElement: MathfieldElement = new MathfieldElement({
    mathVirtualKeyboardPolicy: 'manual'
  });

  /** The rules of `WRAP_STYLE` in MathLive's shadow root, while the field is multi-line. */
  private wrapStyle?: HTMLStyleElement;

  /** Whether MathLive has built the field before, see `onMount`. */
  private mountedBefore = false;

  /** How many boxes the field held before the change under way, see `onInput`. MathLive announces a change
      before it makes it (`beforeinput`) and after it only one turn of the event loop later (`input`). */
  private boxesBeforeInput = 0;

  /** Whether a change made in text mode is under way, see `onModeChange`. */
  private textInputUnderway = false;

  /** The mode the switch shows: the last one the field went into, see `onModeChange`. */
  private modeShown: ParseMode = 'math';

  /** Whether the deletion under way removes a selection, see `removeEmptyLines`. */
  private selectionDeleted = false;

  /** Where an arrow key found the cursor in formula mode, and the selection with it, until the move is made,
      see `keepLine`. */
  private moveStart?: { position: number; selection: MathfieldElement['selection']; collapsed: boolean };

  /** Whether the change under way is a line break, whose line MathLive announces next, see `onBeforeInput`. */
  private lineBreakUnderway = false;

  /** The value last put into the field from outside (`setFieldValue`), until an input changes it. MathLive
      announces a value set while the field is on the page as input, one turn of the event loop later, and
      `onInput` reported it as an answer nobody had given: in the paging mode `concat-scroll`, where a page
      is part of the document already when its fields are set up, an untouched field went out as changed
      (#1734). Every input that leaves the field at this value is passed over, however many announcements
      come; one the student makes without changing the value has nothing new to report either.
      `silenceNotifications` would keep the announcement back as well, but it also keeps back the change of
      mode the value brings, which the switch and `onModeChange` go by (#1692). */
  private valueSetFromOutside?: string;

  /** Held so that the two focusout events of one blur -- the browser's and mathlive's own -- are acted on once. */
  private focusOutTimeout?: ReturnType<typeof setTimeout>;

  constructor(public elementRef: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupMathField();
    MathKeyboardAdapter.listen();
    MathKeyboardAdapter.keyboard.addEventListener('math-virtual-keyboard-command', this.onKeyboardCommand);
  }

  /** The keyboard is the page's, and outlives the field. */
  ngOnDestroy(): void {
    MathKeyboardAdapter.keyboard.removeEventListener('math-virtual-keyboard-command', this.onKeyboardCommand);
  }

  private setupMathField(): void {
    // Before the field joins the page, so that its first mount is heard as well.
    this.mathFieldElement.addEventListener('mount', this.onMount);
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
    this.mathFieldElement.readOnly = this.readonly;
    this.mathFieldElement.placeholder = this.placeholder;
    this.updateWrapStyle();
    this.setFieldValue(this.toFieldValue(this.value));
    // A value that ends in text, as an answer that is resumed, puts the field into text mode before the
    // listener below hears of it.
    this.modeShown = this.mathFieldElement.mode;
    this.mathFieldElement.addEventListener('pointerdown', this.onFramePointerDown);
    this.mathFieldElement.addEventListener('mode-change', this.onModeChange);
    this.mathFieldElement.addEventListener('selection-change', this.endTextInput);
    // Before MathLive, which listens on its own input element in the shadow root.
    this.mathFieldElement.addEventListener('keydown', this.onMoveKey, { capture: true });
    this.mathFieldElement.addEventListener('selection-change', this.keepLine);
  }

  /** In a field whose input mode can be switched, what is typed or inserted in text mode leaves the field in
      text mode (#1692): the keys of the formula keyboard but the letters insert formulas, and MathLive then
      put the field into formula mode, so that after an α the switch showed Formel and further letters
      became variables. MathLive announces a change before it makes it (`beforeinput`, see `onBeforeInput`)
      and lets a change of mode be called off. The cursor moved into a formula makes no change, and its
      change of mode goes through.

      MathLive takes the mode from what stands left of the cursor. At the start of a line nothing does, and
      MathLive falls back to formula mode: in a field that was emptied, on a line that was emptied, on an
      empty line the cursor was moved or clicked onto. Where the switch shows text, the field stays in text
      mode there instead, whether the switch was pressed or the cursor was placed after text, as in an answer
      that is resumed. Only the change from text is called off: a LaTeX command closed at the start of a line
      goes into formula mode, as MathLive has it. A deletion that ends in a formula still takes the field into
      formula mode, and the box an emptied root or fraction gets back is a formula's (`onInput`). During the
      event, `mode` is the mode MathLive changes to.

      In a multi-line field, whether its mode can be switched or not, a new line started in text mode stays in
      text mode: MathLive starts each line in formula mode, where a space is not typed at all, and a line of
      text is to be followed by another.
      This holds for Return and the Enter key of the formula keyboard alike, which fires no keydown
      (#1696). */
  private readonly onModeChange = (event: Event): void => {
    const fallbackAtLineStart = this.enableModeSwitch && this.modeShown === 'text' &&
      this.mathFieldElement.mode === 'math' && this.isAtLineStart();
    if (this.textInputUnderway || fallbackAtLineStart) {
      event.preventDefault();
    } else {
      this.modeShown = this.mathFieldElement.mode;
    }
  };

  /** Whether the cursor stands at the start of a line: of the field, or of a line of a multi-line field.
      MathLive names a place by the atom left of it; at the start of a line, that is the line's own empty
      first atom, at the top of the tree. The start of a numerator or of a radicand lies deeper. */
  private isAtLineStart(): boolean {
    return this.isLineStartAt(this.mathFieldElement.position);
  }

  private isLineStartAt(offset: number): boolean {
    const atom = this.mathFieldElement.getElementInfo(offset);
    return atom?.depth === 0 && atom.latex === '';
  }

  /** MathLive announces the selection of a change last, after the change of mode it brings. */
  private readonly endTextInput = (): void => {
    this.textInputUnderway = false;
  };

  /** In formula mode, the arrow keys keep the cursor in its line (#1696): those of a physical keyboard and
      those of the formula keyboard. Lines are for text, and at the end or the start of one, ← and → went on
      into the next line, ↑ and ↓ into the line above or below. They still move between the parts of a
      fraction, which lie in one line. A click or a tap on another line takes the cursor there, and the
      other keys that move it, as Home and End and their Mac form Cmd and an arrow, do what MathLive has
      them do. An arrow first collapses a selection, to its start or its end, also across lines; only where
      the cursor goes from there is checked.
      MathLive changes the mode for the new place before anything hears of the move, and has no event that
      lets it be called off. So the place is noted before the move -- on the keydown of an arrow, or on the
      command of the formula keyboard, which fires no keydown --, and the cursor is set back once the move is
      made, when MathLive announces the selection, still within the same call. A selection is set back as it
      was, as one that Shift and an arrow would extend into another line. Back there, the field stays in
      formula mode, also where MathLive would take the mode of the text left of the cursor. */
  private readonly keepLine = (): void => {
    const start = this.moveStart;
    if (!start) return;
    if (!start.collapsed && this.mathFieldElement.selectionIsCollapsed) {
      this.noteMoveStart();
      return;
    }
    this.moveStart = undefined;
    if (!this.lineStartBetween(start.position, this.mathFieldElement.position)) return;
    // Before the cursor goes back: while the switch shows text, formula mode at the start of a line is called off.
    this.modeShown = 'math';
    this.mathFieldElement.selection = start.selection;
    this.mathFieldElement.mode = 'math';
  };

  /** A keydown that something other than a keyboard dispatches may be a plain `Event`, without a key. */
  private readonly onMoveKey = (event: Event): void => {
    if (event instanceof KeyboardEvent && event.key.startsWith('Arrow') && !event.metaKey) this.startMove();
  };

  /** Each command of the formula keyboard goes to the field that has the focus. */
  private readonly onKeyboardCommand = (event: Event): void => {
    if (event instanceof CustomEvent && MathInputComponent.isMoveCommand(event.detail) &&
      this.mathFieldElement.hasFocus()) {
      this.startMove();
    }
  };

  /** A move that MathLive does not make, as at the end of the field, is unmarked on the next turn of the
      event loop, as in `onBeforeInput`. */
  private startMove(): void {
    if (this.mathFieldElement.mode !== 'math') return;
    this.noteMoveStart();
    this.ngZone.runOutsideAngular(() => setTimeout(() => {
      this.moveStart = undefined;
    }));
  }

  private noteMoveStart(): void {
    this.moveStart = {
      position: this.mathFieldElement.position,
      selection: this.mathFieldElement.selection,
      collapsed: this.mathFieldElement.selectionIsCollapsed
    };
  }

  /** Whether a line starts between two places of the cursor, the later one included: whether a move from one
      to the other leaves its line. */
  private lineStartBetween(from: number, to: number): boolean {
    for (let offset = Math.min(from, to) + 1; offset <= Math.max(from, to); offset += 1) {
      if (this.isLineStartAt(offset)) return true;
    }
    return false;
  }

  /** Whether a command of the formula keyboard moves the cursor. Its arrows run `moveToPreviousChar` and
      `moveToNextChar`, wrapped in `performWithFeedback`, which MathLive hands on as text or as a list. */
  private static isMoveCommand(command: unknown): boolean {
    const selectors: unknown[] = Array.isArray(command) ? command : [command];
    return selectors.some(selector => typeof selector === 'string' && /(^|\()move/.test(selector));
  }

  /** MathLive builds the field each time it joins the page: the first time, possibly later than the
      setup, and anew after every move in the page, as in a drag in the editor. Its context menu is
      switched off then, its input shortcuts are replaced and the keyboard shortcuts of `ROW_COMMANDS` are
      taken out, as all three exist only while the field is on the page and setting them before throws;
      MathLive keeps none of them across a move, and takes the input shortcuts as a constructor option only
      with a warning. A field built anew comes from what
      MathLive kept of the old one, which is the value as text, and the text of one line has no
      `\displaylines`: a multi-line field gets it back, or Enter starts no new line. The first build
      keeps the value the setup gave it. The value goes in as a formula: told no mode, MathLive would
      take the mode at the cursor, and a cursor in text would make text of all of it. */
  private readonly onMount = (): void => {
    this.mathFieldElement.menuItems = [];
    this.mathFieldElement.inlineShortcuts = MathInputComponent.INLINE_SHORTCUTS;
    this.mathFieldElement.keybindings = this.mathFieldElement.keybindings.filter(keybinding => (
      typeof keybinding.command !== 'string' || !MathInputComponent.ROW_COMMANDS.includes(keybinding.command)));
    if (this.multiline && this.mountedBefore) {
      this.setFieldValue(this.toFieldValue(this.mathFieldElement.getValue()), 'math');
    }
    this.mountedBefore = true;
  };

  /** Puts a value into the field that does not come from the student: the element's own, an answer that is
      resumed, the field's own after a move or after Mehrzeilig was switched. See `valueSetFromOutside`. */
  private setFieldValue(value: string, mode?: ParseMode): void {
    this.mathFieldElement.setValue(value, { format: 'latex', ...(mode && { mode }) });
    this.valueSetFromOutside = this.mathFieldElement.getValue();
  }

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
      this.setFieldValue(this.toFieldValue(changes.value.currentValue));
    }
    if (changes.placeholder && this.mathFieldElement) {
      this.mathFieldElement.placeholder = changes.placeholder.currentValue;
    }
    if (changes.readonly && this.mathFieldElement) {
      this.mathFieldElement.readOnly = changes.readonly.currentValue;
    }
    if (changes.multiline && !changes.multiline.firstChange) {
      this.updateWrapStyle();
      if (!this.multiline) this.rebuildField();
      // As a formula, as in `onMount`.
      this.setFieldValue(this.toFieldValue(this.value), 'math');
    }
  }

  /** MathLive makes a value in `\displaylines` the root of the field itself, and a value set later only
      replaces what is inside it: the field stays multi-line. Moved in the page, the field is built anew
      from its value as text (see `onMount`), and the text of one line has no `\displaylines`. A value of
      several lines stays as it is. */
  private rebuildField(): void {
    this.inputRef.nativeElement.appendChild(this.mathFieldElement);
  }

  /** Puts the rules of `WRAP_STYLE` into MathLive's shadow root while the field is multi-line, and takes
      them out again when it is made single-line. */
  private updateWrapStyle(): void {
    if (!this.multiline) {
      this.wrapStyle?.remove();
      this.wrapStyle = undefined;
    } else if (!this.wrapStyle) {
      this.wrapStyle = this.addShadowStyle(MathInputComponent.WRAP_STYLE);
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
  private addShadowStyle(rules: string): HTMLStyleElement {
    const style = this.mathFieldElement.ownerDocument.createElement('style');
    style.textContent = rules;
    this.mathFieldElement.shadowRoot?.appendChild(style);
    return style;
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
    // Before the mode is set: while the switch shows text, formula mode at the start of a line is called off.
    this.modeShown = event.value;
    this.mathFieldElement.mode = event.value;
    this.mathFieldElement.focus();
    if (event.value === 'math') {
      // Exit any current group (like \text{}) to allow formula entry
      this.mathFieldElement.executeCommand('moveAfterParent');
    }
    MathKeyboardAdapter.showLayout(this.openingIndex());
  }

  /** Also marks something typed or inserted in text mode for `onModeChange` -- in a field whose mode can be
      switched, and a new line in a multi-line field --, until MathLive announces its selection
      (`endTextInput`). A change that ends without one is unmarked on the next turn of the event loop; not on
      the next microtask, which zone.js runs as soon as this listener returns, before the change is made. A
      deletion is not marked: it takes the field into formula mode where it ends in a formula, as before, and
      the box a root or fraction gets back after it is a formula's (`onInput`). A new line is announced
      twice, as the line break and as the line MathLive then adds (`isNewRow`), and stays marked until its
      selection.
      Only a multi-line field in text mode gets the new line (#1696). Everywhere else the line is called off,
      not the line break, so that Return and the Enter key of the formula keyboard do what they do in a
      single-line field. That covers a field without „Mehrzeilig“ whose value has several lines, where
      MathLive would add the line all the same. The line is told by coming right after the line break:
      announced on its own, it looks like an empty value set from outside. MathLive's shortcuts that add a
      line without a line break are taken out in `onMount` (`ROW_COMMANDS`). */
  onBeforeInput(event: Event) {
    const newRow = this.lineBreakUnderway && MathInputComponent.isNewRow(event);
    this.lineBreakUnderway = MathInputComponent.isLineBreak(event);
    if (this.lineBreakUnderway) {
      this.ngZone.runOutsideAngular(() => setTimeout(() => {
        this.lineBreakUnderway = false;
      }));
    }
    if (newRow && !(this.multiline && this.mathFieldElement.mode === 'text')) {
      event.preventDefault();
      return;
    }
    this.boxesBeforeInput = EmptyBoxRestorer.countBoxes(this.mathFieldElement);
    this.selectionDeleted = MathInputComponent.isDeletion(event) && !this.mathFieldElement.selectionIsCollapsed;
    this.textInputUnderway = !MathInputComponent.isDeletion(event) && (this.textInputUnderway ||
      (this.mathFieldElement.mode === 'text' &&
        (this.enableModeSwitch || (this.multiline && MathInputComponent.isLineBreak(event)))));
    if (this.textInputUnderway) {
      this.ngZone.runOutsideAngular(() => setTimeout(this.endTextInput));
    }
  }

  /** After a deletion, a root or fraction that was emptied gets its box back before the value goes out
      (#760), and a field left with nothing but empty lines is emptied (#1692). The input that only
      announces a value set from outside does not go out (#1734). */
  onInput(event: Event) {
    if (MathInputComponent.isDeletion(event)) {
      EmptyBoxRestorer.restore(this.mathFieldElement, this.boxesBeforeInput);
      this.removeEmptyLines();
    }
    const value = this.mathFieldElement.getValue();
    if (value === this.valueSetFromOutside) return;
    this.valueSetFromOutside = undefined;
    this.valueChange.emit(value);
  }

  /** Text deleted across several lines at once, as when all of it is selected, leaves the lines behind,
      empty: `\displaylines{\\ }` for two. The field kept their height, and the value went out as an answer.
      The field is set back to its empty value instead, a single line. Only a deleted selection does this:
      lines deleted one by one go with their characters, and empty lines left after a single character are
      ones the student made. The reset is silent, so the field keeps its mode, and the value goes out from
      `onInput`. `setValue` adds a step to the undo history: undo brings the text back, and the step before
      that is the copy of it MathLive takes before every deletion, so the next undo seems to do nothing. */
  private removeEmptyLines(): void {
    if (!this.selectionDeleted || !/^\\displaylines\{(\\\\\s*)+\}$/.test(this.mathFieldElement.getValue())) return;
    this.mathFieldElement.setValue(this.toFieldValue(''), { format: 'latex', silenceNotifications: true });
  }

  /** Whether MathLive's `beforeinput` or `input` is of a deletion. Safari strips `inputType` from the event,
      so MathLive also hands it on as `data`. */
  private static isDeletion(event: Event): boolean {
    return event instanceof InputEvent && (event.inputType || event.data || '').startsWith('delete');
  }

  /** Whether MathLive's `beforeinput` is of Return or of the Enter key, read as `isDeletion` reads its own. */
  private static isLineBreak(event: Event): boolean {
    return event instanceof InputEvent && (event.inputType || event.data) === 'insertLineBreak';
  }

  /** Whether MathLive's `beforeinput` could be of the line it adds after a line break inside
      `\displaylines`. MathLive announces the line as `insertText` without the text, and so hands on the type
      as `data`, as for `isDeletion`. It does the same for an empty value, which is why `onBeforeInput` asks
      only right after a line break. Text typed, inserted or pasted carries itself. */
  private static isNewRow(event: Event): boolean {
    return event instanceof InputEvent && event.data === 'insertText';
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
    const layouts = MathKeyboardLayouts.select(this.mathKeyboardPresets, this.multiline);
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

import {
  ComponentFixture, fakeAsync, flush, TestBed, tick
} from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MathfieldElement, Selector } from 'mathlive';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { userEvent } from 'vitest/browser';
import { EmptyBoxRestorer } from 'common/modules/math-editor/utils/empty-box-restorer';
import { ENTER_KEY } from 'common/modules/math-editor/configs/formula-keyboard-presets.config';
import { MathInputComponent } from './math-input.component';

describe('MathInputComponent', () => {
  let component: MathInputComponent;
  let fixture: ComponentFixture<MathInputComponent>;

  const createParseModeChange = (value: string): MatButtonToggleChange => new MatButtonToggleChange(
    null as unknown as MatButtonToggle, value
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathInputComponent],
      imports: [MatButtonToggleModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MathInputComponent);
    component = fixture.componentInstance;
    component.value = '1+2';
    fixture.detectChanges();
  });

  /* window.mathVirtualKeyboard is a page-wide singleton, so a spy left on it outlives the test and
     hands its recorded calls to the next spy on the same method. */

  it('should append the math field element to the input container', () => {
    expect(fixture.nativeElement.querySelector('math-field')).toBeTruthy();
  });

  it('should apply the initial value to the math field', () => {
    expect(component.mathFieldElement.getValue()).toBe('1+2');
  });

  it('should update the math field value on input changes', () => {
    component.ngOnChanges({
      value: new SimpleChange('1+2', 'x^2', false)
    });
    expect(component.mathFieldElement.getValue()).toBe('x^2');
  });

  // MathLive announces an empty value as text inserted without the text, as it announces a new line (#1696).
  it('should empty the math field when its value is emptied', () => {
    component.ngOnChanges({
      value: new SimpleChange('1+2', '', false)
    });
    expect(component.mathFieldElement.getValue()).toBe('');
  });

  /* A field in a test is on the page when it is set up, as in the paging mode concat-scroll. A value set
     there from outside went out as input, and the player reported an untouched field as changed (#1734).
     Not fakeAsync (§7) where the field is set up or moved in the test: MathLive's announcement is then
     scheduled from the fixture's NgZone or from its own mount, which tick() does not reach. */
  describe('given a value from outside (#1734)', () => {
    const nextTurn = (): Promise<unknown> => new Promise(resolve => {
      setTimeout(resolve);
    });
    let typedField: MathfieldElement | undefined;

    afterEach(() => {
      typedField?.blur();
      typedField = undefined;
      window.mathVirtualKeyboard.hide();
    });

    it('should not emit a value handed in twice before MathLive announces it', fakeAsync(() => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      component.ngOnChanges({ value: new SimpleChange('1+2', 'x^2', false) });
      component.ngOnChanges({ value: new SimpleChange('x^2', 'x^3', false) });
      tick();
      expect(emitSpy).not.toHaveBeenCalled();
    }));

    it('should not emit the value it is set up with', async () => {
      const presetFixture = TestBed.createComponent(MathInputComponent);
      presetFixture.componentInstance.value = 'x^2';
      const emitSpy = vi.spyOn(presetFixture.componentInstance.valueChange, 'emit');
      presetFixture.detectChanges();
      await nextTurn();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit a value handed in later', fakeAsync(() => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      component.ngOnChanges({ value: new SimpleChange('1+2', 'x^2', false) });
      tick();
      expect(emitSpy).not.toHaveBeenCalled();
    }));

    it('should not emit the value a multi-line field gets back after a move in the page', async () => {
      const multilineFixture = TestBed.createComponent(MathInputComponent);
      multilineFixture.componentInstance.value = 'x';
      multilineFixture.componentInstance.multiline = true;
      multilineFixture.detectChanges();
      await nextTurn();
      const field = multilineFixture.componentInstance.mathFieldElement;
      const emitSpy = vi.spyOn(multilineFixture.componentInstance.valueChange, 'emit');
      const mounted = new Promise(resolve => {
        field.addEventListener('mount', resolve, { once: true });
      });
      field.parentElement?.appendChild(field);
      await mounted;
      await nextTurn();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    /* A field set up before its page joins the document, as in the paging mode separate, hears nothing
       of its value: the first input is the student's own and goes out, even with the value not passed
       over yet. */
    it('should emit the first input after a value that was not announced', async () => {
      const lateFixture = TestBed.createComponent(MathInputComponent);
      const host = lateFixture.nativeElement as HTMLElement;
      const page = host.parentElement as HTMLElement;
      host.remove();
      lateFixture.componentInstance.value = 'x';
      lateFixture.detectChanges();
      const field = lateFixture.componentInstance.mathFieldElement;
      const mounted = new Promise(resolve => {
        field.addEventListener('mount', resolve, { once: true });
      });
      page.appendChild(host);
      await mounted;
      await nextTurn();
      const emitSpy = vi.spyOn(lateFixture.componentInstance.valueChange, 'emit');
      typedField = field;
      field.focus();
      field.executeCommand(['typedText', '2']);
      await nextTurn();
      expect(emitSpy).toHaveBeenCalledWith('x2');
    });
  });

  describe('on a press on the field\'s frame (#1648)', () => {
    /* Inside the padding, so that MathLive takes the press as one on the field and counts it as
       focused -- the state in which only the browser's focus is missing. */
    const pressFrame = (): void => {
      const field = component.mathFieldElement;
      field.style.padding = '8px';
      const frame = field.getBoundingClientRect();
      field.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true,
        composed: true,
        button: 0,
        buttons: 1,
        clientX: frame.left + 3,
        clientY: frame.top + 3
      }));
    };

    afterEach(() => {
      component.mathFieldElement.blur();
      window.mathVirtualKeyboard.hide();
    });

    it('should take the focus', () => {
      pressFrame();
      expect(document.activeElement).toBe(component.mathFieldElement);
    });
  });

  /* A view can reach the page after its setup, and MathLive has a context menu only while the field is
     on the page. Until #1648 a timer switched it off one turn of the event loop after setup, too early
     for such a field; this one joins the page after that turn. Not fakeAsync (§7): MathLive announces
     the mount in a microtask of its own, which flushMicrotasks() does not reach. */
  it('should switch off the context menu of a field that joins the page after its setup', async () => {
    const lateFixture = TestBed.createComponent(MathInputComponent);
    const host = lateFixture.nativeElement as HTMLElement;
    const page = host.parentElement as HTMLElement;
    host.remove();
    lateFixture.detectChanges();
    await new Promise(resolve => {
      setTimeout(resolve);
    });
    const field = lateFixture.componentInstance.mathFieldElement;
    const mounted = new Promise(resolve => {
      field.addEventListener('mount', resolve, { once: true });
    });
    page.appendChild(host);
    await mounted;
    expect(field.menuItems).toEqual([]);
  });

  it('should update the readonly state of the math field on input changes', () => {
    expect(component.mathFieldElement.readOnly).toBe(false);
    component.ngOnChanges({
      readonly: new SimpleChange(false, true, false)
    });
    expect(component.mathFieldElement.readOnly).toBe(true);
  });

  it('should emit the current math field value on input', () => {
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    component.mathFieldElement.setValue('a+b', { format: 'latex' });
    component.onInput(new InputEvent('input', { inputType: 'insertText', data: 'b' }));
    expect(emitSpy).toHaveBeenCalledWith('a+b');
  });

  /* With real key presses: the shortcuts are applied only to keys typed on a physical keyboard, which
     MathLive collects across key presses, and not to `insert` or `executeCommand`. */
  describe('typed on a physical keyboard (#760)', () => {
    const typeInto = async (keys: string): Promise<string> => {
      const field = component.mathFieldElement;
      field.setValue('');
      // The browser's focus, which the keys go to. In the test page MathfieldElement.focus() only makes
      // MathLive count the field as focused and leaves the browser's focus on the body.
      HTMLElement.prototype.focus.call(field);
      await userEvent.keyboard(keys);
      return field.getValue();
    };

    afterEach(() => {
      component.mathFieldElement.blur();
      window.mathVirtualKeyboard.hide();
    });

    it('should keep letters and signs as typed', async () => {
      expect(await typeInto('nnnn5mm<=sin')).toBe('nnnn5mm<=sin');
    });

    it('should give * the multiplication sign of the formula keyboard', async () => {
      expect(await typeInto('3*4')).toBe('3\\cdot4');
    });

    /* MathLive builds the field anew after a move, as in a drag in the editor, and keeps only the options
       it has an attribute for -- the shortcuts are not one of them. */
    it('should keep letters and signs as typed after the field was moved in the page', async () => {
      const field = component.mathFieldElement;
      const mounted = new Promise(resolve => {
        field.addEventListener('mount', resolve, { once: true });
      });
      field.parentElement?.appendChild(field);
      await mounted;
      expect(await typeInto('nnnn5mm<=sin')).toBe('nnnn5mm<=sin');
    });
  });

  describe('on a deletion (#760)', () => {
    afterEach(() => {
      component.mathFieldElement.blur();
      window.mathVirtualKeyboard.hide();
    });

    it('should give an emptied root its box back before it emits the value', fakeAsync(() => {
      const field = component.mathFieldElement;
      field.focus();
      field.setValue('');
      field.insert('\\sqrt{\\placeholder{}}', { selectionMode: 'placeholder' });
      field.insert('2');
      tick();
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      field.executeCommand('deleteBackward');
      // MathLive announces the change one turn of the event loop later
      tick();
      expect(field.getValue()).toBe('\\sqrt{\\placeholder{}}');
      expect(emitSpy).toHaveBeenLastCalledWith('\\sqrt{\\placeholder{}}');
    }));

    /* The boxes are counted on `beforeinput`, before MathLive deletes. Deleted alone, as in a root with an
       index, the box must not come back, or the root cannot be deleted at all. */
    it('should let a root with an index be deleted to the end', fakeAsync(() => {
      const field = component.mathFieldElement;
      field.focus();
      field.setValue('');
      field.insert('\\sqrt[3]{\\placeholder{}}', { selectionMode: 'placeholder' });
      field.insert('5');
      tick();
      const values = [1, 2, 3].map(() => {
        field.executeCommand('deleteBackward');
        tick();
        return field.getValue();
      });
      expect(values).toEqual(['\\sqrt[3]{\\placeholder{}}', '\\sqrt[3]{}', '']);
    }));

    it('should ask for the box on a deletion only', () => {
      const restoreSpy = vi.spyOn(EmptyBoxRestorer, 'restore');
      component.onInput(new InputEvent('input', { inputType: 'insertText', data: '2' }));
      expect(restoreSpy).not.toHaveBeenCalled();
      component.onInput(new InputEvent('input', { inputType: 'deleteContentBackward' }));
      expect(restoreSpy).toHaveBeenCalledWith(component.mathFieldElement, expect.any(Number));
    });

    // MathLive hands the type on as `data` too, as WebKit strips `inputType` from the event
    it('should recognise a deletion by the data of the event, as Safari reports it', () => {
      const restoreSpy = vi.spyOn(EmptyBoxRestorer, 'restore');
      component.onInput(new InputEvent('input', { data: 'deleteContentBackward' }));
      expect(restoreSpy).toHaveBeenCalledWith(component.mathFieldElement, expect.any(Number));
    });
  });

  describe('as a multi-line field', () => {
    const createMultilineField = (value: string): MathInputComponent => {
      const multilineFixture = TestBed.createComponent(MathInputComponent);
      multilineFixture.componentInstance.value = value;
      multilineFixture.componentInstance.multiline = true;
      multilineFixture.detectChanges();
      return multilineFixture.componentInstance;
    };

    // The tests focus their fields, which opens the page-wide keyboard; it would stay open into the next.
    afterEach(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      window.mathVirtualKeyboard.hide();
    });

    const pressEnter = (field: MathfieldElement, mode?: 'math' | 'text', modifiers: KeyboardEventInit = {}): void => {
      field.focus();
      field.executeCommand('moveToMathfieldEnd');
      if (mode) field.mode = mode;
      // MathLive listens on its own input element in the shadow root, not on the host.
      const enter = new KeyboardEvent('keydown', {
        ...modifiers, key: 'Enter', code: 'Enter', bubbles: true, composed: true
      });
      field.shadowRoot?.querySelector('[part=keyboard-sink]')?.dispatchEvent(enter);
    };

    const lineCount = (field: MathfieldElement, selector = '.ML__text'): number => {
      const characters = [...(field.shadowRoot?.querySelectorAll(selector) ?? [])];
      return new Set(characters.map(character => Math.round(character.getBoundingClientRect().top))).size;
    };
    const longText = '\\text{Das ist ein sehr langer Satz, der nicht in eine Zeile passt}';
    /* These tests wait for the browser's layout rather than for timers of their own, which is why they
       do not use fakeAsync (§7): MathLive renders only once its fonts are loaded (document.fonts.ready),
       and tick() cannot advance that. They wait for the rendered state instead of a fixed time, with
       room for the first loading of the fonts on a slow machine; vi.waitFor gives up after 1 s. */
    const layout = { timeout: 5000 };
    const rendered = (field: MathfieldElement, selector = '.ML__text'): Promise<void> => vi.waitFor(() => {
      expect(lineCount(field, selector)).toBeGreaterThan(0);
    }, layout);
    const longFormula = 'x^2+y^2+z^2+a^2+b^2+c^2+d^2+e^2=r^2';

    it('should wrap text that is too long for one line', async () => {
      const multiline = createMultilineField(longText);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      await vi.waitFor(() => {
        expect(lineCount(multiline.mathFieldElement)).toBeGreaterThan(1);
      }, layout);
    });

    it('should keep a formula that is too long for one line in one piece', async () => {
      const multiline = createMultilineField(longFormula);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      const field = multiline.mathFieldElement;
      await rendered(field, '.ML__mathit');
      const variables = [...(field.shadowRoot?.querySelectorAll('.ML__mathit') ?? [])];
      // Too long indeed: a formula that fits would stay on one line under any rule.
      expect(variables[variables.length - 1].getBoundingClientRect().right)
        .toBeGreaterThan(field.getBoundingClientRect().right);
      expect(lineCount(field, '.ML__mathit')).toBe(1);
    });

    it('should wrap text at the edge of the field beside a formula that is too long for one line', async () => {
      const multiline = createMultilineField(`\\text{Ein Satz }${longFormula}\\text{ und noch ein langer Satz danach}`);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      const field = multiline.mathFieldElement;
      await rendered(field);
      const contentRight = field.shadowRoot?.querySelector('[part=content]')?.getBoundingClientRect().right;
      const characters = [...(field.shadowRoot?.querySelectorAll('.ML__text') ?? [])]
        .filter(character => character.textContent?.trim());
      const textRight = Math.max(...characters.map(character => character.getBoundingClientRect().right));
      expect(textRight).toBeLessThanOrEqual(contentRight ?? 0);
    });

    it('should not wrap text inside a fraction', async () => {
      const multiline = createMultilineField(`\\frac{${longText}}{2}`);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      await rendered(multiline.mathFieldElement);
      expect(lineCount(multiline.mathFieldElement)).toBe(1);
    });

    it('should keep a wrapped line inside the field when there are several lines', async () => {
      const multiline = createMultilineField(`\\displaylines{${longText}\\\\ \\frac{1}{2}\\\\ ${longText}}`);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      const field = multiline.mathFieldElement;
      await rendered(field);
      const fieldTop = field.getBoundingClientRect().top;
      const characters = [...(field.shadowRoot?.querySelectorAll('.ML__text') ?? [])];
      const firstTop = Math.min(...characters.map(character => character.getBoundingClientRect().top));
      const fraction = field.shadowRoot?.querySelector('.ML__mfrac')?.getBoundingClientRect();
      const secondText = characters.slice(characters.length / 2).map(character => character.getBoundingClientRect());
      expect(firstTop).toBeGreaterThanOrEqual(fieldTop);
      expect(Math.min(...secondText.map(rect => rect.top))).toBeGreaterThanOrEqual(fraction?.bottom ?? Infinity);
    });

    it('should grow by one line on Enter after a wrapped line', async () => {
      const multiline = createMultilineField('');
      // As in the Formelfeld: the font size and line height of its wrapper, and the text typed in.
      multiline.elementRef.nativeElement.style.cssText =
        'display: block; width: 200px; font-size: 20px; line-height: 135%';
      const field = multiline.mathFieldElement;
      field.focus();
      field.mode = 'text';
      [...'Das ist ein sehr langer Satz, der nicht in eine Zeile passt'].forEach(character => {
        field.insert(character, { mode: 'text', format: 'latex' });
      });
      await vi.waitFor(() => {
        expect(lineCount(field)).toBeGreaterThan(1);
      }, layout);
      const heightBefore = field.getBoundingClientRect().height;
      const lineHeight = field.shadowRoot?.querySelector('.ML__text')?.getBoundingClientRect().height ?? 0;
      pressEnter(field, 'text');
      await vi.waitFor(() => {
        expect(field.getBoundingClientRect().height).toBeGreaterThan(heightBefore);
      }, layout);
      expect(field.getBoundingClientRect().height - heightBefore).toBeLessThan(lineHeight * 1.3);
    });

    it('should not wrap when single-line', async () => {
      component.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      component.ngOnChanges({ value: new SimpleChange('1+2', longText, false) });
      await rendered(component.mathFieldElement);
      expect(lineCount(component.mathFieldElement)).toBe(1);
    });

    it('should start a new line on Enter in text mode, and stay in text mode', () => {
      const multiline = createMultilineField('\\text{ab}');
      pressEnter(multiline.mathFieldElement, 'text');
      expect(multiline.mathFieldElement.mode).toBe('text');
      multiline.mathFieldElement.executeCommand(['typedText', 'c']);
      expect(multiline.mathFieldElement.getValue()).toBe('\\displaylines{\\text{ab}\\\\ \\text{c}}');
    });

    // A multi-line field is multi-line for text: a formula gets no new line, nor a field without text mode.
    it('should start no new line on Enter in formula mode (#1696)', () => {
      const multiline = createMultilineField('a+b');
      pressEnter(multiline.mathFieldElement, 'math');
      multiline.mathFieldElement.insert('c');
      expect(multiline.mathFieldElement.getValue()).toBe('a+bc');
      expect(multiline.mathFieldElement.mode).toBe('math');
    });

    // One of MathLive's shortcuts of formula mode, which add the line without a line break.
    it('should start no new line on Ctrl+Enter in formula mode (#1696)', () => {
      const multiline = createMultilineField('a+b');
      pressEnter(multiline.mathFieldElement, 'math', { ctrlKey: true });
      multiline.mathFieldElement.insert('c');
      expect(multiline.mathFieldElement.getValue()).toBe('a+bc');
    });

    /* The Enter key of the formula keyboard fires no keydown: MathLive only runs its command (#1696). In a
       field whose mode cannot be switched, the field is in text mode inside a stored \text{}. */
    it.each([false, true])(
      'should start a new line in text mode with the Enter key of the formula keyboard (mode switch: %s)',
      enableModeSwitch => {
        const multiline = createMultilineField('\\text{ab}');
        multiline.enableModeSwitch = enableModeSwitch;
        const field = multiline.mathFieldElement;
        field.focus();
        field.executeCommand('moveToMathfieldEnd');
        field.mode = 'text';
        field.executeCommand(ENTER_KEY.command as Selector);
        expect(field.mode).toBe('text');
        field.executeCommand(['typedText', 'c']);
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}\\\\ \\text{c}}');
      }
    );

    it('should not start a new line on Enter when single-line', () => {
      pressEnter(component.mathFieldElement);
      expect(component.mathFieldElement.getValue()).toBe('1+2');
    });

    /* MathLive adds a line inside \displaylines whatever the option says: in a value written in the LaTeX
       editor, or in an answer given while every field was multi-line (#1648). */
    it('should not start a new line on Enter when single-line, with a value of several lines (#1696)', () => {
      const singleLineFixture = TestBed.createComponent(MathInputComponent);
      singleLineFixture.componentInstance.value = '\\displaylines{\\text{a}\\\\ \\text{b}}';
      singleLineFixture.detectChanges();
      const field = singleLineFixture.componentInstance.mathFieldElement;
      pressEnter(field, 'text');
      expect(field.getValue()).toBe('\\displaylines{\\text{a}\\\\ \\text{b}}');
    });

    it('should hand on a value of one line as it was stored', () => {
      const multiline = createMultilineField('x^2');
      expect(multiline.mathFieldElement.getValue()).toBe('x^2');
    });

    it('should show a stored multi-line value line by line, not wrapped twice', () => {
      const multiline = createMultilineField('\\displaylines{a\\\\ b}');
      expect(multiline.mathFieldElement.getValue()).toBe('\\displaylines{a\\\\ b}');
    });

    it('should wrap a value that arrives later as well', () => {
      const multiline = createMultilineField('');
      multiline.ngOnChanges({ value: new SimpleChange('', '\\text{y}', false) });
      pressEnter(multiline.mathFieldElement, 'text');
      expect(multiline.mathFieldElement.getValue()).toBe('\\displaylines{\\text{y}\\\\ }');
    });

    /* The editor switches the option on the field it shows (#1696). The cursor stands in text when it does,
       and the value is set anew all the same as a formula with its text. */
    it('should start a new line on Enter once made multi-line after the setup', () => {
      component.value = '\\text{ab}';
      component.ngOnChanges({ value: new SimpleChange('1+2', component.value, false) });
      component.multiline = true;
      component.ngOnChanges({ multiline: new SimpleChange(false, true, false) });
      pressEnter(component.mathFieldElement, 'text');
      component.mathFieldElement.executeCommand(['typedText', 'c']);
      expect(component.mathFieldElement.getValue()).toBe('\\displaylines{\\text{ab}\\\\ \\text{c}}');
    });

    const makeSingleLine = (multiline: MathInputComponent): void => {
      multiline.multiline = false;
      multiline.ngOnChanges({ multiline: new SimpleChange(true, false, false) });
    };

    it('should no longer wrap once made single-line after the setup', async () => {
      const multiline = createMultilineField(longText);
      multiline.elementRef.nativeElement.style.cssText = 'display: block; width: 200px';
      await vi.waitFor(() => {
        expect(lineCount(multiline.mathFieldElement)).toBeGreaterThan(1);
      }, layout);
      makeSingleLine(multiline);
      await vi.waitFor(() => {
        expect(lineCount(multiline.mathFieldElement)).toBe(1);
      }, layout);
    });

    // MathLive makes \displaylines the root of the field, which a value set later does not replace.
    it.each(['', 'a+b'])(
      'should no longer start a new line on Enter once made single-line, with the value "%s"',
      value => {
        const multiline = createMultilineField(value);
        makeSingleLine(multiline);
        pressEnter(multiline.mathFieldElement, 'text');
        expect(multiline.mathFieldElement.getValue()).toBe(value);
      }
    );

    /* In formula mode, the arrow keys keep the cursor in its line (#1696). The line of text below is one made
       in text mode. MathLive gives the field the browser's focus, which the keyboard's commands go to, only
       60 ms after focus(). */
    describe('in formula mode, with a line below', () => {
      const linesValue = '\\displaylines{x+1\\\\ \\text{ab}}';
      const createFocusedField = (value: string): MathfieldElement => {
        const field = createMultilineField(value).mathFieldElement;
        field.focus();
        tick(60);
        return field;
      };
      // Behind the first n characters of the field.
      const placeCursorAfter = (field: MathfieldElement, characters: number): void => {
        field.executeCommand('moveToMathfieldStart');
        Array.from({ length: characters }).forEach(() => field.executeCommand('moveToNextChar'));
      };
      const pressKey = (field: MathfieldElement, key: string, modifiers: KeyboardEventInit = {}): void => {
        field.shadowRoot?.querySelector('[part=keyboard-sink]')?.dispatchEvent(new KeyboardEvent('keydown', {
          ...modifiers, key, code: key, bubbles: true, composed: true
        }));
      };

      it('should keep the cursor in its line on → at its end', fakeAsync(() => {
        const field = createFocusedField(linesValue);
        placeCursorAfter(field, 3);
        pressKey(field, 'ArrowRight');
        field.insert('2');
        expect(field.getValue()).toBe('\\displaylines{x+12\\\\ \\text{ab}}');
        flush();
      }));

      it('should keep the cursor in its line on the → of the formula keyboard at its end', fakeAsync(() => {
        const field = createFocusedField(linesValue);
        placeCursorAfter(field, 3);
        window.mathVirtualKeyboard.executeCommand('performWithFeedback(moveToNextChar)');
        field.insert('2');
        expect(field.getValue()).toBe('\\displaylines{x+12\\\\ \\text{ab}}');
        flush();
      }));

      // After text, MathLive would take the mode of the text left of the cursor, where the switch was set to Formel.
      it('should keep the cursor in its line on ↓, and the field in formula mode', fakeAsync(() => {
        const field = createFocusedField('\\displaylines{\\text{ab}\\\\ \\text{cd}}');
        placeCursorAfter(field, 2);
        field.mode = 'math';
        pressKey(field, 'ArrowDown');
        expect(field.mode).toBe('math');
        field.insert('2');
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}2\\\\ \\text{cd}}');
        flush();
      }));

      // As the cursor stays where it was, so does a selection, rather than shrinking to the cursor.
      it('should keep a selection that Shift+→ would extend into the next line', fakeAsync(() => {
        const field = createFocusedField(linesValue);
        placeCursorAfter(field, 0);
        [1, 2, 3].forEach(() => field.executeCommand('extendSelectionForward'));
        expect(field.mode).toBe('math');
        pressKey(field, 'ArrowRight', { shiftKey: true });
        expect(field.selection.ranges).toEqual([[0, 3]]);
        flush();
      }));

      // An arrow collapses a selection first, also one across two lines, before it moves.
      it('should collapse a selection over two lines to its start on ←', fakeAsync(() => {
        const field = createFocusedField('\\displaylines{x+1\\\\ y+2}');
        placeCursorAfter(field, 1);
        field.selection = { ranges: [[1, 6]], direction: 'forward' };
        pressKey(field, 'ArrowLeft');
        expect(field.selection.ranges).toEqual([[1, 1]]);
        flush();
      }));

      // ↓ collapses the selection to its end, at the end of the line, and only then moves.
      it('should keep the cursor in its line on ↓ from a selection', fakeAsync(() => {
        const field = createFocusedField('\\displaylines{x+1\\\\ y+2}');
        placeCursorAfter(field, 1);
        field.selection = { ranges: [[1, 3]], direction: 'forward' };
        pressKey(field, 'ArrowDown');
        field.insert('z');
        expect(field.getValue()).toBe('\\displaylines{x+1z\\\\ y+2}');
        flush();
      }));

      /* Cmd and an arrow are the Mac's Home and End, which MathLive takes to the start and the end of the
         field; on an iPad with a keyboard as well. MathLive reads the platform from the browser. */
      it('should leave Cmd+→ on a Mac to MathLive', fakeAsync(() => {
        Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
        Object.defineProperty(navigator, 'userAgentData', { value: { platform: 'macOS' }, configurable: true });
        try {
          const field = createFocusedField(linesValue);
          placeCursorAfter(field, 3);
          pressKey(field, 'ArrowRight', { metaKey: true });
          expect(field.position).toBe(field.lastOffset);
        } finally {
          Reflect.deleteProperty(navigator, 'platform');
          Reflect.deleteProperty(navigator, 'userAgentData');
        }
        flush();
      }));

      // A fraction lies in one line.
      it('should still move between the parts of a fraction on ↑', fakeAsync(() => {
        const field = createFocusedField('\\displaylines{\\frac{1}{2}\\\\ \\text{ab}}');
        placeCursorAfter(field, 4);
        pressKey(field, 'ArrowUp');
        field.insert('3');
        expect(field.getValue()).toMatch(/^\\displaylines\{\\frac\{(13|31)\}\{2\}\\\\ \\text\{ab\}\}$/);
        flush();
      }));

      it('should take the cursor on into the next line on → in text mode', fakeAsync(() => {
        const field = createFocusedField('\\displaylines{\\text{ab}\\\\ \\text{cd}}');
        placeCursorAfter(field, 2);
        expect(field.mode).toBe('text');
        pressKey(field, 'ArrowRight');
        field.insert('2');
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}\\\\ 2\\text{cd}}');
        flush();
      }));
    });

    /* Moved in the page, as by a drag in the editor, MathLive builds the field anew from a value of one
       line that it keeps without `\displaylines`, with the cursor in its text. */
    it('should start a new line on Enter after the field was moved in the page', async () => {
      const field = createMultilineField('\\text{a}').mathFieldElement;
      const mounted = new Promise(resolve => {
        field.addEventListener('mount', resolve, { once: true });
      });
      field.parentElement?.appendChild(field);
      await mounted;
      pressEnter(field, 'text');
      expect(field.getValue()).toBe('\\displaylines{\\text{a}\\\\ }');
    });
  });

  it('should not show the mode switch by default', () => {
    expect(fixture.nativeElement.querySelector('mat-button-toggle-group')).toBeNull();
  });

  it('should show the mode switch when enabled', () => {
    component.enableModeSwitch = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-button-toggle-group')).toBeTruthy();
  });

  it('should leave the current group when switching to math mode', () => {
    const executeCommandSpy = vi.spyOn(component.mathFieldElement, 'executeCommand');
    component.setParseMode(createParseModeChange('math'));
    expect(executeCommandSpy).toHaveBeenCalledWith('moveAfterParent');
  });

  it('should not execute a command when switching to text mode', () => {
    const executeCommandSpy = vi.spyOn(component.mathFieldElement, 'executeCommand');
    component.setParseMode(createParseModeChange('text'));
    expect(executeCommandSpy).not.toHaveBeenCalled();
  });

  it('should emit focusIn and show the virtual keyboard on focus in', () => {
    const emitSpy = vi.spyOn(component.focusIn, 'emit');
    const showSpy = vi.spyOn(window.mathVirtualKeyboard, 'show');
    component.onFocusIn();
    expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
    expect(showSpy).toHaveBeenCalled();
  });

  it('should set a keyboard layout for every configured preset on focus in', () => {
    component.mathKeyboardPresets = ['math', 'greek'];
    component.onFocusIn();
    expect(window.mathVirtualKeyboard.layouts.length).toBe(2);
  });

  it('should offer the Enter key on the letters of a multi-line field only (#1696)', () => {
    const offersEnterKey = (): boolean => window.mathVirtualKeyboard.layouts
      .some(layout => typeof layout !== 'string' && 'layers' in layout && layout.layers
        .some(layer => typeof layer !== 'string' && !!layer.rows?.flat().includes(ENTER_KEY)));
    component.mathKeyboardPresets = ['math', 'latin'];
    component.onFocusIn();
    expect(offersEnterKey()).toBe(false);
    component.multiline = true;
    component.onFocusIn();
    expect(offersEnterKey()).toBe(true);
  });

  /* Every assignment rebuilds the keyboard and drops it back to its first layer; on the iPad the
     focus comes back into the field after every key tap (#1600). */
  it('should not assign the keyboard layouts again when they are unchanged', () => {
    component.mathKeyboardPresets = ['math', 'greek'];
    component.onFocusIn();
    const layoutsSetter = vi.spyOn(window.mathVirtualKeyboard, 'layouts', 'set');
    component.onFocusIn();
    expect(layoutsSetter).not.toHaveBeenCalled();
  });

  it('should assign the keyboard layouts when another field has other presets', () => {
    component.mathKeyboardPresets = ['math', 'greek'];
    component.onFocusIn();
    component.mathKeyboardPresets = ['math'];
    component.onFocusIn();
    expect(window.mathVirtualKeyboard.layouts.length).toBe(1);
  });

  describe('the input mode and the keyboard (#1692)', () => {
    // On the formula keyboard, the tabs read 123, abc and αβγ. Tests above leave the keyboard open.
    beforeEach(() => {
      component.mathKeyboardPresets = ['math', 'latin', 'greek'];
      window.mathVirtualKeyboard.hide();
    });

    // The tests focus the field, which opens the page-wide keyboard; it would stay open into the next.
    afterEach(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      window.mathVirtualKeyboard.hide();
    });

    // MathLive gives the field the browser's focus, and with it the focusin, only 60 ms after focus().
    const focusField = (): void => {
      component.mathFieldElement.focus();
      tick(60);
      component.mathFieldElement.executeCommand('moveToMathfieldEnd');
    };

    const openTab = (): string | undefined => document
      .querySelector('.ML__keyboard .MLK__layer.is-visible .MLK__toolbar .selected')?.textContent?.trim();

    const pressTab = (label: string): void => {
      Array.from(document.querySelectorAll('.ML__keyboard .MLK__layer.is-visible [data-layer]'))
        .find(tab => tab.textContent?.trim() === label)
        ?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    };

    // What a key of the Greek layout does: MathLive inserts its formula in formula mode.
    const pressGreekAlpha = (): void => {
      component.mathFieldElement.executeCommand(['insert', '\\alpha', { mode: 'math', format: 'latex' }]);
    };

    it('should open the keyboard on the letters when the switch is set to text', fakeAsync(() => {
      component.enableModeSwitch = true;
      component.setParseMode(createParseModeChange('text'));
      tick(60);
      expect(openTab()).toBe('abc');
      flush();
    }));

    // Safari leaves the focus in the field when the switch is pressed, and the keyboard stays open.
    it('should turn an open keyboard to the tab of the mode the switch is set to', fakeAsync(() => {
      component.enableModeSwitch = true;
      focusField();
      expect(openTab()).toBe('123');
      component.setParseMode(createParseModeChange('text'));
      expect(openTab()).toBe('abc');
      component.setParseMode(createParseModeChange('math'));
      expect(openTab()).toBe('123');
      flush();
    }));

    it('should stay in text mode and on the chosen tab when a Greek letter is typed in text', fakeAsync(() => {
      component.enableModeSwitch = true;
      focusField();
      component.setParseMode(createParseModeChange('text'));
      component.mathFieldElement.executeCommand(['typedText', 'a']);
      pressTab('αβγ');
      pressGreekAlpha();
      expect(component.mathFieldElement.mode).toBe('text');
      expect(openTab()).toBe('αβγ');
      component.mathFieldElement.executeCommand(['typedText', 'b']);
      expect(component.mathFieldElement.getValue()).toMatch(/\\alpha\\text\{b\}$/);
      flush();
    }));

    /* A deletion takes the field into formula mode where it ends in a formula, as before: the box an
       emptied fraction gets back is a formula's, not the text \\placeholder{}. The start of a numerator is
       no start of a line. */
    it('should give an emptied fraction its box back after a deletion in text mode', fakeAsync(() => {
      const field = component.mathFieldElement;
      component.enableModeSwitch = true;
      field.setValue('');
      component.setParseMode(createParseModeChange('text'));
      tick(60);
      field.executeCommand(['insert', '\\frac{#@}{#?}', { mode: 'math', format: 'latex' }]);
      field.executeCommand(['typedText', '3']);
      tick();
      field.executeCommand('deleteBackward');
      // MathLive announces the change one turn of the event loop later
      tick();
      expect(field.getValue()).toBe('\\frac{\\placeholder{}}{\\placeholder{}}');
      flush();
    }));

    /* Where nothing stands left of the cursor, MathLive falls back to formula mode. Multi-line, as in the
       Formelfeld. */
    describe('at the start of a line, with the switch showing text', () => {
      let formulaField: MathInputComponent;
      const switchTo = (mode: 'math' | 'text'): void => formulaField.setParseMode(createParseModeChange(mode));
      const createFormulaField = (): MathfieldElement => {
        const formulaFixture = TestBed.createComponent(MathInputComponent);
        formulaField = formulaFixture.componentInstance;
        formulaField.enableModeSwitch = true;
        formulaField.multiline = true;
        formulaFixture.detectChanges();
        return formulaField.mathFieldElement;
      };
      const typeInTextMode = (): MathfieldElement => {
        const field = createFormulaField();
        switchTo('text');
        tick(60);
        field.executeCommand(['typedText', 'ab']);
        return field;
      };

      // MathLive listens on its own input element in the shadow root, not on the host.
      const pressKey = (field: MathfieldElement, key: string): void => {
        field.shadowRoot?.querySelector('[part=keyboard-sink]')?.dispatchEvent(new KeyboardEvent('keydown', {
          key, code: key, bubbles: true, composed: true
        }));
      };
      const pressEnter = (field: MathfieldElement): void => pressKey(field, 'Enter');

      // The switch shows text wherever the cursor stands after text, without being pressed.
      it('should stay in text mode when text the cursor was placed after is deleted', fakeAsync(() => {
        const field = createFormulaField();
        formulaField.ngOnChanges({ value: new SimpleChange('', '\\text{Die Lösung}', false) });
        field.focus();
        tick(60);
        field.executeCommand('moveToMathfieldEnd');
        expect(field.mode).toBe('text');
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        expect(field.mode).toBe('text');
        flush();
      }));

      /* As an answer that is resumed. The switch is shown only afterwards: its first check would find the
         mode changed under it, which Angular reports in development mode. */
      it('should stay in text mode when an answer in text the field starts with is deleted', fakeAsync(() => {
        const answerFixture = TestBed.createComponent(MathInputComponent);
        formulaField = answerFixture.componentInstance;
        formulaField.value = '\\text{Die Lösung}';
        formulaField.multiline = true;
        answerFixture.detectChanges();
        formulaField.enableModeSwitch = true;
        const field = formulaField.mathFieldElement;
        field.focus();
        tick(60);
        expect(field.mode).toBe('text');
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        expect(field.mode).toBe('text');
        flush();
      }));

      // Escape opens a LaTeX command, and a second one closes it again.
      it('should let a LaTeX command opened at the start of a line be closed again', fakeAsync(() => {
        const field = typeInTextMode();
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        pressKey(field, 'Escape');
        expect(field.mode).toBe('latex');
        pressKey(field, 'Escape');
        expect(field.mode).not.toBe('latex');
        flush();
      }));

      it('should go into formula mode at the start of a line once the switch is turned off', fakeAsync(() => {
        const field = typeInTextMode();
        formulaField.enableModeSwitch = false;
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        expect(field.mode).toBe('math');
        flush();
      }));

      // Only text deleted at once leaves empty lines behind that nobody made.
      it('should keep empty lines made on purpose when a character after them is deleted', fakeAsync(() => {
        const field = createFormulaField();
        switchTo('text');
        tick(60);
        pressEnter(field);
        pressEnter(field);
        field.executeCommand(['typedText', 'x']);
        field.executeCommand('deleteBackward');
        // MathLive announces the change one turn of the event loop later
        tick();
        expect(field.getValue()).toBe('\\displaylines{\\\\ \\\\ }');
        flush();
      }));

      it('should stay in text mode when what was typed is deleted again', fakeAsync(() => {
        const field = typeInTextMode();
        field.executeCommand('deleteBackward');
        field.executeCommand('deleteBackward');
        expect(field.getValue()).toBe('');
        expect(field.mode).toBe('text');
        field.executeCommand(['typedText', 'c']);
        expect(field.getValue()).toBe('\\text{c}');
        flush();
      }));

      it('should stay in text mode when everything is selected and deleted', fakeAsync(() => {
        const field = typeInTextMode();
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        expect(field.getValue()).toBe('');
        expect(field.mode).toBe('text');
        flush();
      }));

      // MathLive would keep the lines, empty, and the field their height.
      it('should go back to one empty line when text on several lines is selected and deleted', fakeAsync(() => {
        const field = typeInTextMode();
        pressEnter(field);
        field.executeCommand(['typedText', 'cd']);
        pressEnter(field);
        field.executeCommand(['typedText', 'ef']);
        const emitSpy = vi.spyOn(formulaField.valueChange, 'emit');
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        // MathLive announces the change one turn of the event loop later
        tick();
        expect(field.getValue()).toBe('');
        expect(emitSpy).toHaveBeenLastCalledWith('');
        expect(field.mode).toBe('text');
        field.executeCommand(['typedText', 'g']);
        expect(field.getValue()).toBe('\\text{g}');
        flush();
      }));

      it('should stay in text mode when a line below text is emptied', fakeAsync(() => {
        const field = typeInTextMode();
        pressEnter(field);
        field.executeCommand(['typedText', 'cd']);
        field.executeCommand('deleteBackward');
        field.executeCommand('deleteBackward');
        // MathLive announces the change one turn of the event loop later; the line above keeps the field.
        tick();
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}\\\\ }');
        expect(field.mode).toBe('text');
        field.executeCommand(['typedText', 'e']);
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}\\\\ \\text{e}}');
        flush();
      }));

      // As after a click into the space empty lines leave in the field.
      it('should stay in text mode on an empty line the cursor is moved onto', fakeAsync(() => {
        const field = typeInTextMode();
        pressEnter(field);
        field.executeCommand('moveUp');
        field.executeCommand('moveDown');
        expect(field.getValue()).toBe('\\displaylines{\\text{ab}\\\\ }');
        expect(field.mode).toBe('text');
        flush();
      }));

      it('should go into formula mode at the start of a line when the switch is set to it', fakeAsync(() => {
        const field = typeInTextMode();
        field.executeCommand('selectAll');
        field.executeCommand('deleteBackward');
        switchTo('math');
        expect(field.mode).toBe('math');
        flush();
      }));
    });

    // Only the change of mode a typed sign brings is called off, not the one of the next cursor move.
    it('should let the cursor moved right after a sign typed in text take the field into a formula', fakeAsync(() => {
      component.enableModeSwitch = true;
      focusField();
      component.setParseMode(createParseModeChange('text'));
      component.mathFieldElement.executeCommand(['typedText', 'a']);
      component.mathFieldElement.executeCommand('moveToPreviousChar');
      expect(component.mathFieldElement.mode).toBe('math');
      flush();
    }));

    /* Return in a single-line field adds no line, and so no selection ends its mark; a deletion that follows
       before the next turn of the event loop is not marked all the same. */
    it('should let a deletion right after Return take the field into a formula', fakeAsync(() => {
      const field = component.mathFieldElement;
      component.enableModeSwitch = true;
      field.setValue('x\\text{a}');
      focusField();
      field.mode = 'text';
      field.executeCommand('commit');
      field.executeCommand('deleteBackward');
      expect(field.mode).toBe('math');
      flush();
    }));

    it('should let a formula take the field out of text mode when the mode cannot be switched', fakeAsync(() => {
      focusField();
      component.mathFieldElement.mode = 'text';
      component.mathFieldElement.executeCommand(['typedText', 'a']);
      pressGreekAlpha();
      expect(component.mathFieldElement.mode).toBe('math');
      flush();
    }));

    /* Return in a single-line field adds no line, and so no selection would end a mark: it is not marked in
       a field whose mode cannot be switched, and a formula right after it is no text. */
    it('should let a formula right after Return take the field out of text mode', fakeAsync(() => {
      const field = component.mathFieldElement;
      field.setValue('x\\text{a}');
      focusField();
      field.mode = 'text';
      field.executeCommand('commit');
      pressGreekAlpha();
      expect(field.mode).toBe('math');
      flush();
    }));
  });

  it('should emit focusOut and hide the virtual keyboard at once when the focus moves to another element', () => {
    const emitSpy = vi.spyOn(component.focusOut, 'emit');
    const hideSpy = vi.spyOn(window.mathVirtualKeyboard, 'hide');
    component.onFocusOut(new FocusEvent('focusout', { relatedTarget: document.createElement('input') }));
    expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
    expect(hideSpy).toHaveBeenCalled();
  });

  describe('on a focus out that does not name another element (#1600)', () => {
    /* What a tap on a key of the formula keyboard gives on the iPad: it is only acted on once it is
       clear that the field did not get its focus back. */
    let emitSpy: ReturnType<typeof vi.spyOn>;
    let hideSpy: ReturnType<typeof vi.spyOn>;

    const focusAfterwards = (element: Element | null): void => {
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(element);
    };

    beforeEach(() => {
      emitSpy = vi.spyOn(component.focusOut, 'emit');
      hideSpy = vi.spyOn(window.mathVirtualKeyboard, 'hide');
    });

    it('should not act before it is clear where the focus went', fakeAsync(() => {
      focusAfterwards(document.body);
      component.onFocusOut(new FocusEvent('focusout'));
      expect(emitSpy).not.toHaveBeenCalled();
      expect(hideSpy).not.toHaveBeenCalled();
      tick();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit focusOut and hide the virtual keyboard when the field has not got its focus back', fakeAsync(() => {
      focusAfterwards(document.body);
      component.onFocusOut(new FocusEvent('focusout'));
      tick();
      expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
      expect(hideSpy).toHaveBeenCalled();
    }));

    it('should keep the virtual keyboard open when the field has got its focus back', fakeAsync(() => {
      focusAfterwards(component.mathFieldElement);
      component.onFocusOut(new FocusEvent('focusout'));
      tick();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(hideSpy).not.toHaveBeenCalled();
    }));

    it('should treat a focus out into the virtual keyboard the same way', fakeAsync(() => {
      const keyboard = document.createElement('div');
      keyboard.className = 'ML__keyboard';
      const keycap = keyboard.appendChild(document.createElement('div'));
      focusAfterwards(component.mathFieldElement);
      component.onFocusOut(new FocusEvent('focusout', { relatedTarget: keycap }));
      tick();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(hideSpy).not.toHaveBeenCalled();
    }));

    it('should emit focusOut but leave the keyboard to the math field that has the focus by now', fakeAsync(() => {
      focusAfterwards(new MathfieldElement());
      component.onFocusOut(new FocusEvent('focusout'));
      tick();
      expect(emitSpy).toHaveBeenCalledWith(component.mathFieldElement);
      expect(hideSpy).not.toHaveBeenCalled();
    }));

    it('should report a focus out only once for the two events of one blur', fakeAsync(() => {
      focusAfterwards(document.body);
      component.onFocusOut(new FocusEvent('focusout'));
      component.onFocusOut(new FocusEvent('focusout'));
      tick();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    }));
  });
});

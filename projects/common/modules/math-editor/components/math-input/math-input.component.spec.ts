import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { MathfieldElement } from 'mathlive';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { EmptyBoxRestorer } from 'common/modules/math-editor/utils/empty-box-restorer';
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

    const pressEnter = (field: MathfieldElement, mode?: 'math' | 'text'): void => {
      field.focus();
      field.executeCommand('moveToMathfieldEnd');
      if (mode) field.mode = mode;
      // MathLive listens on its own input element in the shadow root, not on the host.
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', bubbles: true, composed: true
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
      pressEnter(field);
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

    it('should start a new line on Enter', () => {
      const multiline = createMultilineField('a+b');
      pressEnter(multiline.mathFieldElement);
      multiline.mathFieldElement.insert('c');
      expect(multiline.mathFieldElement.getValue()).toBe('\\displaylines{a+b\\\\ c}');
    });

    it('should stay in text mode on Enter in text mode', () => {
      const multiline = createMultilineField('\\text{ab}');
      pressEnter(multiline.mathFieldElement, 'text');
      expect(multiline.mathFieldElement.mode).toBe('text');
    });

    it('should stay in math mode on Enter in math mode', () => {
      const multiline = createMultilineField('a+b');
      pressEnter(multiline.mathFieldElement, 'math');
      expect(multiline.mathFieldElement.mode).toBe('math');
    });

    it('should not start a new line on Enter when single-line', () => {
      pressEnter(component.mathFieldElement);
      expect(component.mathFieldElement.getValue()).toBe('1+2');
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
      multiline.ngOnChanges({ value: new SimpleChange('', 'y', false) });
      pressEnter(multiline.mathFieldElement);
      expect(multiline.mathFieldElement.getValue()).toBe('\\displaylines{y\\\\ }');
    });

    /* Moved in the page, as by a drag in the editor, MathLive builds the field anew from a value of one
       line that it keeps without `\displaylines`. */
    it('should start a new line on Enter after the field was moved in the page', async () => {
      const field = createMultilineField('a').mathFieldElement;
      const mounted = new Promise(resolve => {
        field.addEventListener('mount', resolve, { once: true });
      });
      field.parentElement?.appendChild(field);
      await mounted;
      pressEnter(field);
      expect(field.getValue()).toBe('\\displaylines{a\\\\ }');
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

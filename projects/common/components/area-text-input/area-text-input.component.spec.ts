import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RangeSelectionService } from 'common/services/range-selection.service';
import { AreaTextInputComponent } from './area-text-input.component';

describe('AreaTextInputComponent', () => {
  let component: AreaTextInputComponent;
  let fixture: ComponentFixture<AreaTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AreaTextInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AreaTextInputComponent);
    component = fixture.componentInstance;
    component.value = 'test';
    fixture.detectChanges();
  });

  it('should emit valueChanged on input', () => {
    vi.spyOn(component.valueChanged, 'emit');
    const span = fixture.nativeElement.querySelector('span');
    span.textContent = 'new value';
    component.onInput();
    expect(component.valueChanged.emit).toHaveBeenCalledWith('new value');
  });

  it('should set display type based on value', () => {
    const span = fixture.nativeElement.querySelector('span');
    span.textContent = '';
    component.onInput();
    expect(component.displayType).toBe('inline-block');

    span.textContent = 'content';
    component.onInput();
    expect(component.displayType).toBe('inline');
  });

  /* Inserting a formula at the start of the text empties the part in front of it from outside. The part
     stayed displayed as text until it was focused, so the formula started 14 px too far in (#1011). */
  it('should mark the part as empty once its value is emptied from outside', () => {
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();

    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('empty');
    expect(span.style.display).toBe('inline-block');
  });

  /* The player's keys set the text through the form value and report what the part shows right after. A
     part that still showed the text from before the key reported that one (#1710). */
  describe('value set from outside', () => {
    let span: HTMLSpanElement;

    beforeEach(() => {
      span = fixture.nativeElement.querySelector('span');
    });

    it('should show it at once, also where the binding holds it already beside text typed on the device (#1710)',
       () => {
         span.textContent = 'testd';

         component.showValue('test');

         expect(span.textContent).toBe('test');
       });

    it('should mark the part as empty when the value empties it', () => {
      component.showValue('');
      fixture.detectChanges();

      expect(span.style.display).toBe('inline-block');
    });
  });

  it('should emit remove event on keyup if removePressed was set', () => {
    vi.spyOn(component.remove, 'emit');
    component.removePressed = true;
    const event = new KeyboardEvent('keyup', { key: 'Backspace' });
    component.keyUp(event);
    expect(component.remove.emit).toHaveBeenCalledWith('Backspace');
    expect(component.removePressed).toBe(false);
  });

  describe('line break of the browser', () => {
    let span: HTMLSpanElement;

    const placeCaret = (node: Node, offset: number): void => {
      const caret = document.createRange();
      caret.setStart(node, offset);
      caret.collapse(true);
      RangeSelectionService.addRange(caret);
    };

    beforeEach(() => {
      span = fixture.nativeElement.querySelector('span');
      vi.spyOn(component.valueChanged, 'emit');
    });

    /* Firefox's own Enter leaves the caret between the line break and a `<br>`, where it is drawn at the end
       of the line before. */
    it('should put the caret on the new line before reporting the text (#1011)', () => {
      span.textContent = 'abc';
      span.append(document.createTextNode('\n'), document.createElement('br'));
      placeCaret(span, 2);

      span.dispatchEvent(new InputEvent('input', { inputType: 'insertParagraph' }));

      const caret = RangeSelectionService.getRange() as Range;
      expect(caret.startContainer).toBe(span.childNodes[2]);
      expect(caret.startOffset).toBe(0);
      expect(component.valueChanged.emit).toHaveBeenCalledWith('abc\n\n');
    });

    it('should leave the caret where typing put it', () => {
      span.textContent = 'abc\nd';
      placeCaret(span.firstChild as Text, 4);

      span.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: 'd' }));

      const caret = RangeSelectionService.getRange() as Range;
      expect(span.childNodes.length).toBe(1);
      expect(caret.startOffset).toBe(4);
    });
  });

  /* Backspace at the start of the part and Delete at its end also remove the formula beside it. The text
     can be split into several nodes -- by the browser's own Enter and by the player's keyboard -- so a
     node's own start or end does not tell. */
  describe('Backspace and Delete at the edge of the text part', () => {
    let span: HTMLSpanElement;

    const pressAt = (node: Node, offset: number, key: string): boolean => {
      const caret = document.createRange();
      caret.setStart(node, offset);
      caret.collapse(true);
      RangeSelectionService.addRange(caret);
      component.keyDown(new KeyboardEvent('keydown', { key }));
      return component.removePressed;
    };

    beforeEach(() => {
      span = fixture.nativeElement.querySelector('span');
    });

    it('should take Backspace at the start of the part for one that removes what stands before it', () => {
      span.textContent = 'abc';

      expect(pressAt(span.firstChild as Text, 0, 'Backspace')).toBe(true);
    });

    it('should not take Backspace at the start of a later line for the start of the part (#1011)', () => {
      span.textContent = 'abc\n\n';
      const lineStart = (span.firstChild as Text).splitText(4);

      expect(pressAt(lineStart, 0, 'Backspace')).toBe(false);
    });

    it('should take Delete at the end of the part for one that removes what stands after it', () => {
      span.textContent = 'abcdef';
      const end = (span.firstChild as Text).splitText(3);

      expect(pressAt(end, 3, 'Delete')).toBe(true);
    });

    it('should not take Delete at the end of a text node inside the part for the end of the part', () => {
      span.textContent = 'abcdef';
      (span.firstChild as Text).splitText(3);

      expect(pressAt(span.firstChild as Text, 3, 'Delete')).toBe(false);
    });
  });
});

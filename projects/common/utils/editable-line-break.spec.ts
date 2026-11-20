import { RangeSelectionService } from 'common/services/range-selection.service';
import { EditableLineBreak } from './editable-line-break';

describe('EditableLineBreak', () => {
  describe('keyToInsert', () => {
    it('should double a line break at the end of the area (#1011)', () => {
      expect(EditableLineBreak.keyToInsert('\n', true)).toBe('\n\n');
    });

    it('should insert a single line break in front of anything', () => {
      expect(EditableLineBreak.keyToInsert('\n', false)).toBe('\n');
    });

    it('should insert any other key as it is, at the end as well', () => {
      expect(EditableLineBreak.keyToInsert('x', true)).toBe('x');
    });
  });

  describe('withoutHiddenLineBreak', () => {
    it('should drop a line break at the end that follows text (#1011)', () => {
      expect(EditableLineBreak.withoutHiddenLineBreak('abc\n')).toBe('abc');
      expect(EditableLineBreak.withoutHiddenLineBreak('abc\ndef\n')).toBe('abc\ndef');
    });

    it('should drop a line break that is all the text holds', () => {
      expect(EditableLineBreak.withoutHiddenLineBreak('\n')).toBe('');
    });

    it('should keep the line break that keeps an empty last line open', () => {
      expect(EditableLineBreak.withoutHiddenLineBreak('abc\n\n')).toBe('abc\n\n');
    });

    it('should keep a text that does not end with a line break', () => {
      expect(EditableLineBreak.withoutHiddenLineBreak('abc\ndef')).toBe('abc\ndef');
    });
  });

  describe('isLastPart', () => {
    let area: HTMLDivElement;

    /** A formula area's text parts as the template renders them: one segment element each. */
    const addPart = (): HTMLSpanElement => {
      const segment = document.createElement('aspect-text-area-math-segment');
      const editable = document.createElement('span');
      segment.appendChild(editable);
      area.appendChild(segment);
      return editable;
    };

    beforeEach(() => {
      area = document.createElement('div');
      document.body.appendChild(area);
    });

    afterEach(() => {
      area.remove();
    });

    it('should take the area\'s last part for its end', () => {
      addPart();
      const last = addPart();

      expect(EditableLineBreak.isLastPart(last)).toBe(true);
    });

    it('should not take a part that a formula follows for the end of the area', () => {
      const first = addPart();
      addPart();

      expect(EditableLineBreak.isLastPart(first)).toBe(false);
    });
  });

  describe('lastCaretOffset', () => {
    it('should end in front of the line break that keeps the last line open', () => {
      expect(EditableLineBreak.lastCaretOffset('qw\n\n')).toBe(3);
    });

    it('should end in front of that line break once the line holds text', () => {
      expect(EditableLineBreak.lastCaretOffset('qw\ng\n')).toBe(4);
    });

    it('should end behind the last character of a text without a line break at its end', () => {
      expect(EditableLineBreak.lastCaretOffset('qw\ng')).toBe(4);
    });
  });

  describe('moveCaretToNextLine', () => {
    let editable: HTMLSpanElement;
    let other: HTMLSpanElement;

    const placeCaret = (node: Node, start: number, end: number = start): void => {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      RangeSelectionService.addRange(range);
    };

    beforeEach(() => {
      editable = document.createElement('span');
      editable.contentEditable = 'true';
      editable.style.whiteSpace = 'pre-wrap';
      editable.textContent = 'abc\n\n';
      other = document.createElement('span');
      other.textContent = 'x\ny';
      document.body.append(editable, other);
      editable.focus();
    });

    afterEach(() => {
      editable.remove();
      other.remove();
    });

    it('should put a caret after a line break at the start of a text node of its own (#1011)', () => {
      placeCaret(editable.firstChild as Text, 4);

      EditableLineBreak.moveCaretToNextLine(editable);

      const caret = RangeSelectionService.getRange() as Range;
      expect(caret.collapsed).toBe(true);
      expect(caret.startContainer).toBe(editable.childNodes[1]);
      expect(caret.startOffset).toBe(0);
      expect((editable.childNodes[1] as Text).data).toBe('\n');
      expect(editable.textContent).toBe('abc\n\n');
    });

    it('should move a caret at the end of a node that ends with a line break into the next one', () => {
      (editable.firstChild as Text).splitText(4);
      placeCaret(editable.firstChild as Text, 4);

      EditableLineBreak.moveCaretToNextLine(editable);

      const caret = RangeSelectionService.getRange() as Range;
      expect(editable.childNodes.length).toBe(2);
      expect(caret.startContainer).toBe(editable.childNodes[1]);
      expect(caret.startOffset).toBe(0);
    });

    it('should leave a caret that follows anything but a line break', () => {
      placeCaret(editable.firstChild as Text, 3);

      EditableLineBreak.moveCaretToNextLine(editable);

      const caret = RangeSelectionService.getRange() as Range;
      expect(editable.childNodes.length).toBe(1);
      expect(caret.startContainer).toBe(editable.firstChild);
      expect(caret.startOffset).toBe(3);
    });

    it('should leave a selection with extent', () => {
      placeCaret(editable.firstChild as Text, 4, 5);

      EditableLineBreak.moveCaretToNextLine(editable);

      const selection = RangeSelectionService.getRange() as Range;
      expect(editable.childNodes.length).toBe(1);
      expect(RangeSelectionService.getSelectionRange(selection, editable)).toEqual({ start: 4, end: 5 });
    });

    /* Firefox's own Enter: the line break, then a `<br>`, and the caret between the two, in the element. */
    it('should give the line after Firefox\'s line break a text node to start in (#1011)', () => {
      editable.textContent = 'abc';
      editable.append(document.createTextNode('\n'), document.createElement('br'));
      placeCaret(editable, 2);

      EditableLineBreak.moveCaretToNextLine(editable);

      const caret = RangeSelectionService.getRange() as Range;
      expect(editable.querySelector('br')).toBeNull();
      expect(caret.startContainer).toBe(editable.childNodes[2]);
      expect(caret.startOffset).toBe(0);
      expect(editable.textContent).toBe('abc\n\n');
    });

    it('should leave a caret between elements that follows no line break', () => {
      editable.textContent = 'abc';
      editable.append(document.createElement('br'));
      placeCaret(editable, 1);

      EditableLineBreak.moveCaretToNextLine(editable);

      const caret = RangeSelectionService.getRange() as Range;
      expect(editable.querySelector('br')).not.toBeNull();
      expect(caret.startContainer).toBe(editable);
      expect(caret.startOffset).toBe(1);
    });

    it('should leave a caret outside the element', () => {
      placeCaret(other.firstChild as Text, 2);

      EditableLineBreak.moveCaretToNextLine(editable);

      expect(other.childNodes.length).toBe(1);
    });
  });
});

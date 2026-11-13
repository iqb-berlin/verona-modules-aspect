import { RangeSelectionService } from 'common/services/range-selection.service';
import { CaretScroller } from './caret-scroller';

/* Real layout in the test browser: a scroll area 100 px high with ten lines of 27 px, so that lines 1 to 3
   fit and line 4 is already cut off. */
describe('CaretScroller', () => {
  const lineHeight = 27;
  const lines = Array.from({ length: 10 }, (_, index) => `Zeile ${index + 1}`);
  let scrollArea: HTMLDivElement;
  let editable: HTMLDivElement;

  /** Puts the caret at the end of the given line (counted from 1) and returns the selection's range. */
  const placeCaretAtEndOfLine = (line: number): Range => {
    const offset = lines.slice(0, line).join('\n').length;
    RangeSelectionService.setSelectionRange(editable, offset, offset);
    return RangeSelectionService.getRange() as Range;
  };

  beforeEach(() => {
    scrollArea = document.createElement('div');
    scrollArea.style.cssText = `height: 100px; overflow-y: auto; font-size: 20px; line-height: ${lineHeight}px;`;
    editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.style.whiteSpace = 'pre-wrap';
    editable.textContent = lines.join('\n');
    scrollArea.appendChild(editable);
    document.body.appendChild(scrollArea);
    editable.focus();
  });

  afterEach(() => {
    scrollArea.remove();
  });

  it('should leave the scroll position alone while the line of the caret is visible', () => {
    scrollArea.scrollTop = 2 * lineHeight;
    const range = placeCaretAtEndOfLine(3);

    CaretScroller.scrollIntoView(range);

    // Aligned to the bottom, as before #1661, the area moved back by more than a line
    expect(scrollArea.scrollTop).toBe(2 * lineHeight);
  });

  it('should scroll a line below the edge just far enough to show all of it', () => {
    const range = placeCaretAtEndOfLine(8);

    CaretScroller.scrollIntoView(range);

    // The bottom of line 8 at the bottom edge: a marker ending at the baseline stopped a few pixels short
    expect(Math.abs(scrollArea.scrollTop - (8 * lineHeight - scrollArea.clientHeight))).toBeLessThanOrEqual(1);
  });

  it('should show all of a line that is higher than the text, as the first line of a formula area is', () => {
    // The formula area raises its first line by 28 px with an empty span of a larger line height
    const strut = document.createElement('span');
    strut.style.lineHeight = `${lineHeight + 28}px`;
    editable.prepend(strut);
    scrollArea.scrollTop = 20;
    const range = placeCaretAtEndOfLine(1);

    CaretScroller.scrollIntoView(range);

    expect(scrollArea.scrollTop).toBe(0);
  });

  it('should show all of a line below the edge that holds a formula higher than the text', () => {
    // Reaching below the baseline, as a fraction does with its denominator
    const formula = document.createElement('span');
    formula.style.cssText = 'display: inline-block; width: 20px; height: 60px; vertical-align: -30px;';
    placeCaretAtEndOfLine(8).insertNode(formula);
    const range = placeCaretAtEndOfLine(8);

    CaretScroller.scrollIntoView(range);

    const areaRect = scrollArea.getBoundingClientRect();
    const formulaRect = formula.getBoundingClientRect();
    expect(formulaRect.bottom).toBeLessThanOrEqual(areaRect.bottom + 1);
    expect(formulaRect.top).toBeGreaterThanOrEqual(areaRect.top - 1);
  });

  it('should show at least the caret in a line higher than the scroll area', () => {
    const formula = document.createElement('span');
    formula.style.cssText = 'display: inline-block; width: 20px; height: 160px;';
    placeCaretAtEndOfLine(8).insertNode(formula);
    const range = placeCaretAtEndOfLine(8);

    CaretScroller.scrollIntoView(range);

    // The last character before the caret, at the bottom of the line, below the top of the formula
    const textBeforeCaret = editable.firstChild as Text;
    const lastCharacter = document.createRange();
    lastCharacter.setStart(textBeforeCaret, textBeforeCaret.length - 1);
    lastCharacter.setEnd(textBeforeCaret, textBeforeCaret.length);
    const areaRect = scrollArea.getBoundingClientRect();
    const characterRect = lastCharacter.getBoundingClientRect();
    expect(characterRect.bottom).toBeLessThanOrEqual(areaRect.bottom + 1);
    expect(characterRect.top).toBeGreaterThanOrEqual(areaRect.top - 1);
  });

  it('should take the marker out again and leave the caret where it was', () => {
    const offset = lines.slice(0, 8).join('\n').length;
    const range = placeCaretAtEndOfLine(8);

    CaretScroller.scrollIntoView(range);

    expect(editable.querySelector('span')).toBeNull();
    expect(editable.textContent).toBe(lines.join('\n'));
    const selection = RangeSelectionService.getRange() as Range;
    expect(RangeSelectionService.getSelectionRange(selection, editable)).toEqual({ start: offset, end: offset });
  });
});

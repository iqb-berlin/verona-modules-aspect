import { RangeSelectionService } from './range-selection.service';

describe('RangeSelectionService', () => {
  let container: HTMLElement;
  let helloTextNode: Node;
  let worldTextNode: Node;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<span>Hello <b>World</b></span>';
    document.body.appendChild(container);
    helloTextNode = container.querySelector('span')?.firstChild as Node;
    worldTextNode = container.querySelector('b')?.firstChild as Node;
    window.getSelection()?.removeAllRanges();
  });

  afterEach(() => {
    window.getSelection()?.removeAllRanges();
    container.remove();
  });

  const selectHelloWorldRange = (start: number, end: number): Range => {
    const range = document.createRange();
    range.setStart(helloTextNode, start);
    range.setEnd(worldTextNode, end);
    RangeSelectionService.addRange(range);
    return range;
  };

  describe('getRange', () => {
    it('should return null when nothing is selected', () => {
      expect(RangeSelectionService.getRange()).toBeNull();
    });

    it('should return the currently selected range', () => {
      selectHelloWorldRange(0, 5);
      expect(RangeSelectionService.getRange()?.toString()).toBe('Hello World');
    });
  });

  describe('isDescendantOf', () => {
    it('should detect direct and nested descendants', () => {
      expect(RangeSelectionService.isDescendantOf(helloTextNode, container)).toBe(true);
      expect(RangeSelectionService.isDescendantOf(worldTextNode, container)).toBe(true);
    });

    it('should return false for nodes outside of the element', () => {
      expect(RangeSelectionService.isDescendantOf(document.body, container)).toBe(false);
      expect(RangeSelectionService.isDescendantOf(null, container)).toBe(false);
    });
  });

  describe('isRangeInside', () => {
    it('should return true when start and end container are inside the element', () => {
      const range = selectHelloWorldRange(1, 3);
      expect(RangeSelectionService.isRangeInside(range, container)).toBe(true);
    });

    it('should return false when the range reaches outside of the element', () => {
      const outside = document.createElement('p');
      outside.textContent = 'outside';
      document.body.appendChild(outside);
      const range = document.createRange();
      range.setStart(helloTextNode, 0);
      range.setEnd(outside.firstChild as Node, 2);
      expect(RangeSelectionService.isRangeInside(range, container)).toBe(false);
      outside.remove();
    });
  });

  describe('getSelectionRange', () => {
    it('should calculate offsets across multiple text nodes', () => {
      const range = selectHelloWorldRange(2, 3);
      // 'Hello ' has 6 characters, so offset 3 in 'World' is 9 overall
      expect(RangeSelectionService.getSelectionRange(range, container)).toEqual({ start: 2, end: 9 });
    });

    it('should return zero offsets for a range outside of the input element', () => {
      const outside = document.createElement('p');
      outside.textContent = 'outside';
      document.body.appendChild(outside);
      const range = document.createRange();
      range.selectNodeContents(outside);
      expect(RangeSelectionService.getSelectionRange(range, container)).toEqual({ start: 0, end: 0 });
      outside.remove();
    });
  });

  describe('setRange', () => {
    it('should select the given element', () => {
      RangeSelectionService.setRange(container.querySelector('b') as HTMLElement);
      expect(window.getSelection()?.toString()).toBe('World');
    });
  });

  describe('addRange', () => {
    it('should replace an existing selection', () => {
      selectHelloWorldRange(0, 5);
      const range = document.createRange();
      range.selectNodeContents(worldTextNode);
      RangeSelectionService.addRange(range);
      expect(window.getSelection()?.rangeCount).toBe(1);
      expect(window.getSelection()?.toString()).toBe('World');
    });
  });

  describe('setSelectionRange', () => {
    it('should select the text between the given character offsets', () => {
      RangeSelectionService.setSelectionRange(container, 2, 9);
      expect(window.getSelection()?.toString()).toBe('llo Wor');
      const range = RangeSelectionService.getRange() as Range;
      expect(RangeSelectionService.getSelectionRange(range, container)).toEqual({ start: 2, end: 9 });
    });
  });
});

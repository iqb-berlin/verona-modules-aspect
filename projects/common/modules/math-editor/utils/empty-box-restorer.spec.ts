import { MathfieldElement } from 'mathlive';
import { EmptyBoxRestorer } from './empty-box-restorer';

/* MathLive builds its model when the field joins the page. Each test inserts a structure with one box
   selected, types into the box and deletes, as a user does on the keyboard; a deletion counts the boxes
   before it and then asks for the box, as `MathInputComponent` does. */
describe('EmptyBoxRestorer (#760)', () => {
  let field: MathfieldElement;

  beforeEach(() => {
    field = new MathfieldElement();
    document.body.appendChild(field);
  });

  afterEach(() => {
    field.remove();
  });

  const insertAndType = (structure: string, ...characters: string[]): void => {
    field.insert(structure, { selectionMode: 'placeholder' });
    characters.forEach(character => field.insert(character));
  };

  const deleteBackward = (): void => {
    const boxesBefore = EmptyBoxRestorer.countBoxes(field);
    field.executeCommand('deleteBackward');
    EmptyBoxRestorer.restore(field, boxesBefore);
  };

  it('should put the box back into an emptied root', () => {
    insertAndType('\\sqrt{\\placeholder{}}', '2');
    deleteBackward();
    expect(field.getValue()).toBe('\\sqrt{\\placeholder{}}');
  });

  it('should leave the box selected, so that the next character replaces it', () => {
    insertAndType('\\sqrt{\\placeholder{}}', '2');
    deleteBackward();
    field.insert('3');
    expect(field.getValue()).toBe('\\sqrt3');
  });

  it('should let the next deletion remove the root, as with a freshly inserted one', () => {
    insertAndType('\\sqrt{\\placeholder{}}', '2');
    deleteBackward();
    deleteBackward();
    expect(field.getValue()).toBe('');
  });

  /* MathLive deletes the box of a root with an index alone. Put back, it came back on every deletion, and
     the root could not be deleted at all. */
  it('should not put the box back where the deletion removed the box itself', () => {
    insertAndType('\\sqrt[3]{\\placeholder{}}', '5');
    deleteBackward();
    expect(field.getValue()).toBe('\\sqrt[3]{\\placeholder{}}');
    deleteBackward();
    expect(field.getValue()).toBe('\\sqrt[3]{}');
    deleteBackward();
    expect(field.getValue()).toBe('');
  });

  // MathLive takes an emptied index out of the root, which is then a square root
  it('should leave an emptied index of a root to MathLive', () => {
    insertAndType('\\sqrt[\\placeholder{}]{5}', '3');
    deleteBackward();
    expect(field.getValue()).toBe('\\sqrt5');
  });

  it('should put the box back into an emptied numerator', () => {
    insertAndType('\\frac{\\placeholder{}}{4}', '1');
    deleteBackward();
    expect(field.getValue()).toBe('\\frac{\\placeholder{}}{4}');
  });

  // Without its box, an emptied numerator stayed in place however often it was deleted
  it('should let the next deletion remove the fraction of an emptied numerator', () => {
    insertAndType('\\frac{\\placeholder{}}{4}', '1');
    deleteBackward();
    deleteBackward();
    expect(field.getValue()).toBe('4');
  });

  it('should put the box back into an emptied denominator', () => {
    insertAndType('\\frac{3}{\\placeholder{}}', '4');
    deleteBackward();
    expect(field.getValue()).toBe('\\frac{3}{\\placeholder{}}');
  });

  // An emptied exponent goes away on the next deletion; a box would keep it
  it('should leave an emptied exponent as it is', () => {
    insertAndType('3^{\\placeholder{}}', '2');
    field.executeCommand('deleteBackward');
    const emptied = field.getValue();
    EmptyBoxRestorer.restore(field, 0);
    expect(field.getValue()).toBe(emptied);
  });

  it('should leave a root that still holds a character as it is', () => {
    insertAndType('\\sqrt{\\placeholder{}}', '2', '5');
    deleteBackward();
    expect(field.getValue()).toBe('\\sqrt2');
  });

  it('should leave a deletion outside of a root or fraction as it is', () => {
    field.insert('ab');
    deleteBackward();
    expect(field.getValue()).toBe('a');
  });

  it('should leave a field alone that MathLive has not built', () => {
    const detached = new MathfieldElement();
    expect(() => EmptyBoxRestorer.restore(detached, 0)).not.toThrow();
    expect(detached.getValue()).toBe('');
  });
});

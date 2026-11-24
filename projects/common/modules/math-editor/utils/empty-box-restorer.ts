import { MathfieldElement } from 'mathlive';

/** The part of an atom of MathLive's internal model that is read here. */
interface ModelAtom {
  type: string;
  parent?: ModelAtom;
  /** Which branch of its parent the atom is in, e.g. `body` or `above`. */
  parentBranch?: unknown;
  hasEmptyBranch(branch: unknown): boolean;
}

/** The part of MathLive's internal model that is read here. */
interface Model {
  position: number;
  at(offset: number): ModelAtom | undefined;
}

/**
 * Puts the box back into a root or fraction whose content was deleted (#760).
 *
 * A key of the formula keyboard inserts a root or a fraction with a box for each of its parts
 * (`\sqrt{\placeholder{}}`). Once the last character in such a part is deleted, MathLive leaves the part
 * empty, without a box (`\sqrt{}`), and lays it out lower: the root sign dropped by about 5px, and the
 * field changed its height. An emptied numerator could not even be deleted any more. With the box back,
 * the part looks as it did when it was inserted, and the next character replaces the box.
 *
 * Only after a character was deleted, never after the box itself: MathLive deletes a box together with
 * the whole root or fraction where the box was all of it, but alone where the root has an index or the
 * fraction another part with content. Put back there, the box would come back on every deletion, and the
 * root could not be deleted at all.
 *
 * Only the body of a root, and numerator and denominator of a fraction: MathLive takes an emptied index
 * out of a root, which then is a square root, and an emptied exponent goes on the next deletion. Other
 * structures that a key inserts with a box -- overline, vector arrow, |x|, exp() -- lose it the same way
 * and are not covered here. MathLive's public API names the caret's offset but not whether the part it is
 * in is empty, so this reads MathLive's internal model; without it, nothing happens.
 */
export class EmptyBoxRestorer {
  /** The branches handled, by MathLive's type of their atom: a root (`surd`) and a fraction (`genfrac`). */
  private static readonly BRANCHES = new Map<string, unknown[]>([
    ['surd', ['body']],
    ['genfrac', ['above', 'below']]
  ]);

  /** How many boxes the field holds; taken before a change, it tells `restore` what the change removed. */
  static countBoxes(field: MathfieldElement): number {
    return field.getValue().match(/\\placeholder\{\}/g)?.length ?? 0;
  }

  /**
   * Inserts a selected box if the caret is in an empty part of a root or fraction and the deletion that
   * emptied it removed no box. `boxesBefore` is `countBoxes` from before the deletion.
   */
  static restore(field: MathfieldElement, boxesBefore: number): void {
    if (EmptyBoxRestorer.countBoxes(field) < boxesBefore) return;
    const model = EmptyBoxRestorer.modelOf(field);
    // The atom before the caret; in an empty part, that is the part's invisible first atom
    const atom = model?.at(model.position);
    const parent = atom?.parent;
    if (!atom || atom.type !== 'first' || !parent) return;
    if (!EmptyBoxRestorer.BRANCHES.get(parent.type)?.includes(atom.parentBranch)) return;
    if (!parent.hasEmptyBranch(atom.parentBranch)) return;
    field.insert('\\placeholder{}', { selectionMode: 'placeholder', silenceNotifications: true });
  }

  private static modelOf(field: MathfieldElement): Model | undefined {
    const mathfield: unknown = Reflect.get(field, '_mathfield');
    if (typeof mathfield !== 'object' || mathfield === null) return undefined;
    const model: unknown = Reflect.get(mathfield, 'model');
    if (typeof model !== 'object' || model === null || typeof Reflect.get(model, 'at') !== 'function') {
      return undefined;
    }
    return model as Model;
  }
}

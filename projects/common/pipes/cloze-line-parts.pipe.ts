import { Pipe, PipeTransform } from '@angular/core';
import { ClozeDocumentContentNode } from 'common/models/elements/cloze';

/** One run of a cloze line. `keepTogether` is a word an inline child cut into, which has to move to
    the next line as a whole. */
export interface ClozeLineSegment {
  keepTogether: boolean;
  nodes: ClozeDocumentContentNode[];
}

interface LeadingWord {
  word: ClozeDocumentContentNode[];
  nextIndex: number;
  remainder: ClozeDocumentContentNode | null;
}

/** Reports whether the line may break at this character, so a non-breaking space stays with the word. */
function isBreakableSpace(char: string): boolean {
  return /[^\S\u00A0\u202F\uFEFF]/.test(char);
}

/** Returns the position of the last breakable space in the text, or -1 when there is none. */
function lastBreakableSpaceIndex(text: string): number {
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (isBreakableSpace(text[index])) {
      return index;
    }
  }
  return -1;
}

/** Returns the position of the first breakable space in the text, or -1 when there is none. */
function firstBreakableSpaceIndex(text: string): number {
  for (let index = 0; index < text.length; index += 1) {
    if (isBreakableSpace(text[index])) {
      return index;
    }
  }
  return -1;
}

/** The word glued to the left of an inline child: the suffix after the last breakable space,
    walking back across text nodes that have no space between them. */
function peelTrailingWord(pending: ClozeDocumentContentNode[]): ClozeDocumentContentNode[] {
  const peeled: ClozeDocumentContentNode[] = [];
  let done = false;
  while (pending.length > 0 && !done) {
    const last = pending[pending.length - 1];
    const text = last.type === 'text' ? (last.text ?? '') : null;
    const splitAt = text === null ? -1 : lastBreakableSpaceIndex(text);
    if (text === null || (text.length > 0 && splitAt === text.length - 1)) {
      done = true;
    } else if (text.length === 0) {
      pending.pop();
    } else if (splitAt === -1) {
      const removed = pending.pop();
      if (removed) {
        peeled.unshift(removed);
      }
    } else {
      pending[pending.length - 1] = { ...last, text: text.slice(0, splitAt + 1) };
      peeled.unshift({ ...last, text: text.slice(splitAt + 1) });
      done = true;
    }
  }
  return peeled;
}

/** Collects the letters before the next space after a gap, including any further gaps in that same word. */
function takeLeadingWord(nodes: readonly ClozeDocumentContentNode[], start: number): LeadingWord {
  const word: ClozeDocumentContentNode[] = [];
  let index = start;
  let remainder: ClozeDocumentContentNode | null = null;
  let done = false;
  while (index < nodes.length && !done) {
    const node = nodes[index];
    const text = node.type === 'text' ? (node.text ?? '') : null;
    if (text === null) {
      word.push(node);
      index += 1;
    } else if (text.length === 0) {
      index += 1;
    } else if (isBreakableSpace(text[0])) {
      done = true;
    } else if (firstBreakableSpaceIndex(text) === -1) {
      word.push(node);
      index += 1;
    } else {
      const splitAt = firstBreakableSpaceIndex(text);
      word.push({ ...node, text: text.slice(0, splitAt) });
      remainder = { ...node, text: text.slice(splitAt) };
      index += 1;
      done = true;
    }
  }
  return { word, nextIndex: index, remainder };
}

/** Splits a paragraph into runs and marks the run where a gap sits inside a word, so that run can stay on one line. */
function groupClozeLineParts(
  content: readonly ClozeDocumentContentNode[] | null | undefined
): ClozeLineSegment[] {
  if (!content?.length) {
    return [];
  }
  const segments: ClozeLineSegment[] = [];
  const pending: ClozeDocumentContentNode[] = [];
  /** Emits the text gathered before a gap as a run the line is allowed to break. */
  const flushPending = () => {
    if (pending.length > 0) {
      segments.push({ keepTogether: false, nodes: pending.splice(0, pending.length) });
    }
  };

  let index = 0;
  while (index < content.length) {
    const node = content[index];
    if (node.type === 'text') {
      pending.push(node);
      index += 1;
    } else {
      const trailing = peelTrailingWord(pending);
      flushPending();
      const leading = takeLeadingWord(content, index + 1);
      const nodes = [...trailing, node, ...leading.word];
      segments.push({ keepTogether: nodes.length > 1, nodes });
      if (leading.remainder) {
        pending.push(leading.remainder);
      }
      index = leading.nextIndex;
    }
  }
  flushPending();
  return segments;
}

@Pipe({
  name: 'clozeLineParts',
  standalone: false
})
export class ClozeLinePartsPipe implements PipeTransform {
  /** Runs the grouping for the paragraph content the template passes in. */
  transform(content: readonly ClozeDocumentContentNode[] | null | undefined): ClozeLineSegment[] {
    return groupClozeLineParts(content);
  }
}

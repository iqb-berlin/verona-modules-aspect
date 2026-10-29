import { Extension } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

interface HighlightState {
  visible: boolean;
  decorations: DecorationSet;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nonBreakingSpaceHighlight: {
      setNonBreakingSpacesVisible: (visible: boolean) => ReturnType;
    }
  }
}

const NON_BREAKING_SPACE = String.fromCharCode(0x00A0);
const NARROW_NON_BREAKING_SPACE = String.fromCharCode(0x202F);

/** The class each marked character gets; a narrow one is told apart from the full one by its own colour. */
const MARKER_CLASSES: Record<string, string> = {
  [NON_BREAKING_SPACE]: 'nbsp-marker',
  [NARROW_NON_BREAKING_SPACE]: 'narrow-nbsp-marker'
};

const MARKED_CHARACTERS = new RegExp(`[${NON_BREAKING_SPACE}${NARROW_NON_BREAKING_SPACE}]`, 'g');

const highlightKey = new PluginKey<HighlightState>('nonBreakingSpaceHighlight');

function decorate(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    // Offsets count UTF-16 units, as positions do; iterating by code point would drift behind an emoji.
    [...node.text.matchAll(MARKED_CHARACTERS)].forEach(match => {
      const from = pos + (match.index as number);
      decorations.push(Decoration.inline(from, from + 1, { class: MARKER_CLASSES[match[0]] }));
    });
  });
  return DecorationSet.create(doc, decorations);
}

/**
 * Shows where a non-breaking space or a narrow non-breaking space stands, which look like any other space (#1476).
 * The marking is a decoration and so lives in the view only: `getHTML()` and `getJSON()` serialise the document,
 * which never holds it, and the unit keeps exactly the text it had. It starts switched off, and switched off there is
 * nothing to compute.
 */
export const NonBreakingSpaceHighlight = Extension.create({
  name: 'nonBreakingSpaceHighlight',

  addCommands() {
    return {
      // tiptap dispatches `tr` itself once the command returns; marking it is all there is to do.
      setNonBreakingSpacesVisible: (visible: boolean) => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(highlightKey, visible);
        return true;
      }
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<HighlightState>({
        key: highlightKey,
        state: {
          init: () => ({ visible: false, decorations: DecorationSet.empty }),
          apply: (tr, previous) => {
            const switched: boolean | undefined = tr.getMeta(highlightKey);
            if (switched === undefined && !tr.docChanged) return previous;
            const visible = switched ?? previous.visible;
            return { visible, decorations: visible ? decorate(tr.doc) : DecorationSet.empty };
          }
        },
        props: {
          decorations: state => highlightKey.getState(state)?.decorations
        }
      })
    ];
  }
});

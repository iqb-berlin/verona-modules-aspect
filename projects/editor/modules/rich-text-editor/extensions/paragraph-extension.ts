import { Paragraph } from '@tiptap/extension-paragraph';
import { Command } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMargin: {
      setMargin: (newMargin: number) => ReturnType;
    };
  }
}

export const ParagraphExtension = Paragraph.extend({
  addAttributes() {
    return {
      margin: {
        default: 0,
        parseHTML: element => Number(element.style.marginBottom.slice(0, -2)),
        renderHTML: attributes => ({
          style: `margin-bottom: ${attributes.margin}px; margin-top: 0`
        })
      }
    };
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, newMargin: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos);
      if (node) {
        const nodeAttrs = { ...node.attrs, margin: newMargin };
        return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
      }
      return tr;
    };

    const applyMargin: (newMargin: number) => () => Command =
      newMargin => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let transaction;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          transaction = setNodeIndentMarkup(tr, pos, newMargin);
        });
        dispatch?.(transaction);
        return true;
      };

    return {
      setMargin: (newMargin: number) => applyMargin(newMargin)()
    };
  }
});

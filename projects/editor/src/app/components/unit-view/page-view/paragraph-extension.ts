import { Paragraph } from '@tiptap/extension-paragraph';
import { Command } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setMargin: { // TODO customParagraph: { ?
      setMargin: (newMargin: number) => ReturnType;
    };
  }
}

export const customParagraph = Paragraph.extend({
  addAttributes() {
    return {
      margin: {
        default: 10,
        parseHTML: element => {
          console.log('ggg', element.style.marginBottom);
          return Number(element.style.marginBottom.slice(0, -2));
        },
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

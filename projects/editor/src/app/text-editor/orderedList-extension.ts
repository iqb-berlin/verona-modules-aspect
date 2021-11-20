import { Command } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';
import { OrderedList } from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedListExtension: {
      setOrderedListStyle: (newStyle: string) => ReturnType;
    };
  }
}

export const orderedListExtension = OrderedList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'decimal',
        parseHTML: element => {
          return element.style.listStyleType;
        },
        renderHTML: attributes => ({
          style: `list-style: ${attributes.listStyle};`
        })
      }
    };
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, newStyle: string): Transaction => {
      const node = tr?.doc?.nodeAt(pos);
      if (node) {
        const nodeAttrs = { ...node.attrs, listStyle: newStyle };
        if (node.type.name !== 'text') {
          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
        }
      }
      return tr;
    };

    const applyListStyle: (newStyle: string) => () => Command =
      newStyle => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let transaction;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          transaction = setNodeIndentMarkup(tr, pos, newStyle);
        });
        dispatch?.(transaction);
        return true;
      };

    return {
      setOrderedListStyle: (newStyle: string) => applyListStyle(newStyle)()
    };
  }
});

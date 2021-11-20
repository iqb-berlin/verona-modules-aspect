import { Command } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';
import { OrderedList } from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedListExtension: {
      setOrderedListStyle: (newStyle: string, fontSize: string) => ReturnType
    };
  }
}

export const orderedListExtension = OrderedList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType,
        renderHTML: attributes => ({
          style: `list-style: ${attributes.listStyle}`
        })
      },
      fontSize: {
        default: '16px',
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => ({
          style: `font-size: ${attributes.fontSize}`
        })
      }
    };
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, newStyle: string, fontSize: string): Transaction => {
      const node = tr?.doc?.nodeAt(pos);
      if (node) {
        const nodeAttrs = { ...node.attrs, listStyle: newStyle, fontSize: fontSize };
        if (node.type.name !== 'text') {
          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
        }
      }
      return tr;
    };

    const applyListStyle: (newStyle: string, fontSize: string) => () => Command =
      (newStyle, fontSize) => () => (
        { tr, state, dispatch }
      ) => {
        const { selection } = state;
        let transaction;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          transaction = setNodeIndentMarkup(tr, pos, newStyle, fontSize);
        });
        dispatch?.(transaction);
        return true;
      };

    return {
      setOrderedListStyle: (newStyle: string, fontSize: string) => applyListStyle(newStyle, fontSize)()
    };
  }
});

import { Command } from '@tiptap/core';
import { Transaction } from 'prosemirror-state';
import { BulletList } from '@tiptap/extension-bullet-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletListExtension: {
      setBulletListStyle: (newStyle: string) => ReturnType;
    };
  }
}

export const BulletListExtension = BulletList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType,
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
      setBulletListStyle: (newStyle: string) => applyListStyle(newStyle)()
    };
  }
});

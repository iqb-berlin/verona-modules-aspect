import { Command, Extension } from '@tiptap/core';
import { TextSelection, Transaction } from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hangingIndent: {
      hangIndent: (indentSize: number) => ReturnType;
      unhangIndent: (indentSize: number) => ReturnType;
    };
  }
}

export const HangingIndent = Extension.create({
  name: 'hangingIndent',

  addOptions() {
    return {
      types: ['paragraph']
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          hangingIndent: {
            default: false,
            renderHTML: attributes => (attributes.hangingIndent ?
              { style: `text-indent: -${attributes.indentSize}px` } :
              { style: 'text-indent: 0px' }
            ),
            parseHTML: element => element.style.textIndent !== '0px'
          },
          indentSize: {
            default: 20,
            parseHTML: element => Number(element.getAttribute('indentSize'))
          }
        }
      }
    ];
  },

  addCommands() {
    const setNodeIndentMarkup =
      (tr: Transaction, pos: number, hangingIndent: boolean, indentSize: number): Transaction => {
        const node = tr?.doc?.nodeAt(pos);
        if (node) {
          if (hangingIndent !== node.attrs.indent) {
            const nodeAttrs = { ...node.attrs, hangingIndent, indentSize };
            return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
          }
        }
        return tr;
      };

    const updateIndentLevel = (tr: Transaction, hangingIndent: boolean, indentSize: number): Transaction => {
      const { doc, selection } = tr;

      if (doc && selection && (selection instanceof TextSelection)) {
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
          setNodeIndentMarkup(tr, pos, hangingIndent, indentSize);
          return false;
        });
      }

      return tr;
    };
    const applyIndent: (hangingIndent: boolean, indentSize: number) => () => Command =
      (hangingIndent, indentSize) => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let transaction;
        transaction = tr.setSelection(selection);
        transaction = updateIndentLevel(transaction, hangingIndent, indentSize);

        if (transaction.docChanged) {
          dispatch?.(transaction);
          return true;
        }

        return false;
      };

    return {
      hangIndent: indentSize => applyIndent(true, indentSize)(),
      unhangIndent: indentSize => applyIndent(false, indentSize)()
    };
  }
});

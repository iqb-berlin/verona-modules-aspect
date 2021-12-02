import { Command, Extension } from '@tiptap/core';
import { TextSelection, AllSelection, Transaction } from 'prosemirror-state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hangingIndent: {
      hangIndent: () => ReturnType;
      unhangIndent: () => ReturnType;
    };
  }
}

export const HangingIndent = Extension.create({
  name: 'hangingIndent',

  defaultOptions: {
    types: ['paragraph']
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          hangingIndent: {
            default: false,
            renderHTML: attributes => (attributes.hangingIndent ?
              { style: 'text-indent: -20px' } : { style: 'text-indent: 0px' }
            ),
            parseHTML: element => element.style.textIndent === '-20px'
          }
        }
      }
    ];
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, indent: boolean): Transaction => {
      const node = tr?.doc?.nodeAt(pos);

      if (node) {
        if (indent !== node.attrs.indent) {
          const nodeAttrs = { ...node.attrs, hangingIndent: indent };
          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
        }
      }
      return tr;
    };

    const updateIndentLevel = (tr: Transaction, indent: boolean): Transaction => {
      const { doc, selection } = tr;

      if (doc && selection && (selection instanceof TextSelection || selection instanceof AllSelection)) {
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
          setNodeIndentMarkup(tr, pos, indent);
          return false;
        });
      }

      return tr;
    };
    const applyIndent: (indent: boolean) => () => Command =
      indent => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, indent);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      };

    return {
      hangIndent: applyIndent(true),
      unhangIndent: applyIndent(false)
    };
  }
});

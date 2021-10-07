import { Command, Extension } from '@tiptap/core';
import { TextSelection, AllSelection, Transaction } from 'prosemirror-state';

export interface IndentOptions {
  types: string[];
  minLevel: number;
  maxLevel: number;
  paddingMultiplier: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  defaultOptions: {
    types: ['listItem', 'paragraph'],
    minLevel: 0,
    maxLevel: 8,
    paddingMultiplier: 10
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            renderHTML: attributes => (
              { style: `padding-left: ${attributes.indent * this.options.paddingMultiplier}px` }
            ),
            parseHTML: element => {
              const level = Number(element.getAttribute('style'));
              return level && level > this.options.minLevel ? level : null;
            }
          }
        }
      }
    ];
  },

  addCommands() {
    const setNodeIndentMarkup = (tr: Transaction, pos: number, delta: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos);

      if (node) {
        const nextLevel = (node.attrs.indent || 0) + delta;
        const { minLevel, maxLevel } = this.options;
        const indent = nextLevel < minLevel ? minLevel : nextLevel > maxLevel ? maxLevel : nextLevel;

        if (indent !== node.attrs.indent) {
          const nodeAttrs = { ...node.attrs, indent };
          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
        }
      }
      return tr;
    };

    const updateIndentLevel = (tr: Transaction, delta: number): Transaction => {
      const { doc, selection } = tr;

      if (doc && selection && (selection instanceof TextSelection || selection instanceof AllSelection)) {
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            tr = setNodeIndentMarkup(tr, pos, delta);
            return false;
          }

          return true;
        });
      }

      return tr;
    };
    const applyIndent: (direction: number) => () => Command =
      direction => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, direction);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      };

    return {
      indent: applyIndent(1),
      outdent: applyIndent(-1)
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent()
    };
  }
});

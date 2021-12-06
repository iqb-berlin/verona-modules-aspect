import { Command, Extension } from '@tiptap/core';
import { TextSelection, AllSelection, Transaction } from 'prosemirror-state';

export interface IndentOptions {
  types: string[];
  minLevel: number;
  maxLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: (indentSize: number) => ReturnType;
      outdent: (indentSize: number) => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  defaultOptions: {
    types: ['listItem', 'paragraph'],
    minLevel: 0,
    maxLevel: 8
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            renderHTML: attributes => (
              {
                style: `padding-left: ${attributes.indent * attributes.indentSize}px`,
                indent: attributes.indent,
                indentSize: attributes.indentSize
              }
            ),
            parseHTML: element => Number(element.getAttribute('indent'))
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
    const setNodeIndentMarkup = (tr: Transaction, pos: number, delta: number, indentSize: number): Transaction => {
      const node = tr?.doc?.nodeAt(pos);

      if (node) {
        const nextLevel = (node.attrs.indent || 0) + delta;
        const { minLevel, maxLevel } = this.options;
        const indent = nextLevel < minLevel ? minLevel : nextLevel > maxLevel ? maxLevel : nextLevel;

        if (indent !== node.attrs.indent) {
          const nodeAttrs = { ...node.attrs, indent, indentSize };
          return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
        }
      }
      return tr;
    };

    const updateIndentLevel = (tr: Transaction, delta: number, indentSize: number): Transaction => {
      const { doc, selection } = tr;

      if (doc && selection && (selection instanceof TextSelection || selection instanceof AllSelection)) {
        const { from, to } = selection;
        doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            tr = setNodeIndentMarkup(tr, pos, delta, indentSize);
            return false;
          }

          return true;
        });
      }

      return tr;
    };
    const applyIndent: (direction: number, indentSize: number) => () => Command =
      (direction, indentSize) => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, direction, indentSize);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      };

    return {
      indent: indentSize => applyIndent(1, indentSize)(),
      outdent: indentSize => applyIndent(-1, indentSize)()
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(20),
      'Shift-Tab': () => this.editor.commands.outdent(20)
    };
  }
});

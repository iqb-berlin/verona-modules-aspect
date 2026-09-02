import { Paragraph } from '@tiptap/extension-paragraph';
import { Command } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

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
    const { name } = this;

    /* Only the paragraphs. `nodesBetween` walks into everything the range covers, the text nodes
       included, and `setNodeMarkup` on one of those throws "NodeType.create can't construct text
       nodes" -- which took the whole command with it: no spacing, an error dialog instead. A cursor
       is enough for that, it descends into the text node it sits in; every paragraph that holds text
       was affected (#909). The margin lives on this node type anyway; nothing else in the document
       has the attribute. */
    const applyMargin: (newMargin: number) => () => Command =
      newMargin => () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node: ProseMirrorNode, pos: number) => {
          if (node.type.name !== name) return;
          tr.setNodeMarkup(pos, node.type, { ...node.attrs, margin: newMargin }, node.marks);
        });
        dispatch?.(tr);
        return true;
      };

    return {
      setMargin: (newMargin: number) => applyMargin(newMargin)()
    };
  }
});

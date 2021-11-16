import { Command } from '@tiptap/core';
import { TextStyle } from '@tiptap/extension-text-style';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSizeExtension: {
      setFontSize: (fontSize: number) => Command
    };
  }
}

export const fontSizeExtension = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: 16,
        parseHTML: element => Number(element.style.fontSize.slice(0, -2)),
        renderHTML: attributes => ({
          style: `font-size: ${attributes.fontSize}px`
        })
      }
    };
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run()
    };
  }
});

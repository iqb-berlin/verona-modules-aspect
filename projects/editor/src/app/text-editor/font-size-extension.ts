import { Command } from '@tiptap/core';
import { TextStyle } from '@tiptap/extension-text-style';

declare module '@tiptap/core' {
  interface Commands<> {
    fontSizeExtension: {
      setFontSize: (fontSize: string) => Command
    };
  }
}

export const fontSizeExtension = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: '20px',
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => ({
          style: `font-size: ${attributes.fontSize}`
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

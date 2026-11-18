import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    /** Not `fontSize`: since Tiptap 3 `@tiptap/extension-text-style` declares that key for a font size
        extension of its own, whose `setFontSize` takes no `null`. This one stays in use, because it reads
        and writes the font size the way units hold it. */
    aspectFontSize: {
      setFontSize: (fontSize: string | null) => ReturnType
    };
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle']
    };
  },

  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: undefined,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => {
            if (attributes.fontSize !== null) {
              return { style: `font-size: ${attributes.fontSize}` };
            }
            return {};
          }
        }
      }
    }];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run()
    };
  }
});

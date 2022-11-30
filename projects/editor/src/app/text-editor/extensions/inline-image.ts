import { Image } from '@tiptap/extension-image';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineImage: {
      insertInlineImage: (options: { src: string, alt?: string, title?: string }) => ReturnType,
    }
  }
}

export const InlineImage = Image.extend({
  name: 'inlineImage',
  addOptions() {
    return {
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        style: 'display: inline-block; height: 1em; vertical-align: middle'
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs: node => (node as HTMLElement).style.verticalAlign === 'middle' && this.options.inline && null
      }
    ];
  },
  addCommands() {
    return {
      insertInlineImage: (
        options: { src: string, alt?: string, title?: string }
      ) => ({ commands }) => commands.insertContent({ type: this.name, attrs: options })
    };
  }
});

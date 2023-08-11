import { Image } from '@tiptap/extension-image';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockImage: {
      insertBlockImage: (options: { src: string, alt?: string, title?: string, style?: string }) => ReturnType,
    }
  }
}

export const BlockImage = Image.extend({
  name: 'blockImage',
  addOptions() {
    return {
      ...this.parent?.(),
      allowBase64: true
    };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        renderHTML: attributes => {
          if (attributes.style && !this.options.inline) {
            return {
              'data-style': attributes.style,
              style: attributes.style
            };
          }
          return {};
        }
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs: () => !this.options.inline && null
      }
    ];
  },
  addCommands() {
    return {
      insertBlockImage: (
        options: { src: string, alt?: string, title?: string, style?: string }
      ) => ({ commands }) => commands.insertContent({ type: this.name, attrs: options })
    };
  }
});

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
  /** Named here rather than taken from `Image`, which has gained `width` and `height` with Tiptap 3:
      every cloze document holding a picture would be saved with two more keys, and a text would keep
      sizes the editor offers no control for (#1624). */
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
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
}).configure({ allowBase64: true });

import { BulletList } from '@tiptap/extension-bullet-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bulletListExtension: {
      setBulletListStyle: (newStyle: string) => ReturnType;
    };
  }
}

export const BulletListExtension = BulletList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType,
        renderHTML: attributes => {
          return { style: `list-style: ${attributes.listStyle};` };
        }
      }
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setBulletListStyle: (newStyle: string) => ({ commands }) => {
        return commands.updateAttributes(this.name, { listStyle: newStyle });
      }
    };
  }
});

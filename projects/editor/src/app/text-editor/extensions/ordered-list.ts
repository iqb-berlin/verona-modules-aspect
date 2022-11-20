import { OrderedList } from '@tiptap/extension-ordered-list';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    orderedListExtension: {
      setOrderedListStyle: (newStyle: string) => ReturnType,
      setOrderedListFontSize: (fontSize: string) => ReturnType
    };
  }
}

export const OrderedListExtension = OrderedList.extend({
  addAttributes() {
    return {
      listStyle: {
        default: 'upper-roman',
        parseHTML: element => element.style.listStyleType,
        renderHTML: attributes => {
          return { style: `list-style: ${attributes.listStyle}` };
        }
      },
      fontSize: {
        default: '20px',
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          return { style: `font-size: ${attributes.fontSize}` };
        }
      }
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setOrderedListStyle: (newStyle: string) => ({ commands }) => (
        commands.updateAttributes(this.name, { listStyle: newStyle })
      ),
      setOrderedListFontSize: (fontSize: string) => ({ commands }) => (
        commands.updateAttributes(this.name, { fontSize: fontSize })
      )
    };
  },

  addInputRules() {
    return [];
  }
});

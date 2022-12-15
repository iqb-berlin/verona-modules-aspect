import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    anchorId: {
      toggleAnchorId: (attributes?: {
        anchorId: string,
        parentAnchorId: string,
        anchorColor: string,
        parentAnchorColor: string
      }) => ReturnType,
      setAnchorId: (attributes?: {
        anchorId: string,
        parentAnchorId: string,
        anchorColor: string,
        parentAnchorColor: string
      }) => ReturnType
    }
  }
}

export const AnchorId = Mark.create({
  name: 'anchorId',
  addAttributes() {
    return {
      anchorId: {
        default: '',
        parseHTML: element => element.getAttribute('data-anchor-id'),
        renderHTML: attributes => {
          if (!attributes.anchorId) {
            return {};
          }
          return {
            'data-anchor-id': attributes.anchorId
          };
        }
      },
      parentAnchorId: {
        default: '',
        parseHTML: element => element.getAttribute('data-parent-anchor-id'),
        renderHTML: attributes => {
          if (!attributes.parentAnchorId) {
            return {};
          }
          return {
            'data-parent-anchor-id': attributes.parentAnchorId
          };
        }
      },
      anchorColor: {
        default: '',
        parseHTML: element => element.getAttribute('data-anchor-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.anchorColor) {
            return {};
          }
          return {
            'data-anchor-color': attributes.anchorColor,
            style: `background-color: ${attributes.anchorColor};`
          };
        }
      },
      parentAnchorColor: {
        default: '',
        parseHTML: element => element.getAttribute('data-parent-anchor-color'),
        renderHTML: attributes => {
          if (!attributes.parentAnchorColor) {
            return {};
          }
          return {
            'data-parent-anchor-color': attributes.parentAnchorColor
          };
        }
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'aspect-anchor'
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-anchor', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      toggleAnchorId: attributes => ({ commands }) => commands.toggleMark(this.name, attributes),
      setAnchorId: attributes => ({ commands }) => commands.setMark(this.name, attributes)
    };
  }
});

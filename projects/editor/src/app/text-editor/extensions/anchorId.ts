import { Mark } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    anchorId: {
      toggleAnchorId: (attributes?: { anchorId: string }) => ReturnType,
    }
  }
}

export const AnchorId = Mark.create({
  name: 'anchorId',
  addAttributes() {
    return {
      anchorId: {
        default: null,
        parseHTML: element => element.getAttribute('data-anchor-id'),
        renderHTML: attributes => {
          if (!attributes.anchorId) {
            return {};
          }
          return {
            'data-anchor-id': attributes.anchorId
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
    return ['aspect-anchor', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      toggleAnchorId: attributes => ({ commands }) => commands.toggleMark(this.name, attributes)
    };
  }
});

import { Node, mergeAttributes } from '@tiptap/core';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-drop-list' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-drop-list', mergeAttributes(HTMLAttributes)];
    }
  });

export default DropListExtension;

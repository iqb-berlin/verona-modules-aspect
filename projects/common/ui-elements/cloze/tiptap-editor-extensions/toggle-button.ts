import { Node, mergeAttributes } from '@tiptap/core';

const ToggleButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-toggle-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-toggle-button', mergeAttributes(HTMLAttributes)];
    }
  });

export default ToggleButtonExtension;

import { Node, mergeAttributes } from '@tiptap/core';

const TextFieldExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-text-field' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-text-field', mergeAttributes(HTMLAttributes)];
    }
  });

export default TextFieldExtension;

import { Node, mergeAttributes } from '@tiptap/core';
import { ElementFactory } from '../util/element.factory';

const TextFieldExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        model: {
          default: ElementFactory.createElement('text-field')
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

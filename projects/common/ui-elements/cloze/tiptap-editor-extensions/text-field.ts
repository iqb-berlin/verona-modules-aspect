import { Node, mergeAttributes } from '@tiptap/core';
import { TextFieldSimpleElement } from '../../textfield-simple/text-field-simple-element';

const TextFieldExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        model: {
          default: new TextFieldSimpleElement({ type: 'text-field' })
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

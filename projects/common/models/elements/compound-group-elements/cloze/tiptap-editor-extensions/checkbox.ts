import { Node, mergeAttributes } from '@tiptap/core';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';

const CheckboxExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'Checkbox',

    addAttributes() {
      return {
        model: {
          default: new CheckboxElement()
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-checkbox' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-checkbox', mergeAttributes(HTMLAttributes)];
    }
  });

export default CheckboxExtension;

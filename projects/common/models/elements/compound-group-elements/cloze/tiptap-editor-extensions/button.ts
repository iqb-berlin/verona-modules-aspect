import { Node, mergeAttributes } from '@tiptap/core';
import { ButtonElement } from 'common/models/elements/action-group-elements/button';

const ButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'Button',

    addAttributes() {
      return {
        model: {
          default: new ButtonElement()
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-button', mergeAttributes(HTMLAttributes)];
    }
  });

export default ButtonExtension;

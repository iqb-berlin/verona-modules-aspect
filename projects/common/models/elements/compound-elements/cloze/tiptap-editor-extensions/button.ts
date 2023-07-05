import { Node, mergeAttributes } from '@tiptap/core';
import { ButtonElement } from 'common/models/elements/button/button';
import { ElementPropertyGenerator } from 'editor/src/app/services/default-property-generators/element';

const ButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'Button',

    addAttributes() {
      return {
        model: {
          default: new ButtonElement(ElementPropertyGenerator.getButton())
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

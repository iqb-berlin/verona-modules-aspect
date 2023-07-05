import { Node, mergeAttributes } from '@tiptap/core';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { ElementPropertyGenerator } from 'editor/src/app/services/default-property-generators/element-properties';

const ToggleButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: new ToggleButtonElement(ElementPropertyGenerator.getToggleButton())
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-toggle-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-toggle-button', mergeAttributes(HTMLAttributes)];
    }
  });

export default ToggleButtonExtension;

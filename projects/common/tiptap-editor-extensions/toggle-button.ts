import { Node, mergeAttributes } from '@tiptap/core';
import { ElementFactory } from '../util/element.factory';

const ToggleButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: ElementFactory.createElement('toggle-button')
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

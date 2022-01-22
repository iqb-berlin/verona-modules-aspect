import { Node, mergeAttributes } from '@tiptap/core';
import { ToggleButtonElement } from '../../toggle-button/toggle-button';

const ToggleButtonExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: new ToggleButtonElement({ type: 'toggle-button' })
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

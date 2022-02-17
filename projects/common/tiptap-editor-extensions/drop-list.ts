import { Node, mergeAttributes } from '@tiptap/core';
import { ElementFactory } from '../util/element.factory';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: ElementFactory.createElement('drop-list', { height: 25, width: 100 })
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-drop-list' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-drop-list', mergeAttributes(HTMLAttributes)];
    }
  });

export default DropListExtension;

import { Node, mergeAttributes } from '@tiptap/core';
import { DropListSimpleElement } from '../../drop-list-simple/drop-list-simple';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListSimpleElement({ type: 'drop-list', height: 25, width: 100 })
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-drop-list' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-drop-list', mergeAttributes(HTMLAttributes)];
    }
  });

export default DropListExtension;

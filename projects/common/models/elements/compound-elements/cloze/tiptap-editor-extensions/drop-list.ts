import { Node, mergeAttributes } from '@tiptap/core';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListElement({ type: 'drop-list' })
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

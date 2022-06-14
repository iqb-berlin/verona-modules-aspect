import { Node, mergeAttributes } from '@tiptap/core';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListSimpleElement({ type: 'drop-list-simple' })
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

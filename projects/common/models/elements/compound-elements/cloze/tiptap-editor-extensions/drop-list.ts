import { Node, mergeAttributes } from '@tiptap/core';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { ElementPropertyGenerator } from 'editor/src/app/services/default-property-generators/element-properties';

const DropListExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListElement(ElementPropertyGenerator.getDropList())
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

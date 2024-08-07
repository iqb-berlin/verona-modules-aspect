import { Node, mergeAttributes } from '@tiptap/core';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';

const TextFieldExtension =
  Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        model: {
          default: new TextFieldSimpleElement()
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-text-field' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-text-field', mergeAttributes(HTMLAttributes)];
    }
  });

export default TextFieldExtension;

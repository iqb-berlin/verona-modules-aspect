import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { ElementPropertyGenerator } from 'editor/src/app/services/default-property-generators/element-properties';
import { TextFieldNodeviewComponent } from './text-field-nodeview.component';

const TextFieldComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        model: {
          default: new TextFieldSimpleElement({
            ...ElementPropertyGenerator.getTextFieldSimple(),
            id: 'cloze-child-id-placeholder',
            position: undefined
          })
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-text-field' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-text-field', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(TextFieldNodeviewComponent, { injector });
    }
  });
};

export default TextFieldComponentExtension;

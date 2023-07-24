import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
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
            id: 'cloze-child-id-placeholder',
            dimensions: {
              width: 150,
              height: 30,
              isWidthFixed: true,
              isHeightFixed: true,
              minHeight: null
            },
            position: undefined
          } as TextFieldSimpleProperties)
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

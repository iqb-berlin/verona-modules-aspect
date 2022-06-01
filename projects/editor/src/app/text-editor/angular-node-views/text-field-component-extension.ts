import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { TextFieldNodeviewComponent } from './text-field-nodeview.component';
import { ElementFactory } from 'common/util/element.factory';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';

const TextFieldComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        model: {
          default: new TextFieldSimpleElement({ type: 'text-field-simple' })
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

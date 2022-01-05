import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';

import { NodeviewTextFieldComponent } from './nodeview-text-field.component';

const TextFieldComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'TextField',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-text-field' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-text-field', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(NodeviewTextFieldComponent, { injector });
    }
  });
};

export default TextFieldComponentExtension;

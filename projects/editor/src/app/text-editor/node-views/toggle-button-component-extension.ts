import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';

import { NodeviewToggleButtonComponent } from './nodeview-toggle-button.component';

const ToggleButtonComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-toggle-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-toggle-button', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(NodeviewToggleButtonComponent, { injector });
    }
  });
};

export default ToggleButtonComponentExtension;

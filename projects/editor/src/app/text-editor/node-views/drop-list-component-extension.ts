import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';

import { NodeviewDropListComponent } from './nodeview-drop-list.component';

const DropListComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        id: {
          default: 'will be generated'
        }
      };
    },

    parseHTML() {
      return [{ tag: 'app-nodeview-drop-list' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['app-nodeview-drop-list', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(NodeviewDropListComponent, { injector });
    }
  });
};

export default DropListComponentExtension;

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { DropListNodeviewComponent } from './drop-list-nodeview.component';

import { ElementFactory } from 'common/util/element.factory';

const DropListComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: ElementFactory.createElement({ type: 'drop-list', height: 25, width: 100 })
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-drop-list' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-drop-list', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(DropListNodeviewComponent, { injector });
    }
  });
};

export default DropListComponentExtension;

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { DropListNodeviewComponent } from './drop-list-nodeview.component';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';

const DropListComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListElement({
            type: 'drop-list',
            id: 'cloze-child-id-placeholder',
            onlyOneItem: true,
            dimensions: {
              width: 150,
              height: 30,
              isWidthFixed: true
            } as DimensionProperties
          })
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

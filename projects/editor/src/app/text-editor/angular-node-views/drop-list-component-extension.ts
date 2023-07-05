import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import {
  ElementPropertyGroupGenerator
} from 'editor/src/app/services/default-property-generators/element-property-groups';
import { ElementPropertyGenerator } from 'editor/src/app/services/default-property-generators/element-properties';
import { DropListNodeviewComponent } from './drop-list-nodeview.component';

const DropListComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'DropList',

    addAttributes() {
      return {
        model: {
          default: new DropListElement({
            ...ElementPropertyGenerator.getDropList(),
            id: 'cloze-child-id-placeholder',
            onlyOneItem: true,
            dimensions: {
              ...ElementPropertyGroupGenerator.generateDimensionProps(),
              width: 150,
              height: 30,
              isWidthFixed: true
            },
            position: undefined
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

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { DropListProperties } from 'common/models/elements/input-elements/drop-list';
import { ModelRegistry } from 'common/utils/model-registry';
import { DropListNodeviewComponent } from './drop-list-nodeview.component';

const DropListComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'DropList',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'drop-list',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          onlyOneItem: true,
          allowReplacement: true,
          highlightReceivingDropList: true,
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: true,
            isHeightFixed: true,
            minHeight: null
          }
        } as any)
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

export default DropListComponentExtension;

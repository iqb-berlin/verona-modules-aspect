import { Injector } from '@angular/core';
import { mergeAttributes, Node } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { CheckboxProperties } from 'common/models/elements/input-elements/checkbox';
import { ModelRegistry } from 'common/utils/model-registry';
import { CheckboxNodeviewComponent } from 'editor/src/app/text-editor/angular-node-views/checkbox-nodeview.component';

const CheckboxComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'Checkbox',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'checkbox',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          crossOutChecked: true,
          dimensions: {
            height: 30
          }
        } as any)
      }
    };
  },

  parseHTML() {
    return [{ tag: 'aspect-nodeview-checkbox' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-nodeview-checkbox', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return AngularNodeViewRenderer(CheckboxNodeviewComponent, { injector });
  }
});

export default CheckboxComponentExtension;

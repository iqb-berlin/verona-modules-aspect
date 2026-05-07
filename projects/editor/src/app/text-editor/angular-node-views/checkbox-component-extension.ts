import { Injector } from '@angular/core';
import { mergeAttributes, Node } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { CheckboxProperties } from 'common/models/elements/input-elements/checkbox';
import { ModelRegistry } from 'common/utils/model-registry';
import { UIElementProperties } from 'common/interfaces';
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
        } as Partial<CheckboxProperties> as UIElementProperties)
      }
    };
  },

  parseHTML() {
    return [{
      tag: 'aspect-nodeview-checkbox',
      getAttrs: () => ({
        model: ModelRegistry.createElement({
          type: 'checkbox',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          crossOutChecked: true,
          dimensions: {
            height: 30
          }
        } as Partial<CheckboxProperties> as UIElementProperties)
      })
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-nodeview-checkbox', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return AngularNodeViewRenderer(CheckboxNodeviewComponent, { injector });
  }
});

export default CheckboxComponentExtension;

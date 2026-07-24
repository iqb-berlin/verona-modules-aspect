import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import {
  TextFieldSimpleProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { ModelRegistry } from 'common/utils/model-registry';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { TextFieldNodeviewComponent } from 'editor/modules/text-editor/components/text-field-nodeview/text-field-nodeview.component';

const TextFieldComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'TextField',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'text-field-simple',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: true,
            isHeightFixed: true,
            minHeight: null
          }
        } as Partial<TextFieldSimpleProperties> as UIElementProperties)
      }
    };
  },

  parseHTML() {
    return [{
      tag: 'aspect-nodeview-text-field',
      getAttrs: () => ({
        model: ModelRegistry.createElement({
          type: 'text-field-simple',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: true,
            isHeightFixed: true,
            minHeight: null
          }
        } as Partial<TextFieldSimpleProperties> as UIElementProperties)
      })
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-nodeview-text-field', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return AngularNodeViewRenderer(TextFieldNodeviewComponent, { injector });
  }
});

export default TextFieldComponentExtension;

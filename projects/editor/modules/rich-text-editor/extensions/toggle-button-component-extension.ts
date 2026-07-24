import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import {
  ToggleButtonProperties
} from 'common/models/elements/compound-group-elements/toggle-button';
import { ModelRegistry } from 'common/utils/model-registry';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import {
  ToggleButtonNodeviewComponent
} from 'editor/modules/text-editor/components/toggle-button-nodeview/toggle-button-nodeview.component';

const ToggleButtonComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'ToggleButton',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'toggle-button',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: false,
            isHeightFixed: true,
            minHeight: null
          }
        } as Partial<ToggleButtonProperties> as UIElementProperties)
      }
    };
  },

  parseHTML() {
    return [{
      tag: 'aspect-nodeview-toggle-button',
      getAttrs: () => ({
        model: ModelRegistry.createElement({
          type: 'toggle-button',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: false,
            isHeightFixed: true,
            minHeight: null
          }
        } as Partial<ToggleButtonProperties> as UIElementProperties)
      })
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-nodeview-toggle-button', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return AngularNodeViewRenderer(ToggleButtonNodeviewComponent, { injector });
  }
});

export default ToggleButtonComponentExtension;

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { ModelRegistry } from 'common/utils/model-registry';
import { DropdownProperties } from 'common/models/elements/input-elements/dropdown';
import { UIElementProperties } from 'common/interfaces';
import { DropdownNodeviewComponent } from './dropdown-nodeview.component';

const DropdownComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'Dropdown',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'dropdown',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: false,
            isHeightFixed: true,
            minHeight: null,
            minWidth: 40
          }
        } as Partial<DropdownProperties> as UIElementProperties)
      }
    };
  },

  parseHTML() {
    return [{
      tag: 'aspect-nodeview-dropdown',
      getAttrs: () => ({
        model: ModelRegistry.createElement({
          type: 'dropdown',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            width: 150,
            height: 30,
            isWidthFixed: false,
            isHeightFixed: true,
            minHeight: null,
            minWidth: 40
          }
        } as Partial<DropdownProperties> as UIElementProperties)
      })
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['aspect-nodeview-dropdown', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return AngularNodeViewRenderer(DropdownNodeviewComponent, { injector });
  }
});

export default DropdownComponentExtension;

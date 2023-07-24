import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import {
  ToggleButtonElement,
  ToggleButtonProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { ToggleButtonNodeviewComponent } from './toggle-button-nodeview.component';

const ToggleButtonComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: new ToggleButtonElement({
            id: 'cloze-child-id-placeholder',
            dimensions: {
              width: 150,
              height: 30,
              isWidthFixed: false,
              isHeightFixed: true,
              minHeight: null
            },
            position: undefined
          } as ToggleButtonProperties)
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-toggle-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-toggle-button', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(ToggleButtonNodeviewComponent, { injector });
    }
  });
};

export default ToggleButtonComponentExtension;

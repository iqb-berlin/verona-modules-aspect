import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';

import { ToggleButtonNodeviewComponent } from './toggle-button-nodeview.component';
import { DropListSimpleElement } from '../../../../../common/ui-elements/drop-list-simple/drop-list-simple';
import { ToggleButtonElement } from '../../../../../common/ui-elements/toggle-button/toggle-button';

const ToggleButtonComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: new ToggleButtonElement({ type: 'toggle-button' })
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

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';

import { ToggleButtonNodeviewComponent } from './toggle-button-nodeview.component';
import { ElementFactory } from 'common/util/element.factory';

const ToggleButtonComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'ToggleButton',

    addAttributes() {
      return {
        model: {
          default: ElementFactory.createElement({ type: 'toggle-button', height: 25, width: 100 })
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

import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { ButtonElement, ButtonProperties } from 'common/models/elements/button/button';
import { ButtonNodeviewComponent } from 'editor/src/app/text-editor/angular-node-views/button-nodeview.component';

const ButtonComponentExtension = (injector: Injector): Node => {
  return Node.create({
    group: 'inline',
    inline: true,
    name: 'Button',

    addAttributes() {
      return {
        model: {
          default: new ButtonElement({
            id: 'cloze-child-id-placeholder',
            dimensions: {
              height: 30
            },
            asLink: true,
            position: undefined
          } as ButtonProperties)
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-button' }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['aspect-nodeview-button', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
      return AngularNodeViewRenderer(ButtonNodeviewComponent, { injector });
    }
  });
};

export default ButtonComponentExtension;

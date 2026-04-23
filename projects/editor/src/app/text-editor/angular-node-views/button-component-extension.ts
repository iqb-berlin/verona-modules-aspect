import { Injector } from '@angular/core';
import { Node, mergeAttributes } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { ModelRegistry } from 'common/utils/model-registry';
import { ButtonNodeviewComponent } from 'editor/src/app/text-editor/angular-node-views/button-nodeview.component';

const ButtonComponentExtension = (injector: Injector): Node => Node.create({
  group: 'inline',
  inline: true,
  name: 'Button',

  addAttributes() {
    return {
      model: {
        default: ModelRegistry.createElement({
          type: 'button',
          id: 'cloze-child-id-placeholder',
          alias: 'cloze-child-alias-placeholder',
          dimensions: {
            height: 30
          },
          asLink: true
        } as any)
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

export default ButtonComponentExtension;

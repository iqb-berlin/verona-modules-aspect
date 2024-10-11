import { mergeAttributes, Node } from '@tiptap/core';
import { AngularNodeViewRenderer } from 'ngx-tiptap';
import { MathFormulaNodeviewComponent } from 'editor/src/app/text-editor/angular-node-views/math-formula.component';
import { Injector } from '@angular/core';

const MathFormulaExtension = (injector: Injector): Node => {
  return Node.create({
    name: 'math-formula',
    group: 'inline',
    inline: true,

    addAttributes() {
      return {
        formula: {
          default: ''
        },
        formulaHTML: {
          default: ''
        }
      };
    },

    parseHTML() {
      return [{ tag: 'aspect-nodeview-math-formula' }];
    },

    renderHTML({ HTMLAttributes }) {
      const dom = document.createElement('span');
      dom.innerHTML = HTMLAttributes.formulaHTML;
      return ['aspect-nodeview-math-formula', mergeAttributes(HTMLAttributes), dom];
    },

    addNodeView() {
      return AngularNodeViewRenderer(MathFormulaNodeviewComponent, { injector });
    }
  });
};

export default MathFormulaExtension;

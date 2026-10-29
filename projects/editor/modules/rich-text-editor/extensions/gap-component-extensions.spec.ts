import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Attributes, getExtensionField, Node } from '@tiptap/core';
import { UIElement } from 'common/models/elements/element';
// The factory puts itself into the registry the extensions build their models with.
import 'common/utils/element-factory';
import ButtonComponentExtension from './button-component-extension';
import CheckboxComponentExtension from './checkbox-component-extension';
import DropListComponentExtension from './drop-list-component-extension';
import DropdownComponentExtension from './dropdown-component-extension';
import TextFieldComponentExtension from './text-field-component-extension';
import ToggleButtonComponentExtension from './toggle-button-component-extension';

/* Every gap the editor inserts into a cloze is fixed at 30px, so that the gaps of a line come out equally
   tall (#1619). A button and a checkbox came without a fixed height and stood 29px tall beside the 30px
   of the others. Each extension builds the model twice: as the default of a new node, and from the markup
   it parses back. */
describe('the gaps the editor inserts', () => {
  const context = (node: Node): { name: string; options: unknown; storage: unknown } => (
    { name: node.name, options: node.options, storage: node.storage });

  it.each([
    { kind: 'text field', create: TextFieldComponentExtension },
    { kind: 'drop list', create: DropListComponentExtension },
    { kind: 'toggle button', create: ToggleButtonComponentExtension },
    { kind: 'button', create: ButtonComponentExtension },
    { kind: 'checkbox', create: CheckboxComponentExtension },
    { kind: 'dropdown', create: DropdownComponentExtension }
  ])('should insert a $kind fixed at 30px', ({ create }) => {
    const node = create(TestBed.inject(Injector));
    const inserted = getExtensionField<() => Attributes>(node, 'addAttributes', context(node))()
      .model.default as UIElement;
    const parsed = getExtensionField<() => { getAttrs: (node: HTMLElement) => unknown }[]>(
      node, 'parseHTML', context(node)
    )()[0].getAttrs(document.createElement('div')) as { model: UIElement };

    [inserted, parsed.model].forEach(model => {
      expect(model.dimensions?.height).toBe(30);
      expect(model.dimensions?.isHeightFixed).toBe(true);
    });
  });
});

import { Editor, JSONContent } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { ListItem } from '@tiptap/extension-list-item';
import { ParagraphExtension } from './paragraph-extension';
import { BulletListExtension } from './bullet-list';
import { Indent } from './indent';

/**
 * `indent` is the toolbar's "Einzug vergrößern". It pads the first list item the selection reaches into,
 * and with a sub-item that is the item around it -- the sub-item stayed where it was and its parent moved
 * with all of it. Sub-items exist since Tab makes them (#1602).
 */
describe('Indent.indent', () => {
  let editor: Editor;

  const build = (content: string): Editor => new Editor({
    extensions: [Document, Text, ListItem, ParagraphExtension, BulletListExtension,
      Indent.configure({ types: ['listItem', 'paragraph'], minLevel: 0, maxLevel: 4 })],
    content
  });

  const placeCursorIn = (text: string): void => {
    let position = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === text) position = pos + 1;
    });
    editor.commands.setTextSelection(position);
  };

  const firstItem = (): JSONContent => editor.getJSON().content?.[0].content?.[0] ?? {};

  afterEach(() => editor?.destroy());

  it('should pad the sub-item the cursor is in, not the item around it', () => {
    editor = build('<ul><li><p>Obst</p><ul><li><p>Apfel</p></li></ul></li></ul>');
    placeCursorIn('Apfel');

    editor.commands.indent(20);

    expect(firstItem().attrs?.indent).toBe(0);
    expect(firstItem().content?.[1].content?.[0].attrs?.indent).toBe(1);
  });

  it('should pad an item with sub-items when the cursor is in its own text', () => {
    editor = build('<ul><li><p>Obst</p><ul><li><p>Apfel</p></li></ul></li></ul>');
    placeCursorIn('Obst');

    editor.commands.indent(20);

    expect(firstItem().attrs?.indent).toBe(1);
    expect(firstItem().content?.[1].content?.[0].attrs?.indent).toBe(0);
  });
});

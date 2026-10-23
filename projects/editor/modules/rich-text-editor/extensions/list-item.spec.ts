import { Editor, JSONContent } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { ParagraphExtension } from './paragraph-extension';
import { BulletListExtension } from './bullet-list';
import { OrderedListExtension } from './ordered-list';
import { Indent } from './indent';
import { ListItemExtension } from './list-item';

/**
 * Tab in a list made the item a sub-item nowhere: `Indent` binds the same keys, comes later in the
 * editor's extension list and is therefore asked first -- it padded the item, so the text moved and the
 * marker stayed (#1602). The editor here is put together in the same order as the rich text editor's,
 * so the conflict is in it.
 */
describe('ListItemExtension', () => {
  let editor: Editor;

  const build = (content: string): Editor => new Editor({
    extensions: [Document, Text, ListItemExtension, ParagraphExtension, BulletListExtension, OrderedListExtension,
      Indent.configure({ types: ['listItem', 'paragraph'], minLevel: 0, maxLevel: 4 })],
    content
  });

  const press = (key: string, shiftKey = false): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key, shiftKey, bubbles: true, cancelable: true
    });
    editor.view.dom.dispatchEvent(event);
    return event;
  };

  const placeCursorIn = (text: string): void => {
    let position = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text === text) position = pos + 1;
    });
    editor.commands.setTextSelection(position);
  };

  const topBlock = (): JSONContent => editor.getJSON().content?.[0] ?? {};
  const itemsOf = (list: JSONContent): JSONContent[] => list.content ?? [];
  /** An item holds its paragraph first and, once it has sub-items, their list after it. */
  const sublistOf = (item: JSONContent | undefined): JSONContent => item?.content?.[1] ?? {};
  const textOf = (item: JSONContent | undefined): string | undefined => item?.content?.[0].content?.[0].text;

  afterEach(() => editor?.destroy());

  it('should make an item the sub-item of the one before it', () => {
    editor = build('<ul><li><p>Obst</p></li><li><p>Apfel</p></li></ul>');
    placeCursorIn('Apfel');

    press('Tab');

    expect(itemsOf(topBlock())).toHaveLength(1);
    const sublist = sublistOf(itemsOf(topBlock())[0]);
    expect(sublist.type).toBe('bulletList');
    expect(textOf(itemsOf(sublist)[0])).toBe('Apfel');
  });

  it('should give a new bullet sublist the next marker, step by step', () => {
    editor = build('<ul style="list-style: disc;"><li><p>A</p></li><li><p>B</p></li><li><p>C</p></li>' +
      '<li><p>D</p></li></ul>');
    /* C first joins the sublist B opened, D the ones B and C opened; each further Tab opens one. */
    ['B', 'C', 'C', 'D', 'D', 'D'].forEach(text => {
      placeCursorIn(text);
      press('Tab');
    });

    const levelTwo = sublistOf(itemsOf(topBlock())[0]);
    const levelThree = sublistOf(itemsOf(levelTwo)[0]);
    const levelFour = sublistOf(itemsOf(levelThree)[0]);
    expect([topBlock(), levelTwo, levelThree, levelFour].map(level => level.attrs?.listStyle))
      .toEqual(['disc', 'circle', 'square', 'disc']);
  });

  it('should go on from the marker the parent list was given', () => {
    editor = build('<ul style="list-style: circle;"><li><p>Obst</p></li><li><p>Apfel</p></li></ul>');
    placeCursorIn('Apfel');

    press('Tab');

    expect(sublistOf(itemsOf(topBlock())[0]).attrs?.listStyle).toBe('square');
  });

  it('should treat a list without a style as the dots the browser shows for it', () => {
    editor = build('<ul><li><p>Obst</p></li><li><p>Apfel</p></li></ul>');
    placeCursorIn('Apfel');

    press('Tab');

    expect(topBlock().attrs?.listStyle).toBe('');
    expect(sublistOf(itemsOf(topBlock())[0]).attrs?.listStyle).toBe('circle');
  });

  it('should give a numbered sublist the next numbering and the font size of its parent', () => {
    editor = build('<ol style="list-style: decimal; font-size: 24px;"><li><p>Obst</p></li><li><p>Apfel</p></li></ol>');
    placeCursorIn('Apfel');

    press('Tab');

    const sublist = sublistOf(itemsOf(topBlock())[0]);
    expect(sublist.type).toBe('orderedList');
    expect(sublist.attrs).toEqual({ listStyle: 'lower-latin', fontSize: '24px' });
  });

  it('should leave the marker of a sublist the item joins as it was', () => {
    editor = build('<ul><li><p>Obst</p><ul style="list-style: square;"><li><p>Apfel</p></li></ul></li>' +
      '<li><p>Birne</p></li></ul>');
    placeCursorIn('Birne');

    press('Tab');

    const sublist = sublistOf(itemsOf(topBlock())[0]);
    expect(itemsOf(sublist)).toHaveLength(2);
    expect(sublist.attrs?.listStyle).toBe('square');
  });

  it('should drop the padding the old Tab gave an item when it moves a level down', () => {
    editor = build('<ul><li indent="1" indentSize="20"><p>Obst</p></li>' +
      '<li indent="1" indentSize="20"><p>Apfel</p></li></ul>');
    placeCursorIn('Apfel');

    press('Tab');

    const parentItem = itemsOf(topBlock())[0];
    expect(itemsOf(sublistOf(parentItem))[0].attrs?.indent).toBe(0);
    expect(parentItem.attrs?.indent).toBe(1);
  });

  it('should leave the first item as it is and keep the key in the editor', () => {
    editor = build('<ul><li><p>Obst</p></li><li><p>Apfel</p></li></ul>');
    const before = editor.getJSON();
    placeCursorIn('Obst');

    const event = press('Tab');

    expect(editor.getJSON()).toEqual(before);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should take a sub-item back a level with Shift-Tab', () => {
    editor = build('<ul><li><p>Obst</p><ul><li><p>Apfel</p></li></ul></li></ul>');
    placeCursorIn('Apfel');

    press('Tab', true);

    expect(itemsOf(topBlock())).toHaveLength(2);
    expect(textOf(itemsOf(topBlock())[1])).toBe('Apfel');
  });

  it('should leave Shift-Tab on the top level to the indent, so older padding can be taken back', () => {
    editor = build('<ul><li indent="1" indentSize="20"><p>Obst</p></li></ul>');
    placeCursorIn('Obst');

    press('Tab', true);

    expect(topBlock().type).toBe('bulletList');
    expect(itemsOf(topBlock())[0].attrs?.indent).toBe(0);
  });

  it('should leave Tab outside of lists to the indent', () => {
    editor = build('<p>Obst</p>');
    placeCursorIn('Obst');

    press('Tab');

    expect(topBlock().attrs?.indent).toBe(1);
  });
});

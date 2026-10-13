import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { BulletList } from '@tiptap/extension-bullet-list';
import { ListItem } from '@tiptap/extension-list-item';
import { Indent } from './indent';
import { HangingIndent } from './hanging-indent';
import { ParagraphExtension } from './paragraph-extension';

describe('Indent selection', () => {
  let editor: Editor;
  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, ParagraphExtension, Text, BulletList, ListItem,
        Indent.configure({ types: ['paragraph', 'listItem'], maxLevel: 4 }), HangingIndent]
    });
  });
  afterEach(() => editor.destroy());

  it('indents every paragraph selected by Select All and retains the result on reload', () => {
    editor.commands.setContent('<p>A</p><p>B</p>');
    editor.commands.selectAll();
    expect(editor.commands.indent(20)).toBe(true);
    expect(editor.getJSON().content?.map(node => node.attrs?.indent)).toEqual([1, 1]);
    const html = editor.getHTML();
    editor.commands.setContent(html);
    expect(editor.getHTML()).toBe(html);
    editor.commands.selectAll();
    editor.commands.outdent(20);
    expect(editor.getJSON().content?.map(node => node.attrs?.indent)).toEqual([0, 0]);
  });

  it('applies and removes hanging indent through list containers without altering their nodes', () => {
    editor.commands.setContent('<ul><li><p>A</p></li><li><p>B</p></li></ul>');
    editor.commands.selectAll();
    editor.commands.hangIndent(20);
    const paragraphs: boolean[] = [];
    editor.state.doc.descendants(node => {
      if (node.type.name === 'paragraph') paragraphs.push(node.attrs.hangingIndent);
      if (node.type.name === 'bulletList') expect(node.attrs.hangingIndent).toBeUndefined();
    });
    expect(paragraphs).toEqual([true, true]);
    editor.commands.unhangIndent(20);
    expect(editor.getHTML()).not.toContain('text-indent: -');
  });

  it('keeps the default indent size and clamps repeated commands for a text selection', () => {
    editor.commands.setContent('<p>A</p>');
    expect(editor.getAttributes('paragraph').indentSize).toBe(20);
    expect(editor.getAttributes('paragraph').hangingIndent).toBe(false);
    editor.commands.setTextSelection(1);
    for (let i = 0; i < 6; i++) editor.commands.indent(20);
    expect(editor.getAttributes('paragraph').indent).toBe(4);
    for (let i = 0; i < 6; i++) editor.commands.outdent(20);
    expect(editor.getAttributes('paragraph').indent).toBe(0);
  });

  it('sets spacing on filled paragraphs for both a caret and Select All', () => {
    editor.commands.setContent('<p>A</p><p>B</p>');
    editor.commands.setTextSelection(1);
    expect(editor.commands.setMargin(10)).toBe(true);
    expect(editor.getJSON().content?.map(node => node.attrs?.margin)).toEqual([10, 0]);
    editor.commands.selectAll();
    expect(editor.commands.setMargin(20)).toBe(true);
    expect(editor.getJSON().content?.map(node => node.attrs?.margin)).toEqual([20, 20]);
    expect(editor.getText()).toBe('A\n\nB');
  });

  it('sets spacing inside list items and on an empty paragraph', () => {
    editor.commands.setContent('<ul><li><p>A</p></li></ul><p></p>');
    editor.commands.selectAll();
    editor.commands.setMargin(10);
    const margins: number[] = [];
    editor.state.doc.descendants(node => {
      if (node.type.name === 'paragraph') margins.push(node.attrs.margin);
      else expect(node.attrs.margin).toBeUndefined();
    });
    expect(margins).toEqual([10, 10]);
  });
});

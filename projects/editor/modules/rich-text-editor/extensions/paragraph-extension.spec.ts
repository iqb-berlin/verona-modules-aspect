import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { ParagraphExtension } from './paragraph-extension';

/**
 * `setMargin` is the spacing behind "Absatz > Abstand". It walks the selected range, and the range
 * holds text nodes as well as paragraphs -- writing markup onto one of those throws and takes the
 * whole command with it. A cursor was enough: it descends into the text node it sits in, so every
 * paragraph holding text got an error dialog instead of a spacing (#909). Both cases are below, and
 * both fail against the implementation this replaced.
 */
describe('ParagraphExtension.setMargin', () => {
  let editor: Editor;

  const build = (content: string): Editor => new Editor({
    extensions: [Document, Text, ParagraphExtension],
    content
  });

  afterEach(() => editor?.destroy());

  it('should set the margin on every paragraph of a selection across several', () => {
    editor = build('<p>Verb</p><p>Nomen</p><p>Pronomen</p>');
    editor.commands.setTextSelection({ from: 1, to: editor.state.doc.content.size - 1 });

    expect(() => editor.commands.setMargin(20)).not.toThrow();

    const margins: number[] = [];
    editor.state.doc.forEach(node => margins.push(node.attrs.margin));
    expect(margins).toEqual([20, 20, 20]);
  });

  it('should set the margin of the paragraph the cursor sits in', () => {
    editor = build('<p>Verb</p><p>Nomen</p>');
    editor.commands.setTextSelection(2);

    editor.commands.setMargin(15);

    expect(editor.state.doc.firstChild?.attrs.margin).toBe(15);
    expect(editor.state.doc.lastChild?.attrs.margin).toBe(0);
  });

  it('should leave the text of the paragraphs untouched', () => {
    editor = build('<p>Verb</p><p>Nomen</p>');
    editor.commands.setTextSelection({ from: 1, to: editor.state.doc.content.size - 1 });

    editor.commands.setMargin(20);

    expect(editor.state.doc.textContent).toBe('VerbNomen');
  });
});

import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Bold } from '@tiptap/extension-bold';
import { PreserveWhitespace } from './preserve-whitespace';

describe('PreserveWhitespace', () => {
  let editor: Editor;
  beforeEach(() => {
    editor = new Editor({ extensions: [Document, Paragraph, Text, Bold, PreserveWhitespace] });
  });
  afterEach(() => editor.destroy());

  it('retains repeated and non-breaking spaces through the model write command and reload', () => {
    editor.commands.setContent('<p>A  B&nbsp;C&#8239;D <strong>E  F</strong></p>');
    expect(editor.getText()).toBe('A  B\u00a0C\u202fD E  F');
    const stored = editor.getHTML();
    editor.commands.setContent(stored);
    expect(editor.getHTML()).toBe(stored);
  });

  it('honors an explicitly requested parser override and the emitUpdate flag', () => {
    let updates = 0;
    editor.on('update', () => { updates += 1; });
    editor.commands.setContent('<p>A  B</p>', false, { preserveWhitespace: false });
    expect(editor.getText()).toBe('A B');
    expect(updates).toBe(0);
    editor.commands.setContent('<p>A  B</p>', true);
    expect(editor.getText()).toBe('A  B');
    expect(updates).toBe(1);
  });

  it('keeps JSON content and marks unchanged', () => {
    const content = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'A  B\u00a0C', marks: [{ type: 'bold' }] }]
      }]
    };
    editor.commands.setContent(content);
    expect(editor.getJSON()).toEqual(content);
  });
});

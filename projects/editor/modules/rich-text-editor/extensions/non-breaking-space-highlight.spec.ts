import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { ParagraphExtension } from './paragraph-extension';
import { NonBreakingSpaceHighlight } from './non-breaking-space-highlight';

/**
 * The marking is for the eye only: whatever is switched, the text the unit stores stays exactly as it was (#1476).
 */
describe('NonBreakingSpaceHighlight', () => {
  let editor: Editor;

  const build = (content: string): Editor => new Editor({
    extensions: [Document, ParagraphExtension, Text, NonBreakingSpaceHighlight],
    content
  });

  const marked = (selector: string): string[] => Array.from(editor.view.dom.querySelectorAll(selector))
    .map(element => element.textContent?.charCodeAt(0).toString(16) ?? '');

  afterEach(() => editor?.destroy());

  it('should mark nothing as long as it is switched off', () => {
    editor = build('<p>10&nbsp;kg und 5&#8239;%</p>');

    expect(editor.view.dom.querySelectorAll('.nbsp-marker, .narrow-nbsp-marker').length).toBe(0);
  });

  it('should mark each kind of space with a class of its own', () => {
    editor = build('<p>10&nbsp;kg, 5&#8239;% und 3&nbsp;m</p>');

    editor.commands.setNonBreakingSpacesVisible(true);

    expect(marked('.nbsp-marker')).toEqual(['a0', 'a0']);
    expect(marked('.narrow-nbsp-marker')).toEqual(['202f']);
  });

  it('should leave ordinary spaces unmarked and find the space behind an emoji', () => {
    editor = build('<p>a b 😀&nbsp;c</p>');

    editor.commands.setNonBreakingSpacesVisible(true);

    expect(marked('.nbsp-marker')).toEqual(['a0']);
    expect(editor.view.dom.querySelector('.nbsp-marker')?.previousSibling?.textContent).toBe('a b 😀');
  });

  it('should mark a space typed while it is switched on', () => {
    editor = build('<p>10</p>');
    editor.commands.setNonBreakingSpacesVisible(true);

    // The toolbar hands over the character itself: Angular decodes `&nbsp;` in the template.
    editor.commands.insertContentAt(3, `${String.fromCharCode(0xA0)}kg`);

    expect(marked('.nbsp-marker')).toEqual(['a0']);
  });

  it('should take the marking away again when switched off', () => {
    editor = build('<p>10&nbsp;kg</p>');
    editor.commands.setNonBreakingSpacesVisible(true);

    editor.commands.setNonBreakingSpacesVisible(false);

    expect(editor.view.dom.querySelectorAll('.nbsp-marker').length).toBe(0);
  });

  it('should leave the stored text exactly as it is, switched on or off', () => {
    editor = build('<p>10&nbsp;kg und 5&#8239;%</p>');
    const html = editor.getHTML();
    const json = JSON.stringify(editor.getJSON());

    editor.commands.setNonBreakingSpacesVisible(true);

    expect(editor.getHTML()).toBe(html);
    expect(JSON.stringify(editor.getJSON())).toBe(json);
    expect(html).toContain('&nbsp;');
    expect(html).not.toContain('marker');
  });
});

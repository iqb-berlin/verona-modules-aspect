import { RichTextStart } from './rich-text-start';

describe('RichTextStart', () => {
  it('should say yes for a text that begins with a paragraph, a heading or plain text', () => {
    expect(RichTextStart.isText('<p>Text</p>')).toBe(true);
    expect(RichTextStart.isText('<h2>Titel</h2><p>Text</p>')).toBe(true);
    expect(RichTextStart.isText('Text')).toBe(true);
  });

  it('should say no for a text that begins with a picture inserted without alignment', () => {
    expect(RichTextStart.isText('<img src="picture.png"><p>Text</p>')).toBe(false);
  });

  it('should say no for a floated picture, which leaves the text beside it room only while it is narrow', () => {
    expect(RichTextStart.isText('<img src="picture.png" style="float: left; margin-right: 10px;"><p>Text</p>'))
      .toBe(false);
  });

  it('should find a leading picture at any depth', () => {
    expect(RichTextStart.isText('<blockquote><img src="picture.png"><p>Zitat</p></blockquote>')).toBe(false);
    expect(RichTextStart.isText('<p><img src="picture.png"></p><p>Text</p>')).toBe(false);
    expect(RichTextStart.isText('<blockquote><p>Zitat</p></blockquote>')).toBe(true);
  });

  it('should say yes for an inline picture in the first line', () => {
    expect(RichTextStart.isText(
      '<p><img src="picture.png" style="display: inline-block; height: 1em; vertical-align: middle">Text</p>'
    )).toBe(true);
  });

  it('should look past a leading rule, which draws no line', () => {
    expect(RichTextStart.isText('<hr><img src="picture.png"><p>Text</p>')).toBe(false);
    expect(RichTextStart.isText('<hr><p>Text</p>')).toBe(true);
  });

  it('should say no for empty text', () => {
    expect(RichTextStart.isText('')).toBe(false);
    expect(RichTextStart.isText('<p></p>')).toBe(false);
    expect(RichTextStart.isText(undefined)).toBe(false);
  });
});

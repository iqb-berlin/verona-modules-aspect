import { HasRenderableContentPipe } from './has-renderable-content.pipe';

describe('HasRenderableContentPipe', () => {
  let pipe: HasRenderableContentPipe;

  beforeEach(() => {
    pipe = new HasRenderableContentPipe();
  });

  it.each([undefined, null, ''])('should report nothing to draw for %s', value => {
    expect(pipe.transform(value)).toBe(false);
  });

  /* What a rich text editor leaves behind once it has been emptied (#965). */
  it.each(['<p></p>', '<p><br></p>', '<p>   </p>', '<p></p><p></p>'])(
    'should report nothing to draw for the emptied rich text %s', html => {
      expect(pipe.transform(html)).toBe(false);
    }
  );

  it.each(['<p>Wort</p>', 'Wort ohne Absatz', '<p><b>fett</b></p>'])(
    'should report content for text %s', html => {
      expect(pipe.transform(html)).toBe(true);
    }
  );

  /* A non-breaking space is the usual way to keep a blank line; `trim()` would drop it. */
  it('should report content for a non-breaking space', () => {
    expect(pipe.transform('<p>\u00a0</p>')).toBe(true);
  });

  /* A label can be a picture or a formula and nothing else: no text, and yet everything to draw. */
  it.each([
    '<p><img src="data:image/png;base64,abc"></p>',
    '<p><aspect-nodeview-math-formula></aspect-nodeview-math-formula></p>',
    '<hr>'
  ])('should report content for the text-free %s', html => {
    expect(pipe.transform(html)).toBe(true);
  });
});

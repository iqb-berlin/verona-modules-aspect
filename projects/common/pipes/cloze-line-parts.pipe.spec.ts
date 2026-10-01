import { ClozeDocumentContentNode } from 'common/models/elements/cloze';
import { ClozeLinePartsPipe } from './cloze-line-parts.pipe';

describe('ClozeLinePartsPipe', () => {
  let pipe: ClozeLinePartsPipe;

  const text = (value: string, mark?: string): ClozeDocumentContentNode => ({
    type: 'text',
    text: value,
    ...(mark ? { marks: [{ type: mark }] } : {})
  });

  const field = (): ClozeDocumentContentNode => ({ type: 'TextField' });

  beforeEach(() => {
    pipe = new ClozeLinePartsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return nothing for empty content', () => {
    expect(pipe.transform(null)).toEqual([]);
    expect(pipe.transform(undefined)).toEqual([]);
    expect(pipe.transform([])).toEqual([]);
  });

  it('should leave a paragraph without an inline child as one segment', () => {
    const node = text('Lorem ipsum');
    const segments = pipe.transform([node]);
    expect(segments).toEqual([{ keepTogether: false, nodes: [node] }]);
    expect(segments[0].nodes[0]).toBe(node);
  });

  it('should keep the letters around a field in the middle of a word together', () => {
    const segments = pipe.transform([
      text('Lorem ips'),
      field(),
      text('um lorem ipsum')
    ]);

    expect(segments).toEqual([
      { keepTogether: false, nodes: [text('Lorem ')] },
      { keepTogether: true, nodes: [text('ips'), field(), text('um')] },
      { keepTogether: false, nodes: [text(' lorem ipsum')] }
    ]);
  });

  it('should keep the letters after a field that starts a word together', () => {
    const before = text('Lorem ');
    const gap = field();
    const segments = pipe.transform([before, gap, text('um lorem')]);

    expect(segments).toEqual([
      { keepTogether: false, nodes: [before] },
      { keepTogether: true, nodes: [gap, text('um')] },
      { keepTogether: false, nodes: [text(' lorem')] }
    ]);
  });

  it('should keep the letters before a field that ends a word together', () => {
    const after = text(' lorem');
    const segments = pipe.transform([
      text('Lorem ips'),
      field(),
      after
    ]);

    expect(segments).toEqual([
      { keepTogether: false, nodes: [text('Lorem ')] },
      { keepTogether: true, nodes: [text('ips'), field()] },
      { keepTogether: false, nodes: [after] }
    ]);
  });

  it('should leave a field that already has spaces around it on its own', () => {
    const before = text('Lorem ');
    const gap = field();
    const after = text(' ipsum');
    expect(pipe.transform([before, gap, after])).toEqual([
      { keepTogether: false, nodes: [before] },
      { keepTogether: false, nodes: [gap] },
      { keepTogether: false, nodes: [after] }
    ]);
  });

  it('should keep several fields inside one word in one segment', () => {
    const segments = pipe.transform([
      text('ab'),
      field(),
      text('cd'),
      field(),
      text('ef gh')
    ]);

    expect(segments).toEqual([
      { keepTogether: true, nodes: [text('ab'), field(), text('cd'), field(), text('ef')] },
      { keepTogether: false, nodes: [text(' gh')] }
    ]);
  });

  it('should keep a styled fragment of the same word in the segment', () => {
    const segments = pipe.transform([
      text('Lorem '),
      text('ip', 'bold'),
      text('s'),
      field(),
      text('um')
    ]);

    expect(segments).toEqual([
      { keepTogether: false, nodes: [text('Lorem ')] },
      {
        keepTogether: true,
        nodes: [text('ip', 'bold'), text('s'), field(), text('um')]
      }
    ]);
  });

  it('should not break a word at a non-breaking space', () => {
    const segments = pipe.transform([
      text('Lorem\u00A0ips'),
      field(),
      text('um')
    ]);

    expect(segments).toEqual([
      { keepTogether: true, nodes: [text('Lorem\u00A0ips'), field(), text('um')] }
    ]);
  });

  it('should leave the document nodes as they are', () => {
    const before = text('Lorem ips');
    const gap = field();
    const after = text('um lorem');
    pipe.transform([before, gap, after]);
    expect(before.text).toBe('Lorem ips');
    expect(after.text).toBe('um lorem');
  });
});

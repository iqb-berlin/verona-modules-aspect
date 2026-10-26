import { UIElement } from 'common/models/elements/element';
import { UIElementDraft, UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { ClozeDocumentWrapperNode } from 'common/models/elements/cloze';
import { StartsWithTextPipe } from './starts-with-text.pipe';

describe('StartsWithTextPipe', () => {
  let pipe: StartsWithTextPipe;

  const element = (type: UIElementType, properties: Record<string, unknown> = {}): UIElement => (
    ElementFactory.createElement({
      type, id: `${type}_1`, alias: `${type}_1`, ...properties
    } as UIElementDraft)
  );

  const paragraph = (text: string): ClozeDocumentWrapperNode => ({
    type: 'paragraph', attrs: {}, content: [{ type: 'text', text }]
  });
  const blockImage: ClozeDocumentWrapperNode = { type: 'blockImage', attrs: { src: 'picture.png' }, content: [] };
  const horizontalRule: ClozeDocumentWrapperNode = { type: 'horizontalRule', attrs: {}, content: [] };
  const cloze = (...content: ClozeDocumentWrapperNode[]): UIElement => element('cloze', {
    document: { type: 'doc', content }
  });

  beforeEach(() => {
    pipe = new StartsWithTextPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  /* The measured "no" of #1618: the number stays at the top edge, as flex-start put it. */
  it('should say no for the types without a line of text at their top', () => {
    const types: UIElementType[] = ['image', 'video', 'audio', 'frame', 'geometry', 'hotspot-image',
      'marking-panel', 'trigger', 'drop-list', 'slider', 'math-table', 'table', 'tetfolio',
      'widget-molecule-editor', 'widget-periodic-table', 'text-area', 'dropdown', 'checkbox',
      'text-area-math'];

    expect(types.filter(type => pipe.transform(element(type)))).toEqual([]);
  });

  it('should say yes for the input fields', () => {
    expect(pipe.transform(element('text-field'))).toBe(true);
    expect(pipe.transform(element('spell-correct'))).toBe(true);
  });

  describe('text', () => {
    const text = (html: string, properties: Record<string, unknown> = {}): UIElement => element('text', {
      text: html, ...properties
    });

    it('should say yes for a text that begins with a paragraph, a heading or plain text', () => {
      expect(pipe.transform(text('<p>Text</p>'))).toBe(true);
      expect(pipe.transform(text('<h2>Titel</h2><p>Text</p>'))).toBe(true);
      expect(pipe.transform(text('Text'))).toBe(true);
    });

    it('should say no for a text that begins with a picture inserted without alignment', () => {
      expect(pipe.transform(text('<img src="picture.png"><p>Text</p>'))).toBe(false);
    });

    it('should say no for a floated picture, which leaves the text beside it room only while it is narrow', () => {
      expect(pipe.transform(text('<img src="picture.png" style="float: left; margin-right: 10px;"><p>Text</p>')))
        .toBe(false);
    });

    it('should find a leading picture at any depth', () => {
      expect(pipe.transform(text('<blockquote><img src="picture.png"><p>Zitat</p></blockquote>'))).toBe(false);
      expect(pipe.transform(text('<p><img src="picture.png"></p><p>Text</p>'))).toBe(false);
      expect(pipe.transform(text('<blockquote><p>Zitat</p></blockquote>'))).toBe(true);
    });

    it('should say yes for an inline picture in the first line', () => {
      expect(pipe.transform(text(
        '<p><img src="picture.png" style="display: inline-block; height: 1em; vertical-align: middle">Text</p>'
      ))).toBe(true);
    });

    it('should look past a leading rule, which draws no line', () => {
      expect(pipe.transform(text('<hr><img src="picture.png"><p>Text</p>'))).toBe(false);
      expect(pipe.transform(text('<hr><p>Text</p>'))).toBe(true);
    });

    it('should say no for an empty text', () => {
      expect(pipe.transform(text(''))).toBe(false);
    });

    it('should say no while the marking bar stands above the text', () => {
      expect(pipe.transform(text('<p>Text</p>', { highlightableYellow: true }))).toBe(false);
      expect(pipe.transform(text('<p>Text</p>', { highlightableTurquoise: true }))).toBe(false);
      expect(pipe.transform(text('<p>Text</p>', { highlightableOrange: true }))).toBe(false);
    });
  });

  describe('cloze', () => {
    it('should say yes for a cloze that begins with text', () => {
      expect(pipe.transform(cloze(paragraph('Text')))).toBe(true);
    });

    it('should say no for a cloze that begins with a block image', () => {
      expect(pipe.transform(cloze(blockImage, paragraph('Text')))).toBe(false);
    });

    it('should look past the nodes the cloze does not draw', () => {
      expect(pipe.transform(cloze(horizontalRule, blockImage, paragraph('Text')))).toBe(false);
      expect(pipe.transform(cloze(horizontalRule, paragraph('Text')))).toBe(true);
    });

    it('should say no for an empty cloze', () => {
      expect(pipe.transform(cloze())).toBe(false);
    });

    it('should say no for a document without content, which the cloze draws empty', () => {
      const withoutContent = cloze();
      (withoutContent as unknown as { document: object }).document = { type: 'doc' };

      expect(pipe.transform(withoutContent)).toBe(false);
    });
  });

  describe('elements led by their label', () => {
    const options = [{ text: 'A' }, { text: 'B' }];
    const imageOptions = options.map(option => ({ ...option, imgSrc: null }));
    const likertRows = [{
      type: 'likert-row', id: 'row_1', alias: 'row_1', rowLabel: { text: 'Zeile', imgSrc: null, imgPosition: 'above' }
    }];
    const withLabel = (cases: [UIElementType, Record<string, unknown>][], label: string): UIElementType[] => cases
      .filter(([type, filling]) => pipe.transform(element(type, { ...filling, label })))
      .map(([type]) => type);

    describe('as rich text', () => {
      const cases: [UIElementType, Record<string, unknown>][] = [
        ['radio', { options }],
        ['radio-group-images', { options: imageOptions }]
      ];

      it('should say yes when the label begins with text', () => {
        expect(withLabel(cases, '<p>Frage</p>')).toEqual(['radio', 'radio-group-images']);
      });

      it('should say no when the label is empty or begins with a picture', () => {
        expect(withLabel(cases, '')).toEqual([]);
        expect(withLabel(cases, '<p></p>')).toEqual([]);
        expect(withLabel(cases, '<img src="picture.png"><p>Frage</p>')).toEqual([]);
      });
    });

    describe('as plain text', () => {
      const cases: [UIElementType, Record<string, unknown>][] = [
        ['math-field', {}],
        ['likert', { options: imageOptions, rows: likertRows }]
      ];

      it('should say yes when there is a label', () => {
        expect(withLabel(cases, 'Frage')).toEqual(['math-field', 'likert']);
      });

      it('should say no when the label is empty', () => {
        expect(withLabel(cases, '')).toEqual([]);
        expect(withLabel(cases, '  ')).toEqual([]);
      });
    });
  });

  describe('toggle button', () => {
    it('should say yes when its first option begins with text', () => {
      expect(pipe.transform(element('toggle-button', { options: [{ text: 'A' }, { text: 'B' }] }))).toBe(true);
    });

    it('should say no when its first option begins with a picture', () => {
      expect(pipe.transform(element('toggle-button', { options: [{ text: '<img src="picture.png"><p>A</p>' }] })))
        .toBe(false);
    });

    it('should say no without options, when it holds only an empty line in its middle', () => {
      expect(pipe.transform(element('toggle-button', { options: [] }))).toBe(false);
    });
  });

  describe('button', () => {
    it('should say yes for a button with a text label', () => {
      expect(pipe.transform(element('button', { label: 'Weiter' }))).toBe(true);
    });

    it('should say no for a picture button and for a button without a label', () => {
      expect(pipe.transform(element('button', { label: 'Weiter', imageSrc: 'picture.png' }))).toBe(false);
      expect(pipe.transform(element('button', { label: '' }))).toBe(false);
    });

    it('should say no for unit navigation, which the host can hide', () => {
      expect(pipe.transform(element('button', { label: 'Weiter', action: 'unitNav', actionParam: 'next' })))
        .toBe(false);
    });
  });
});

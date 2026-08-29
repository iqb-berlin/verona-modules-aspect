import { IDService } from 'editor/src/app/services/id.service';
import { TextElement } from 'common/models/elements/text';
import { GeometryElement } from 'common/models/elements/geometry';
import { ButtonElement } from 'common/models/elements/button';
import { createGeometrySection } from 'editor/modules/section-templates/utils/geometry-builders';

describe('createGeometrySection', () => {
  const sourceText = 'Erstellt mit GeoGebra, https://www.geogebra.org/ (es gelten die GeoGebra-Lizenzbedingungen).';
  let idService: IDService;

  beforeEach(() => {
    idService = new IDService();
  });

  it('should create a section with text, geometry and source text elements', () => {
    const section = createGeometrySection('Aufgabentext', 'appDef', 'file.ggb', false, sourceText, idService);
    expect(section.elements.length).toBe(3);
    expect((section.elements[0] as TextElement).text).toBe('Aufgabentext');
    expect((section.elements[1] as GeometryElement).appDefinition).toBe('appDef');
    expect((section.elements[1] as GeometryElement).fileName).toBe('file.ggb');
  });

  it('should use the given source text for the third element', () => {
    const section = createGeometrySection('Aufgabentext', 'appDef', 'file.ggb', false, sourceText, idService);
    expect((section.elements[2] as TextElement).text).toBe(sourceText);
  });

  it('should add a helper button when showHelper is set', () => {
    const section = createGeometrySection('Aufgabentext', 'appDef', 'file.ggb', true, sourceText, idService);
    expect(section.elements.length).toBe(4);
    expect((section.elements[3] as ButtonElement).type).toBe('button');
  });
});

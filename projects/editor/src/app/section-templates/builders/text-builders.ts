import { Section, SectionProperties } from 'common/models/section';
import { PositionedUIElement } from 'common/interfaces';
import { IDService } from 'editor/src/app/services/id.service';
import { TemplateService } from 'editor/src/app/section-templates/template.service';

// Stimulus Text
export function createTextSection(text1: string, text2: string, highlightableOrange: boolean,
                                  highlightableTurquoise: boolean, highlightableYellow: boolean,
                                  idService: IDService): Section {
  const section = new Section(undefined, idService);
  section.addElement(TemplateService.createElement(
    'text',
    { gridRow: 1, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
    {
      text: text1,
      highlightableOrange: highlightableOrange,
      highlightableTurquoise: highlightableTurquoise,
      highlightableYellow: highlightableYellow
    },
    idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 2, gridColumn: 1 },
                                                   { text: text2, styling: { fontSize: 14, lineHeight: 100 } },
                                                   idService
  )
  );
  return section;
}

// Markieren
export function createText2Section(text1: string, showHelper: boolean, idService: IDService): Section {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        gridRowRange: showHelper ? 2 : 1,
        marginBottom: { value: 40, unit: 'px' }
      },
      {
        text: text1
      },
      idService)
  ];
  if (showHelper) {
    sectionElements.push(
      TemplateService.createElement(
        'button',
        { gridRow: 1, gridColumn: 2 },
        {
          imageSrc: TemplateService.helpTooltipImageSrc,
          tooltipText: 'Drücke kurz auf den Knopf mit dem Stift. Drücke danach auf den Anfang ' +
            'eines Wortes. Halte gedrückt und ziehe im Text so weit, wie du markieren möchtest.',
          tooltipPosition: 'left'
        },
        idService)
    );
  }
  const section = new Section({
    ...showHelper && { autoColumnSize: false },
    ...showHelper && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

// Aufgabenidee
export function createText3Section(text1: string, text2: string, text3: string, text4: string, text5: string,
                                   idService: IDService): Section {
  const section = new Section(undefined, idService);
  section.addElement(TemplateService.createElement(
    'text', { gridRow: 1, gridColumn: 1 },
    { text: 'Aufgabenvorschlag fürs IQB', styling: { bold: true, fontColor: 'red' } },
    idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 2, gridColumn: 1 },
                                                   { text: 'Beschreibung der Aufgabenidee:', styling: { bold: true } },
                                                   idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 3, gridColumn: 1 }, { text: text1 }, idService));

  section.addElement(TemplateService.createElement('text', { gridRow: 4, gridColumn: 1 },
                                                   { text: 'Skizze der Aufgabe:', styling: { bold: true } }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 5, gridColumn: 1 }, { text: text2 }, idService));

  section.addElement(TemplateService.createElement('text', { gridRow: 6, gridColumn: 1 },
                                                   { text: 'Lösung der Aufgabe::', styling: { bold: true } }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 7, gridColumn: 1 }, { text: text3 }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 8, gridColumn: 1 },
                                                   { text: 'Aufgabenvorlage:', styling: { bold: true } }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 9, gridColumn: 1 }, { text: text4 }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 10, gridColumn: 1 },
                                                   { text: 'Benötigte Ressourcen:', styling: { bold: true } }, idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 11, gridColumn: 1 }, { text: text5 }, idService));
  return section;
}

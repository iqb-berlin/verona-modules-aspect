import { Section, SectionProperties } from 'common/models/section';
import { PositionedUIElement } from 'common/interfaces';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';

export function createInputSection(config: { text: string, answerCount: number, useTextAreas: boolean,
  numbering: 'latin' | 'decimal' | 'bullets' | 'none', fieldLength: 'very-small' | 'small' | 'medium' | 'large',
  expectedCharsCount: number }, idService: IDService): Section {
  const useNumbering = config.answerCount > 1 && config.numbering !== 'none';

  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        gridColumnRange: useNumbering ? 2 : 1,
        marginBottom: { value: config.useTextAreas ? 10 : 0, unit: 'px' }
      },
      { text: config.text },
      idService
    )
  ];

  const numberingChars : string[] = prepareNumberingChars(config.answerCount, config.numbering);
  for (let i = 0; i < config.answerCount; i++) {
    if (useNumbering) {
      sectionElements.push(
        TemplateService.createElement(
          'text',
          { gridRow: i + 2, gridColumn: 1, marginTop: { value: 16, unit: 'px' } },
          { text: `${numberingChars[i]}` },
          idService
        )
      );
    }
    let marginBottom = config.useTextAreas ? -6 : -25;
    if (i === config.answerCount - 1) marginBottom = config.useTextAreas ? 10 : 0;
    sectionElements.push(
      TemplateService.createElement(
        config.useTextAreas ? 'text-area' : 'text-field',
        {
          gridRow: i + 2,
          gridColumn: useNumbering ? 2 : 1,
          marginBottom: { value: marginBottom, unit: 'px' }
        },
        {
          ...!config.useTextAreas && {
            dimensions: {
              maxWidth: getWidth(config.fieldLength)
            } as DimensionProperties
          },
          ...!config.useTextAreas ? {
            showSoftwareKeyboard: true,
            addInputAssistanceToKeyboard: true,
            label: ''
          } : {
            showSoftwareKeyboard: true,
            addInputAssistanceToKeyboard: true,
            hasDynamicRowCount: true,
            expectedCharactersCount: Math.ceil(config.expectedCharsCount * 1.5) || 136,
            label: ''
          }
        },
        idService
      )
    );
  }

  const section = new Section({
    ...useNumbering && { autoColumnSize: false },
    ...useNumbering && { gridColumnSizes: [{ value: 25, unit: 'px' }, { value: 1, unit: 'fr' }] }
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

function prepareNumberingChars(answerCount: number, numbering: 'latin' | 'decimal' | 'bullets' | 'none'): string[] {
  const latinChars = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)'];
  switch (numbering) {
    case 'latin': return latinChars.slice(0, answerCount);
    case 'decimal': return Array.from(Array(answerCount).keys()).map(char => `${String(char + 1)})`);
    case 'bullets': return Array(answerCount).fill('&#x2022;');
    case 'none': return [];
    default: throw Error(`Unexpected numbering: ${numbering}`);
  }
}

function getWidth(length: 'very-small' | 'small' | 'medium' | 'large'): number {
  switch (length) {
    case 'large': return 750;
    case 'medium': return 500;
    case 'small': return 250;
    case 'very-small': return 75;
    default: throw Error(`Unexpected length: ${length}`);
  }
}

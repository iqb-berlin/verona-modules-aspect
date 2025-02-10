import { PositionedUIElement } from 'common/interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';
import { CONSTANTS } from '../constants';

export function createMathTableSection(operation: 'addition' | 'subtraction' | 'multiplication', terms: string[],
                                       idService: IDService) {
  const showTooltip = operation === 'subtraction';
  const text = operation === 'multiplication' ? CONSTANTS.mathtableText : 'Rechne schriftlich.';
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        marginBottom: { value: operation === 'multiplication' ? 30 : 10, unit: 'px' }
      },
      { text },
      idService),
    TemplateService.createElement(
      'math-table',
      {
        gridRow: 2,
        gridColumn: 1,
        gridRowRange: showTooltip ? 3 : 1,
        marginBottom: { value: 30, unit: 'px' }
      },
      {
        text: 'Rechne schriftlich.',
        operation: operation,
        terms: terms,
        inputAssistancePreset: operation === 'multiplication' ? 'numbersAndOperators' : 'numbers',
        inputAssistanceFloatingStartPosition: 'endCenter',
        hasArrowKeys: true,
        hideNativeKeyboard: true
      },
      idService)
  ];
  if (showTooltip) {
    sectionElements.push(
      TemplateService.createElement(
        'button',
        { gridRow: 2, gridColumn: 2 },
        {
          imageSrc: TemplateService.helpTooltipImageSrc,
          tooltipText: 'In den kleinen Feldern oberhalb der Rechnung kannst du mehrstellige Überträge eintragen. ' +
            'Wenn du einen Übertrag durchstreichen möchtest, drücke zweimal hintereinander auf das jeweilige Feld.',
          tooltipPosition: 'left'
        },
        idService)
    );
  }
  const section = new Section({
    ...showTooltip && { autoColumnSize: false },
    ...showTooltip && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

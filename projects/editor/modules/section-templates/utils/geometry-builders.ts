import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { SectionProperties } from 'common/models/section';
import { IDService } from 'editor/src/app/services/id.service';
import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import { EditorSection } from 'editor/src/app/models/editor-section';

export function createGeometrySection(text: string, geometryAppDefinition: string, geometryFileName: string,
                                      showHelper: boolean, sourceText: string, idService: IDService) {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 20, unit: 'px' } },
      { text: text },
      idService),
    TemplateService.createElement(
      'geometry',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
      {
        appDefinition: geometryAppDefinition,
        fileName: geometryFileName,
        enableShiftDragZoom: false,
        showZoomButtons: false,
        showFullscreenButton: false
      },
      idService),
    TemplateService.createElement(
      'text',
      { gridRow: 3, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
      {
        text: sourceText,
        styling: { fontSize: 14, lineHeight: 100 }
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
          tooltipText: 'Drücke jeweils auf die Stelle, wo eine Linie beginnen und wo sie enden soll. ' +
            'Zeichne Linie für Linie.',
          tooltipPosition: 'left'
        },
        idService)
    );
  }

  const section = new EditorSection({
    ...showHelper && { autoColumnSize: false },
    ...showHelper && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

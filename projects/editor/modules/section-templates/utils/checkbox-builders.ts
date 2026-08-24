import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import { IDService } from 'editor/src/app/services/id.service';
import { EditorSection } from 'editor/src/app/models/editor-section';

export function createCheckboxSection(text1: string, options: string[], useImages: boolean,
                                      idService: IDService): EditorSection {
  const sectionElements = [
    TemplateService.createElement('text',
                                  { gridRow: 1, gridColumn: 1, gridColumnRange: useImages ? options.length : 1 },
                                  { text: text1 }, idService)
  ];
  if (!useImages) {
    options.forEach((option: string, i: number) => {
      sectionElements.push(
        TemplateService.createElement('checkbox', { gridRow: i + 2, gridColumn: 1 }, { label: option }, idService)
      );
    });
  } else {
    options.forEach((option: string, i: number) => {
      sectionElements.push(
        TemplateService.createElement('checkbox', { gridRow: 2, gridColumn: i + 1 }, { imgSrc: option }, idService)
      );
    });
  }

  const section = new EditorSection(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

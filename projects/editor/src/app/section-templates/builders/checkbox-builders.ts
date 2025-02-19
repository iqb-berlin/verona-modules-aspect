import { Section } from 'common/models/section';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';

export function createCheckboxSection(text1: string, options: string[], useImages: boolean,
                                      idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement('text', { gridRow: 1, gridColumn: 1 },
                                  { text: text1 }, idService)
  ];
  if (!useImages) {
    options.forEach((option: string, i: number) => {
      sectionElements.push(
        TemplateService.createElement('checkbox', { gridRow: i + 1, gridColumn: 1 }, { label: option }, idService)
      );
    });
  } else {
    options.forEach((option: string, i: number) => {
      sectionElements.push(
        TemplateService.createElement('checkbox', { gridRow: 2, gridColumn: i + 1 }, { imgSrc: option }, idService)
      );
    });
  }

  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

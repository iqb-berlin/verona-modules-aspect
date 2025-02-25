import { TextImageLabel } from 'common/interfaces';
import { Section } from 'common/models/section';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';
import { ImageRadioOptions, TextRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';

export function createTextRadioSection(options: TextRadioOptions, idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement('text', { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
                                  { text: options.label1 }, idService),
    TemplateService.createElement('radio', { gridRow: 2, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
                                  { label: options.label2, options: options }, idService)
  ];
  if (options.addExtraInput) {
    sectionElements.push(
      TemplateService.createElement('text', { gridRow: 3, gridColumn: 1 }, { text: options.text1 }, idService));
    sectionElements.push(
      TemplateService.createElement('text-area', { gridRow: 4, gridColumn: 1 }, {}, idService));
  }
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createImageRadioSection(options: ImageRadioOptions, idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 5, unit: 'px' } },
      { text: options.label1 },
      idService),
    TemplateService.createElement(
      'radio-group-images',
      { gridRow: 2, gridColumn: 1 },
      { label: '', options: options, itemsPerRow: options.itemsPerRow },
      idService)
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createLikertSection(text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[],
                                    idService: IDService): Section {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
      { text: text1 },
      idService),
    TemplateService.createElement(
      'likert',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 35, unit: 'px' } },
      {
        options: options,
        rows: rows.map(row => ({
          rowLabel: {
            ...row
          },
          columnCount: options.length
        })),
        label: text2,
        label2: '',
        stickyHeader: true,
        firstColumnSizeRatio: 3
      },
      idService)
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

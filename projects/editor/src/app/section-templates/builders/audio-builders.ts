import { DimensionProperties, PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { Section } from 'common/models/section';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { IDService } from 'editor/src/app/services/id.service';

export function createAudioSectionA(src1: string, fileName1: string, maxRuns1: number, text: string,
                                    idService: IDService) {
  const sectionElements = [
    TemplateService.createElement(
      'text',
      { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
      { text: 'Drücke zuerst auf das Dreieck, dann startet der Hörtext.' },
      idService),
    TemplateService.createElement(
      'audio',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 15, unit: 'px' } },
      {
        dimensions: { maxWidth: 500 } as DimensionProperties,
        src: src1,
        fileName: fileName1,
        player: {
          maxRuns: maxRuns1,
          showRestRuns: maxRuns1 > 1,
          ...getAudioSettings()
        } as PlayerProperties
      },
      idService),
    TemplateService.createElement(
      'text',
      { gridRow: 3, gridColumn: 1 },
      { text: text, styling: { fontSize: 14, lineHeight: 100 } },
      idService
    )
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createAudioSectionB(src1: string, fileName1: string, maxRuns1: number, src2: string, fileName2: string,
                                    maxRuns2: number, lang: 'german' | 'english' | 'french', text: string,
                                    text2: string, idService: IDService) {
  const sectionElements = [];
  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
    { text: `${getAudioTranslation(lang, 'instruction')}:` },
    idService
  ));
  const firstAudioElement = TemplateService.createElement(
    'audio',
    { gridRow: 2, gridColumn: 1, marginBottom: { value: 15, unit: 'px' } },
    {
      src: src1,
      fileName: fileName1,
      dimensions: { maxWidth: 500 } as DimensionProperties,
      player: {
        maxRuns: maxRuns1,
        showRestRuns: maxRuns1 > 1,
        ...getAudioSettings()
      } as PlayerProperties
    },
    idService
  );
  const firstAudioID = firstAudioElement.id;
  sectionElements.push(firstAudioElement);

  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 3, gridColumn: 1, marginBottom: { value: 20, unit: 'px' } },
    { text: text },
    idService
  ));
  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 4, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
    { text: `${getAudioTranslation(lang, 'audio')}:` },
    idService
  ));
  sectionElements.push(TemplateService.createElement(
    'audio',
    { gridRow: 5, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
    {
      dimensions: { maxWidth: 500 } as DimensionProperties,
      src: src2,
      fileName: fileName2,
      player: {
        maxRuns: maxRuns2,
        showRestRuns: maxRuns2 > 1,
        activeAfterID: firstAudioID,
        ...getAudioSettings()
      } as PlayerProperties
    },
    idService
  ));

  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 6, gridColumn: 1 },
    { text: text2, styling: { fontSize: 14, lineHeight: 100 } },
    idService
  ));

  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

function getAudioTranslation(lang: 'german' | 'english' | 'french', type: 'instruction' | 'audio'): string {
  switch (lang) {
    case 'german': return type === 'instruction' ? 'Instruktion' : 'Hörtext';
    case 'english': return type === 'instruction' ? 'instruction' : 'audio recording';
    case 'french': return type === 'instruction' ? 'l’instruction ' : 'texte audio ';
    default: throw Error();
  }
}

function getAudioSettings(): Record<string, boolean | string | number> {
  return {
    muteControl: false,
    interactiveMuteControl: false,
    hintLabel: 'Bitte starten.',
    hintLabelDelay: 5000,
    minVolume: 0.2
  };
}

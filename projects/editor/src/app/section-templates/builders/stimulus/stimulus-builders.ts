import { Section } from 'common/models/section';
import { IDService } from 'editor/src/app/services/id.service';
import {
  TextStimulusOptions, EmailStimulusOptions,
  MessageStimulusOptions, Audio1StimulusOptions, Audio2StimulusOptions
} from 'editor/src/app/section-templates/stimulus-interfaces';
import { getEmailTemplateString } from 'editor/src/app/section-templates/builders/stimulus/email';
import { getMessageTemplateString } from 'editor/src/app/section-templates/builders/stimulus/message';
import { TemplateService } from 'editor/src/app/section-templates/template.service';
import { DimensionProperties, PlayerProperties } from 'common/models/elements/property-group-interfaces';

export function createTextSection(options: TextStimulusOptions, idService: IDService) {
  const section = new Section(undefined, idService);
  section.addElement(TemplateService.createElement(
    'text',
    { gridRow: 1, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
    {
      text: options.text1,
      highlightableOrange: options.allowMarking,
      highlightableTurquoise: options.allowMarking,
      markingMode: 'range'
    },
    idService));
  section.addElement(TemplateService.createElement('text', { gridRow: 2, gridColumn: 1 },
                                                   { text: options.text2, styling: { fontSize: 14, lineHeight: 100 } },
                                                   idService));
  return section;
}

export function createEmailSection(options: EmailStimulusOptions, idService: IDService): Section {
  let fromLabel = 'Von';
  let toLabel = 'An';
  let subjectLabel = 'Betreff';
  let sendLabel = 'Senden';
  if (options.lang === 'en') {
    fromLabel = 'From';
    toLabel = 'To';
    subjectLabel = 'Subject';
    sendLabel = 'Send';
  } else if (options.lang === 'fr') {
    fromLabel = 'De';
    toLabel = 'À';
    subjectLabel = 'Objet';
    sendLabel = 'Envoyer';
  }
  return new Section(JSON.parse(getEmailTemplateString({ ...options, fromLabel, toLabel, subjectLabel, sendLabel })),
                     idService);
}

export function createMessageSection(options: MessageStimulusOptions, idService: IDService): Section {
  let sendLabel = 'Antworten';
  if (options.lang === 'en') {
    sendLabel = 'Reply';
  } else if (options.lang === 'fr') {
    sendLabel = 'Répondre';
  }
  return new Section(JSON.parse(getMessageTemplateString({ ...options, sendLabel })),
                     idService);
}

export function createAudio1Section(options: Audio1StimulusOptions, idService: IDService) {
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
        src: options.src1,
        fileName: options.fileName1,
        player: {
          maxRuns: options.maxRuns1,
          showRestRuns: options.maxRuns1 > 1,
          ...getAudioSettings()
        } as PlayerProperties
      },
      idService),
    TemplateService.createElement(
      'text',
      { gridRow: 3, gridColumn: 1 },
      { text: options.text, styling: { fontSize: 14, lineHeight: 100 } },
      idService
    )
  ];
  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createAudio2Section(options: Audio2StimulusOptions, idService: IDService) {
  const sectionElements = [];
  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
    { text: `${getAudioTranslation(options.lang, 'instruction')}:` },
    idService
  ));
  const firstAudioElement = TemplateService.createElement(
    'audio',
    { gridRow: 2, gridColumn: 1, marginBottom: { value: 15, unit: 'px' } },
    {
      src: options.src1,
      fileName: options.fileName1,
      dimensions: { maxWidth: 500 } as DimensionProperties,
      player: {
        maxRuns: options.maxRuns1,
        showRestRuns: options.maxRuns1 > 1,
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
    { text: options.text },
    idService
  ));
  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 4, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
    { text: `${getAudioTranslation(options.lang, 'audio')}:` },
    idService
  ));
  sectionElements.push(TemplateService.createElement(
    'audio',
    { gridRow: 5, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
    {
      dimensions: { maxWidth: 500 } as DimensionProperties,
      src: options.src2,
      fileName: options.fileName2,
      player: {
        maxRuns: options.maxRuns2,
        showRestRuns: options.maxRuns2 > 1,
        activeAfterID: firstAudioID,
        ...getAudioSettings()
      } as PlayerProperties
    },
    idService
  ));

  sectionElements.push(TemplateService.createElement(
    'text',
    { gridRow: 6, gridColumn: 1 },
    { text: options.text2, styling: { fontSize: 14, lineHeight: 100 } },
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

import { Section } from 'common/models/section';
import { IDService } from 'editor/src/app/services/id.service';
import {
  TextStimulusOptions,
  EmailStimulusOptions,
  MessageStimulusOptions
} from 'editor/src/app/section-templates/stimulus-interfaces';
import { getEmailTemplateString } from 'editor/src/app/section-templates/builders/stimulus/email';
import { getMessageTemplateString } from 'editor/src/app/section-templates/builders/stimulus/message';
import { TemplateService } from 'editor/src/app/section-templates/template.service';

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

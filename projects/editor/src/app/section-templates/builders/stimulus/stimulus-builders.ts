import { Section } from 'common/models/section';
import { IDService } from 'editor/src/app/services/id.service';
import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { getEmailTemplateString } from 'editor/src/app/section-templates/builders/stimulus/email';
import { getMessageTemplateString } from 'editor/src/app/section-templates/builders/stimulus/message';

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

export function createMessageSection(options: EmailStimulusOptions, idService: IDService): Section {
  let sendLabel = 'Antworten';
  if (options.lang === 'en') {
    sendLabel = 'Reply';
  } else if (options.lang === 'fr') {
    sendLabel = 'Répondre';
  }
  return new Section(JSON.parse(getMessageTemplateString({ ...options, sendLabel })),
                     idService);
}

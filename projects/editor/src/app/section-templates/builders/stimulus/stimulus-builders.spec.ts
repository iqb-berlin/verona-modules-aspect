import { IDService } from 'editor/src/app/services/id.service';
import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';
import { createEmailSection } from 'editor/src/app/section-templates/builders/stimulus/stimulus-builders';

describe('createEmailSection', () => {
  let idService: IDService;

  const createOptions = (lang: 'de' | 'en' | 'fr'): EmailStimulusOptions => ({
    instruction: 'Lies die E-Mail.',
    from: 'sender@example.com',
    to: 'receiver@example.com',
    subject: 'Test',
    body: 'Text',
    subText: 'Untertext',
    lang,
    allowMarking: false
  });

  beforeEach(() => {
    idService = new IDService();
  });

  it('should use German labels with plain colons', () => {
    const section = JSON.stringify(createEmailSection(createOptions('de'), idService));
    expect(section).toContain('Von:');
    expect(section).toContain('An:');
    expect(section).toContain('Betreff:');
    expect(section).toContain('Senden');
  });

  it('should use English labels with plain colons', () => {
    const section = JSON.stringify(createEmailSection(createOptions('en'), idService));
    expect(section).toContain('From:');
    expect(section).toContain('To:');
    expect(section).toContain('Subject:');
    expect(section).toContain('Send');
  });

  it('should use French labels with narrow no-break space before colons', () => {
    const section = JSON.stringify(createEmailSection(createOptions('fr'), idService));
    expect(section).toContain('De\u202F:');
    expect(section).toContain('À\u202F:');
    expect(section).toContain('Objet\u202F:');
    expect(section).toContain('Envoyer');
  });
});

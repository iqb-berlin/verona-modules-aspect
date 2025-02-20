export interface EmailStimulusOptions {
  instruction: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  subText: string;
  lang: 'de' | 'en' | 'fr';
  allowMarking: boolean;
}

export interface MessageStimulusOptions {
  instruction: string;
  from: string;
  body: string;
  subText: string;
  lang: 'de' | 'en' | 'fr';
}

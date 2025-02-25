export interface TextStimulusOptions {
  text1: string;
  text2: string;
  allowMarking: boolean
}

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

export interface Audio1StimulusOptions {
  src1: string | undefined;
  fileName1: string | undefined;
  maxRuns1: number;
  text: string;
}

export interface Audio2StimulusOptions extends Audio1StimulusOptions {
  src2: string | undefined;
  fileName2: string | undefined;
  maxRuns2: number;
  lang: 'german' | 'english' | 'french';
  text2: string;
}

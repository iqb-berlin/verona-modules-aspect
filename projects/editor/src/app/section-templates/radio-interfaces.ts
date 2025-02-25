import { Label, TextImageLabel } from 'common/interfaces';

export interface TextRadioOptions {
  label1: string;
  label2: string;
  options: Label[];
  addExtraInput: boolean;
  text1: string;
}

export interface ImageRadioOptions {
  label1: string;
  options: TextImageLabel[];
  itemsPerRow: number;
}

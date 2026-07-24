export interface DroplistTemplateOptions {
  text1: string;
  headingSourceList: string;
  options: string[];
  optionWidth: 'long' | 'medium' | 'short' | 'very-short';
}

export interface ClassicTemplateOptions extends DroplistTemplateOptions {
  headingTargetLists: string;
  targetLabels: string[];
  targetLabelAlignment: 'column' | 'row';
  targetWidth: 'medium' | 'short' | 'very-short';
}

export interface SortTemplateOptions extends DroplistTemplateOptions {
  numbering: boolean;
}

export interface TwoPageTemplateOptions extends DroplistTemplateOptions {
  text2: string;
  text3: string;
  headingTargetLists: string;
  targetLabels: string[];
  labelsBelow: boolean;
  targetListAlignment: 'row' | 'grid';
  srcUseImages: boolean;
  imageSize: 'medium' | 'small';
  targetUseImages: boolean;
}

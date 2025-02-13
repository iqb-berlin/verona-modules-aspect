export interface DroplistTemplateOptions {
  templateVariant: 'classic' | '2pages' | '2pages-images' | 'sort';
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

export function isClassicTemplate(template: DroplistTemplateOptions): template is ClassicTemplateOptions {
  return template.templateVariant === 'classic';
}

export interface SortTemplateOptions extends DroplistTemplateOptions {
  numbering: boolean;
}

export function isSortTemplate(template: DroplistTemplateOptions): template is SortTemplateOptions {
  return template.templateVariant === 'sort';
}

export interface TwoPageTemplateOptions extends DroplistTemplateOptions {
  text2: string;
  text3: string;
  headingTargetLists: string;
  targetLabels: string[];
  labelsBelow: boolean;
  srcUseImages: boolean;
  imageSize: 'medium' | 'small';
  targetUseImages: boolean;
}

export function isTwoPageTemplate(template: DroplistTemplateOptions): template is TwoPageTemplateOptions {
  return template.templateVariant === '2pages';
}

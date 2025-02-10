import { DragNDropValueObject, TextLabel } from 'common/interfaces';

export interface DroplistTemplateOptions {
  templateVariant: 'classic' | '2pages' | '2pages-images' | 'sort';
  text1: string;
  headingSourceList: string;
  options: DragNDropValueObject[];
  optionWidth: 'long' | 'medium' | 'short' | 'very-short';
}

export interface ClassicTemplateOptions extends DroplistTemplateOptions {
  headingTargetLists: string;
  targetLabels: TextLabel[];
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
  targetLabels: TextLabel[];
  labelsBelow: boolean;
}

export function isTwoPageTemplate(template: DroplistTemplateOptions): template is TwoPageTemplateOptions {
  return template.templateVariant === '2pages';
}

export interface TwoPageImagesTemplateOptions extends TwoPageTemplateOptions {
  imageWidth: 'medium' | 'small';
}

export function isTwoPageImagesTemplate(template: DroplistTemplateOptions): template is TwoPageImagesTemplateOptions {
  return template.templateVariant === '2pages-images';
}

import { UIElementType } from 'common/models/elements/element';

export type ElementGroupName =
  'textInputGroup' | 'mediaPlayerGroup' | 'inputGroup' | 'compoundGroup' | 'textGroup' | 'interactiveGroup';

export interface ElementGroup {
  name: ElementGroupName,
  types: UIElementType[]
}

import { UIElementType } from 'common/models/elements/element';

export type ElementGroupName =
  'textInputGroup' | 'mediaPlayerGroup' | 'inputGroup' | 'compoundGroup' |
  'textGroup' | 'textAreaMathGroup' | 'interactiveGroup' | 'externalAppGroup';

export interface ElementGroup {
  name: ElementGroupName,
  types: UIElementType[]
}

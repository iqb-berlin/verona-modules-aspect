import { UIElementType } from 'common/interfaces';

export type ElementGroupName =
  'textInputGroup' | 'mediaPlayerGroup' | 'inputGroup' | 'compoundGroup' |
  'textGroup' | 'textAreaMathGroup' | 'interactiveGroup' | 'externalAppGroup';

export interface ElementGroupInterface {
  name: ElementGroupName,
  types: UIElementType[]
}

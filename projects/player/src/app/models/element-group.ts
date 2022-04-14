import { UIElementType } from 'common/interfaces/elements';

export type ElementGroupName =
  'textInputGroup' | 'mediaPlayerGroup' | 'inputGroup' | 'compoundGroup' | 'textGroup' | 'interactiveGroup';

export interface ElementGroup {
  name: ElementGroupName,
  types: UIElementType[]
}

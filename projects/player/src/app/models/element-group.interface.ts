import { UIElementType } from 'common/interfaces';

export type ElementGroupName =
  'textInputGroup' | 'mediaPlayerGroup' | 'inputGroup' | 'compoundGroup' | 'actionGroup' |
  'textGroup' | 'textAreaMathGroup' | 'interactiveGroup' | 'externalAppGroup' | 'widgetGroup' |
  'tetfolioGroup';

export interface ElementGroupInterface {
  name: ElementGroupName,
  types: UIElementType[]
}

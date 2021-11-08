// eslint-disable-next-line max-classes-per-file
import { IdService } from '../id.service';
import { LikertColumn, LikertRow } from '../interfaces/UIElementInterfaces';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert_row' | 'radio-group-images';
export type InputElementValue = string | number | boolean | null;

export interface ValueChangeElement {
  id: string;
  values: [InputElementValue, InputElementValue];
}

export abstract class UIElement {
  [index: string]: InputElementValue | string[] | LikertColumn[] | LikertRow[] | ((...args: any) => any);
  type!: UIElementType;

  id: string = 'id_placeholder';
  zIndex: number = 0;
  width: number = 180;
  height: number = 60;
  dynamicPositioning: boolean = false;
  xPosition: number = 0;
  yPosition: number = 0;
  gridColumnStart: number = 1;
  gridColumnEnd: number = 2;
  gridRowStart: number = 1;
  gridRowEnd: number = 2;
  marginLeft: number = 0;
  marginRight: number = 0;
  marginTop: number = 0;
  marginBottom: number = 0;

  protected constructor(serializedElement: UIElement) {
    Object.assign(this, serializedElement);
    if (!serializedElement.id) {
      this.id = IdService.getInstance().getNewID(serializedElement.type);
    }
  }

  // This can be overwritten by elements if they need to handle some property specifics. Likert does.
  setProperty(property: string,
              value: InputElementValue | string[] | LikertColumn[] | LikertRow[]): void {
    this[property] = value;
  }
}

export abstract class InputElement extends UIElement {
  label: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;
  readOnly: boolean = false;

  protected constructor(serializedElement: UIElement) {
    super(serializedElement);
    this.label = serializedElement.label as string || 'Beispielbeschriftung';
    this.value = serializedElement.value as string | number | boolean | null || null;
    this.required = serializedElement.required as boolean || false;
    this.requiredWarnMessage = serializedElement.requiredWarnMessage as string || 'Eingabe erforderlich';
    this.readOnly = serializedElement.readOnly as boolean || false;
  }
}

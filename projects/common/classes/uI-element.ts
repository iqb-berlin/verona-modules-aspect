// eslint-disable-next-line max-classes-per-file
import { IdService } from '../id.service';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video';
export type InputElementValue = string | number | boolean | null;

export abstract class UIElement {
  [index: string]: string | number | boolean | string[] | null | ((...args: any) => any);
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

  protected constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    Object.assign(this, serializedElement);
    if (!serializedElement.id) {
      this.id = IdService.getInstance().getNewID(serializedElement.type);
    }
    if (coordinates && this.dynamicPositioning) {
      this.gridColumnStart = coordinates.x;
      this.gridColumnEnd = coordinates.x + 1;
      this.gridRowStart = coordinates.y;
      this.gridRowEnd = coordinates.y + 1;
    } else if (coordinates && !this.dynamicPositioning) {
      this.xPosition = coordinates.x;
      this.yPosition = coordinates.y;
    }
  }
}

export abstract class InputElement extends UIElement {
  label: string;
  value: InputElementValue;
  required: boolean;
  requiredWarnMessage: string;

  protected constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    this.label = serializedElement.label as string || 'Dummylabel';
    this.value = serializedElement.value as string | number | boolean | null || null;
    this.required = serializedElement.required as boolean || false;
    this.requiredWarnMessage = serializedElement.requiredWarnMessage as string || 'Eingabe erforderlich';
  }
}

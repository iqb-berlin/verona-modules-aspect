// eslint-disable-next-line max-classes-per-file
import { IdService } from '../id.service';

export type UIElementType = 'text' | 'button' | 'text-field' | 'text-area' | 'checkbox'
| 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert_row' | 'radio-group-images'
| 'drop-list' | 'cloze';
export type InputElementValue = string[] | string | number | boolean | null;

export abstract class UIElement {
  [index: string]: any;

  type!: UIElementType;

  id: string = 'id_placeholder';
  width: number = 180;
  height: number = 60;

  positionProps?: PositionProperties;
  fontProps?: FontProperties;
  surfaceProps?: SurfaceProperties;
  playerProps?: PlayerProperties;

  protected constructor(serializedElement: UIElement) {
    Object.assign(this, serializedElement);
    if (!serializedElement.id) {
      this.id = IdService.getInstance().getNewID(serializedElement.type);
    }
  }

  getProperty(property: string): any {
    if (this.fontProps && property in this.fontProps) {
      return this.fontProps[property];
    }
    if (this.surfaceProps && property in this.surfaceProps) {
      return this.surfaceProps[property];
    }
    if (this.playerProps && property in this.playerProps) {
      return this.playerProps[property];
    }
    if (this.positionProps && property in this.positionProps) {
      return this.positionProps[property];
    }
    return this[property];
  }

  // This can be overwritten by elements if they need to handle some property specifics. Likert does.
  setProperty(property: string,
              value: InputElementValue | string[] | LikertColumn[] | LikertRow[]): void {
    if (this.fontProps && property in this.fontProps) {
      this.fontProps[property] = value as string | number | boolean;
    } else if (this.surfaceProps && property in this.surfaceProps) {
      this.surfaceProps[property] = value as string;
    } else if (this.playerProps && property in this.playerProps) {
      this.playerProps[property] = value as string;
    } else if (this.positionProps && property in this.positionProps) {
      this.positionProps[property] = value as string;
    } else {
      this[property] = value;
    }
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
    this.value =
      serializedElement.value !== undefined ? serializedElement.value as string | number | boolean | null : null;
    this.required = serializedElement.required !== undefined ? serializedElement.required as boolean : false;
    this.requiredWarnMessage = serializedElement.requiredWarnMessage as string || 'Eingabe erforderlich';
    this.readOnly = serializedElement.readOnly !== undefined ? serializedElement.readOnly as boolean : false;
  }
}

export abstract class CompoundElement extends UIElement {}

export interface ValueChangeElement {
  id: string;
  values: [InputElementValue, InputElementValue];
}

export interface PositionedElement extends UIElement {
  positionProps: PositionProperties;
}

export interface PositionProperties {
  [index: string]: string | number | boolean;
  dynamicPositioning: boolean;
  xPosition: number;
  yPosition: number;
  useMinHeight: boolean;
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  zIndex: number;
}

export interface FontElement {
  fontProps: FontProperties;
}

export interface FontProperties {
  [index: string]: string | number | boolean | undefined;
  fontColor?: string;
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface SurfaceElement {
  surfaceProps: SurfaceProperties;
}

export interface SurfaceProperties {
  [index: string]: string;
  backgroundColor: string;
}

export interface PlayerElement {
  playerProps: PlayerProperties;
}

export interface PlayerProperties {
  [index: string]: string | number | boolean | null;
  autostart: boolean;
  autostartDelay: number;
  loop: boolean;
  startControl: boolean;
  pauseControl: boolean;
  progressBar: boolean;
  interactiveProgressbar: boolean;
  volumeControl: boolean;
  defaultVolume: number;
  minVolume: number;
  muteControl: boolean;
  interactiveMuteControl: boolean;
  hintLabel: string;
  hintLabelDelay: number;
  uninterruptible: boolean;
  hideOtherPages: boolean;
  activeAfterID: string;
  minRuns: number;
  maxRuns: number | null;
  showRestRuns: boolean;
  showRestTime: boolean;
  playbackTime: number;
}

export interface LikertColumn {
  text: string;
  imgSrc: string | null;
  position: 'above' | 'below';
}

export interface LikertRow {
  text: string;
  columnCount: number;
}

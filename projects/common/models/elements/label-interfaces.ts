export interface TextLabel {
  text: string;
}

export interface TextImageLabel extends TextLabel {
  imgSrc: string | null;
  imgPosition: 'above' | 'below' | 'left' | 'right';
}

export interface DragNDropValueObject extends TextImageLabel {
  id: string;
  originListID: string;
  originListIndex: number;
  audioSrc: string | null;
}

export type Label = TextLabel | TextImageLabel | DragNDropValueObject;

export interface FontElement {
  fontColor: string;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface SurfaceUIElement {
  backgroundColor: string;
}

export interface PlayerElement {
  autostart: boolean;
  autostartDelay: number;
  loop: boolean;
  startControl: boolean;
  pauseControl: boolean;
  progressBar: boolean;
  interactiveProgressbar: boolean;
  volumeControl: boolean;
  hintLabel: string;
  hintLabelDelay: number;
  uninterruptible: boolean;
  hideOtherPages: boolean;
  activeAfterID: string;
  minRuns: number;
  maxRuns: number | null;
  showRestTime: boolean;
}

export interface AnswerOption {
  text: string;
  imgSrc: string | null;
  position: 'above' | 'below';
}

export interface LikertRow {
  text: string;
  columnCount: number;
}

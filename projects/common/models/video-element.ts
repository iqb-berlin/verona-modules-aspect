import { UIElement } from './uI-element';
import { initPlayerElement } from '../util/unit-interface-initializer';
import { PlayerElement } from '../interfaces/UIElementInterfaces';

export class VideoElement extends UIElement implements PlayerElement {
  src: string = '';

  autostart: boolean = false;
  autostartDelay: number = 0;
  loop: boolean = false;
  startControl: boolean = true;
  pauseControl: boolean = false;
  progressBar: boolean = true;
  interactiveProgressbar: boolean = false;
  volumeControl: boolean = true;
  hintLabel: string = '';
  hintLabelDelay: number = 0;
  uninterruptible: boolean = false;
  hideOtherPages: boolean = false;
  activeAfterID: string = '';
  minRuns: number = 1;
  maxRuns: number | null = null;
  showRestTime: boolean = true;
  playbackTime: number = 0;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initPlayerElement(serializedElement));
    this.height = serializedElement.height || 230;
    this.width = serializedElement.width || 280;
  }
}

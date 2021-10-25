import { UIElement } from './uI-element';
import { PlayerElement } from '../interfaces/UIElementInterfaces';
import { initPlayerElement } from '../util/unit-interface-initializer';

export class AudioElement extends UIElement implements PlayerElement {
  src: string = '';

  autostart: boolean = false;
  autostartDelay: number = 0;
  loop: boolean = false;
  startControl: boolean = true;
  pauseControl: boolean = false;
  stopControl: boolean = false;
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

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initPlayerElement(serializedElement));
    this.width = serializedElement.width || 280;
  }
}

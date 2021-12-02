import {
  PlayerElement, PlayerProperties, PositionedElement, PositionProperties, UIElement
} from '../../models/uI-element';
import { initPlayerElement, initPositionedElement } from '../../util/unit-interface-initializer';

export class VideoElement extends UIElement implements PositionedElement, PlayerElement {
  src: string = '';
  scale: boolean = false;
  positionProps: PositionProperties;
  playerProps: PlayerProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.playerProps = initPlayerElement(serializedElement);
    this.height = serializedElement.height || 230;
    this.width = serializedElement.width || 280;
  }
}

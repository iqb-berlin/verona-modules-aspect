import { PlayerElement, PlayerProperties, PositionedElement, PositionProperties, UIElement } from '../../models/uI-element';
import { initPlayerElement, initPositionedElement } from '../../util/unit-interface-initializer';

export class AudioElement extends UIElement implements PositionedElement, PlayerElement {
  src: string = '';

  positionProps: PositionProperties;
  playerProps: PlayerProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.playerProps = initPlayerElement(serializedElement);

    this.height = serializedElement.height || 90;
    this.width = serializedElement.width || 250;
  }
}

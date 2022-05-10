import { ElementFactory } from 'common/util/element.factory';
import { PlayerElement, PositionedUIElement, PositionProperties } from 'common/classes/element';

export class AudioElement extends PlayerElement implements PositionedUIElement {
  src: string | undefined;
  position: PositionProperties;

  constructor(element: AudioElement) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
  }
}

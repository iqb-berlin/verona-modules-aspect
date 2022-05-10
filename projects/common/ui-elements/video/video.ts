import { ElementFactory } from 'common/util/element.factory';
import { PlayerElement, PositionedUIElement, PositionProperties } from 'common/classes/element';

export class VideoElement extends PlayerElement implements PositionedUIElement {
  src: string | null = null;
  scale: boolean = false; // TODO besserer name
  position: PositionProperties;

  constructor(element: VideoElement) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
  }
}

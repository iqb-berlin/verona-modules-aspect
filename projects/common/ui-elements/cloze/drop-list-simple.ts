import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement } from 'common/classes/element';

export class DropListSimpleElement extends InputElement {
  connectedTo: string[] = [];
  copyOnDrop: boolean = false;
  highlightReceivingDropList: boolean = false;
  highlightReceivingDropListColor: string = '#006064';
  styling: BasicStyles & {
    itemBackgroundColor: string;
  };

  constructor(element: Partial<DropListSimpleElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: '#f4f4f2', ...element.styling }),
      itemBackgroundColor: element.styling?.itemBackgroundColor || '#c9e0e0'
    };
  }
}

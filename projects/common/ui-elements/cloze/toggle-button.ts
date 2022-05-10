import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, InputElement } from 'common/classes/element';

export class ToggleButtonElement extends InputElement {
  richTextOptions: string[] = [];
  strikeOtherOptions: boolean = false;
  verticalOrientation: boolean = false;
  dynamicWidth: boolean = true;
  styling: BasicStyles & {
    lineHeight: number;
    selectionColor: string;
  };

  constructor(element: Partial<ToggleButtonElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling }),
      lineHeight: element.styling?.lineHeight || 135,
      selectionColor: element.styling?.selectionColor || '#c7f3d0'
    };
  }
}

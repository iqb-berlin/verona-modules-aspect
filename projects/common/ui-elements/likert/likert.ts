import { ElementFactory } from 'common/util/element.factory';
import { BasicStyles, PositionedUIElement, PositionProperties, UIElement } from 'common/classes/element';
import { LikertRowElement } from 'common/ui-elements/likert/likert-row';
import { TextImageLabel } from 'common/interfaces/elements';

export class LikertElement extends UIElement implements PositionedUIElement {
  rows: LikertRowElement[] = [];
  columns: TextImageLabel[] = [];
  firstColumnSizeRatio: number = 5;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };

  constructor(element: Partial<LikertElement>) {
    super(element);
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({ backgroundColor: 'transparent', ...element.styling }),
      lineHeight: element.styling?.lineHeight || 135,
      lineColoring: element.styling?.lineColoring !== undefined ? element.styling.lineColoring as boolean : true,
      lineColoringColor: element.styling?.lineColoringColor || '#c9e0e0'
    };
  }
}

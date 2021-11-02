import { InputElementValue, UIElement } from '../uI-element';
import { LikertElementRow } from './likert-element-row';
import { LikertColumn, FontElement, SurfaceUIElement } from '../../interfaces/UIElementInterfaces';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class LikertElement extends UIElement implements FontElement, SurfaceUIElement {
  rows: LikertElementRow[] = [];
  columns: LikertColumn[] = [];
  lineColoring: boolean = true;
  lineColoringColor: string = '#D0F6E7';
  readOnly: boolean = false;

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  lineHeight: number = 120;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 200;
    this.width = serializedElement.width || 400;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }

  setProperty(property: string, value: InputElementValue): void {
    super.setProperty(property, value);
    if (property === 'answers') {
      this.rows.forEach(question => {
        question.columnCount = this.columns.length;
      });
    }
    if (property === 'readOnly') {
      this.rows.forEach(question => {
        question.readOnly = this.readOnly;
      });
    }
  }
}

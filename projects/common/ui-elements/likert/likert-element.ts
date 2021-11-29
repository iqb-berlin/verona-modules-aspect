import {
  CompoundElement, FontElement, FontProperties,
  InputElementValue,
  LikertColumn, PositionedElement, PositionProperties,
  SurfaceElement,
  SurfaceProperties,
  UIElement
} from '../../models/uI-element';
import { LikertElementRow } from './likert-element-row';
import { initFontElement, initPositionedElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class LikertElement extends CompoundElement implements PositionedElement, FontElement, SurfaceElement {
  rows: LikertElementRow[] = [];
  columns: LikertColumn[] = [];
  firstColumnSizeRatio: number = 5;
  lineColoring: boolean = true;
  lineColoringColor: string = '#D0F6E7';
  readOnly: boolean = false;

  positionProps: PositionProperties;
  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: UIElement) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.positionProps = initPositionedElement(serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    if (serializedElement?.rows) {
      this.rows = [];
      (serializedElement?.rows as LikertElementRow[]).forEach((row: LikertElementRow) => {
        this.rows.push(new LikertElementRow(row));
      });
    }

    this.height = serializedElement.height || 200;
    this.width = serializedElement.width || 250;
    this.surfaceProps.backgroundColor =
      (serializedElement as unknown as SurfaceElement).surfaceProps.backgroundColor as string ||
      serializedElement.backgroundColor as string ||
      'transparent';
  }

  setProperty(property: string, value: InputElementValue): void {
    super.setProperty(property, value);
    if (property === 'columns') {
      this.rows.forEach(row => {
        row.columnCount = this.columns.length;
      });
    }
    if (property === 'readOnly') {
      this.rows.forEach(row => {
        row.readOnly = this.readOnly;
      });
    }
  }
}

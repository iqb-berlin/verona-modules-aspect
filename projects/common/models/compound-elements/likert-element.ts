import { UIElement } from '../uI-element';
import { LikertElementRow } from './likert-element-row';
import { AnswerOption, FontElement, SurfaceUIElement } from '../../interfaces/UIElementInterfaces';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';

export class LikertElement extends UIElement implements FontElement, SurfaceUIElement {
  questions: LikertElementRow[] = [];
  answers: AnswerOption[] = [];
  lineColoring: boolean = true;

  fontColor: string = 'black';
  font: string = 'Roboto';
  fontSize: number = 18;
  bold: boolean = false;
  italic: boolean = false;
  underline: boolean = false;

  backgroundColor: string = 'transparent';

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);
    Object.assign(this, initFontElement(serializedElement));
    Object.assign(this, initSurfaceElement(serializedElement));

    this.height = serializedElement.height || 200;
    this.width = serializedElement.width || 400;
    this.backgroundColor = serializedElement.backgroundColor as string || 'transparent';
  }

  setProperty(property: string, value: string | number | boolean | string[] | AnswerOption[] | null): void {
    super.setProperty(property, value);
    if (property === 'answers') {
      this.questions.forEach(question => {
        question.columnCount = this.answers.length;
      });
    }
  }
}

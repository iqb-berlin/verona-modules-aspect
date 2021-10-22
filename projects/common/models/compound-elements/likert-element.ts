import { AnswerOption, UIElement } from '../uI-element';
import { LikertElementRow } from './likert-element-row';

export class LikertElement extends UIElement {
  questions: LikertElementRow[] = [
    new LikertElementRow({ type: 'likert_row', text: 'Testfrage', columnCount: 2 } as LikertElementRow)
  ];

  answers: AnswerOption[] = [{
    text: 'Option A',
    imgSrc: null,
    position: 'above'
  }, {
    text: 'Option B',
    imgSrc: null,
    position: 'above'
  }];

  lineColoring: boolean = true;

  constructor(serializedElement: UIElement, coordinates?: { x: number; y: number }) {
    super(serializedElement, coordinates);
    Object.assign(this, serializedElement);

    this.height = serializedElement.height || 200;
    this.width = serializedElement.width || 400;
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

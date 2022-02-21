import { Selector } from 'testcafe';

class Page {
  newInvalidElemnt;
  newButtonElement;
  labelPropertyField;

  constructor() {
    this.newInvalidElemnt = Selector('aspect-ui-element-toolbox')
      .find('button')
      .withText('invalid');
    this.newButtonElement = Selector('aspect-ui-element-toolbox')
      .find('button')
      .withText('Knopf');
    this.labelPropertyField = Selector('aspect-unit-view')
      .find('aspect-element-properties')
      .child('mat-tab-group')
      .find('.mat-form-field')
      .find('label').withText('Beschriftung')
      .parent()
      .parent()
      .child('input');
  }

  static getCanvasElementSelector(elementSelector: string): Selector {
    return Selector('.canvasFrame')
      .find('.aspect-inserted-element')
      .child(elementSelector);
  }
}

export default Page;

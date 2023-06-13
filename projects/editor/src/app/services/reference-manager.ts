import { Unit } from 'common/models/unit';
import { ButtonElement } from 'common/models/elements/button/button';

export class ReferenceManager {
  static getReferencedButton(pageIndex: number, unit: Unit): ButtonElement | undefined {
    const allButtons = unit.getAllElements('button') as ButtonElement[];
    return allButtons.find(button => button.action === 'pageNav' &&
      button.actionParam === pageIndex);
  }
}

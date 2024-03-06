import { addElement, addTextElement, setCheckbox } from '../util';

export function addList(title: string, options: string[] = [], settings?: Record<string, boolean>): void {
  addTextElement(title);
  addElement('Ablegeliste', '(Zu)Ordnung');
  options.forEach(option => addOption(option));
  if (settings?.highlightReceivingDropList) setCheckbox('Potentielle Ablagen hervorheben');
  if (settings?.sortList) setCheckbox('Sortierliste');
  if (settings?.onlyOneItem) setCheckbox('Nur ein Element');
  if (settings?.allowReplacement) setCheckbox('Verdrängen erlauben');
}

export function addOption(optionName: string): void {
  cy.contains('fieldset', 'Vorbelegung')
    .contains('mat-form-field', 'Neue Option')
    .find('input')
    .clear()
    .type(`${optionName}{enter}`);
}

export function dragTo(list: string, item: string, targetList: string): void {
  cy.get(`#${list}`).contains('.drop-list-item', item)
    .trigger('mousedown', { button: 0 });
  // Moving the mouse is actually not necessary, since the mouseenter event is not triggered.
  // It is triggered manually in the next step.
  // cy.get('.drag-preview').trigger('mousemove', { force: true, clientX: 640, clientY: 199 });
  cy.get(`#${targetList}`)
    .trigger('mouseenter');
  cy.get('.drag-preview')
    .trigger('mouseup', { force: true });
}

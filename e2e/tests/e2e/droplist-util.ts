import { addElement, addTextElement, selectFromDropdown, setCheckbox } from '../util';

/* Also adds text element as label before the droplist */
export function addList(title: string, options: string[] = [], settings?: Record<string, boolean>, id?: string): void {
  addTextElement(title);
  addElement('Ablegeliste', '(Zu)Ordnung', id);
  options.forEach(option => addOption(option));
  if (settings?.highlightReceivingDropList) setCheckbox('Potentielle Ablagen hervorheben');
  if (settings?.sortList) setCheckbox('Sortierliste');
  if (settings?.onlyOneItem) setCheckbox('Nur ein Element');
  if (settings?.allowReplacement) setCheckbox('Verdrängen erlauben');
}

export function addOption(optionName: string): void {
  cy.contains('fieldset', 'Vorbelegung')
    .contains('mat-form-field', 'Neue Option')
    .find('textarea')
    .clear()
    .type(`${optionName}{enter}`);
}

export function connectLists(sourceList: string, targetList: string): void {
  cy.get(`aspect-editor-dynamic-overlay:has([data-list-alias="${sourceList}")`).click();
  selectFromDropdown('Verbundene Ablegelisten', targetList, true);
}

export function dragTo(list: string, item: string, targetList: string): void {
  cy.getByAlias(`${list}`).contains('.drop-list-item', item)
    .trigger('mousedown', { button: 0 });

  // Moving the mouse is actually not necessary, since the mouseenter event is not triggered.
  // It is triggered manually in the next step.
  // cy.get('.drag-preview').trigger('mousemove', { force: true, clientX: 640, clientY: 199 });

  // Leave first, to change a variable and actually handle mouseenter events
  cy.getByAlias(`${list}`)
    .trigger('mouseleave');

  cy.getByAlias(`${targetList}`)
    .trigger('mouseenter');
  cy.get('.drag-preview')
    .trigger('mouseup', { force: true });
}

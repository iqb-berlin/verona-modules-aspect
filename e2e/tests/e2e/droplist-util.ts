import {
  addElement, addTextElement, selectFromDropdown, setCheckbox
} from '../util';

/* Also adds text element as label before the droplist */
export function addList(title: string, options: string[] = [], settings?: Record<string, boolean>, id?: string): void {
  addTextElement(title);
  addElement('Ablegeliste', '(Zu)Ordnung', id);
  options.forEach(option => addOption(option));
  if (settings?.highlightReceivingDropList) setCheckbox('Potentielle Ablagen hervorheben');
  if (settings?.sortList) setCheckbox('Sortierliste');
  if (settings?.onlyOneItem) setCheckbox('Nur ein Element');
  if (settings?.allowReplacement) setCheckbox('Verdrängen erlauben');
  if (settings?.copyOnDrop) setCheckbox('Elemente kopieren');
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
  if (settings?.showNumbering) setCheckbox('Nummerierung anzeigen');
  if (settings?.startNumberingAtZero) setCheckbox('Nummerierung bei 0 beginnen');
  if (settings?.permanentPlaceholders) setCheckbox('Platzhalter anzeigen');
  if (settings?.permanentPlaceholdersCC) setCheckbox('Platzhalter mit Durchschrift');
}

export function addOption(optionName: string): void {
  cy.contains('fieldset', 'Vorbelegung')
    .contains('mat-form-field', 'Neue Option')
    .find('textarea')
    .clear()
    .type(`${optionName}{enter}`);
}

export function moveToColumn(column: string): void {
  cy.contains('mat-icon', 'format_shapes').click();
  cy.contains('fieldset', 'Position')
    .contains('mat-form-field', 'Spalte')
    .find('input')
    .clear()
    .type(column);
  cy.contains('mat-icon', 'build').click();
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

export function dragToByTouch(list: string, item: string, targetList: string): void {
  cy.getByAlias(targetList)
    .then($targetEl => {
      const targetRect = $targetEl[0].getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      cy.getByAlias(list)
        .get(`.drop-list-item:contains("${item}")`)
        .then($startEl => {
          const startRect = $startEl[0].getBoundingClientRect();
          const startX = startRect.left + startRect.width / 2;
          const startY = startRect.top + startRect.height / 2;

          cy.wrap($startEl).trigger('touchstart', {
            touches: [{ clientX: startX, clientY: startY }]
          });

          cy.wrap($startEl).trigger('touchmove', {
            force: true, // this needed, probably because of the Material overlay that is created when dragging
            touches: [{ clientX: startX, clientY: startY }]
          });

          cy.wrap($startEl).trigger('touchmove', {
            force: true,
            touches: [{ clientX: targetX + 55, clientY: targetY }]
          });

          cy.wrap($startEl).trigger('touchend', {
            force: true,
            touches: [],
            changedTouches: [{ clientX: targetX, clientY: targetY }]
          });
        });
    });
}

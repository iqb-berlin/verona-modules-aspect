import { addElement, setExpertMode, setPreferencesElement } from '../util';

/**
 * Covers the properties panel with several elements selected — the one selection state that had no
 * e2e coverage at all, and the state in which the panel used to make a false claim.
 *
 * When the selected elements disagree on a property, the merged value is null. Bound to a plain
 * checkbox that arrived as "off", indistinguishable from "off for all". The panel now renders it as
 * indeterminate. The unit tests of the panel verify that against a mocked selection service; this
 * spec verifies it through the real editor: shift-click selection, the real merge, the real model.
 */

const readOnlyCheckbox = () => cy.contains('mat-checkbox', 'Schreibschutz').find('input');

/**
 * Clicking an element that is already selected does nothing — ElementOverlay.selectElement() is
 * guarded by `if (!this.isSelected)`. The selection can therefore not be narrowed back down by
 * clicking one of its members, which is why the per-element values are read from the saved unit
 * rather than from the panel.
 */
function selectElement(index: number, withShift: boolean = false): void {
  cy.get('aspect-editor-page-view aspect-text-field').eq(index)
    .click({ force: true, shiftKey: withShift });
}

function readOnlyPerElement(filepath: string): Cypress.Chainable<boolean[]> {
  cy.saveUnit(filepath);
  return cy.readFile(filepath).then((unit: { pages: { sections: { elements: { readOnly: boolean }[] }[] }[] }) => (
    unit.pages[0].sections[0].elements.map(element => element.readOnly)
  ));
}

describe('Properties panel with several elements selected', () => {
  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    setExpertMode(true);
  });

  describe('two text fields differing in one property', () => {
    beforeEach(() => {
      addElement('Eingabefeld');
      setPreferencesElement('Feld A', { readOnly: true });
      addElement('Eingabefeld');
      setPreferencesElement('Feld B');

      cy.get('aspect-editor-page-view aspect-text-field').should('have.length', 2);
    });

    it('should show a property the elements disagree on as indeterminate', () => {
      selectElement(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
      readOnlyCheckbox().should($input => expect($input[0].checked, 'Feld A ist schreibgeschützt').to.be.true);

      selectElement(1, true);

      // The panel refuses to make up an answer for a property that differs.
      readOnlyCheckbox().should($input => {
        expect($input[0].indeterminate, 'Schreibschutz ist unbestimmt').to.equal(true);
      });
    });

    it('should show a property the elements agree on as a plain state', () => {
      selectElement(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
      selectElement(1, true);

      // Both are not required, so there is nothing indeterminate about it.
      cy.contains('mat-checkbox', 'Pflichtfeld').find('input').should($input => {
        expect($input[0].indeterminate, 'Pflichtfeld ist bestimmt').to.equal(false);
        expect($input[0].checked, 'Pflichtfeld ist aus').to.equal(false);
      });
    });

    it('should leave both values untouched while the mixed state is only displayed', () => {
      selectElement(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
      selectElement(1, true);
      readOnlyCheckbox().should($input => expect($input[0].indeterminate).to.be.true);

      // Displaying the mixed state must not write anything: null never reaches the model.
      readOnlyPerElement('e2e/downloads/multi-selection-untouched.json')
        .should('deep.equal', [true, false]);
    });

    it('should apply one click to every selected element', () => {
      selectElement(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
      selectElement(1, true);

      readOnlyCheckbox().click({ force: true });

      // A click on a mixed box turns the property on everywhere — unchanged from before, but now the
      // author could see beforehand that there was something to lose.
      readOnlyCheckbox().should($input => {
        expect($input[0].indeterminate, 'nicht mehr unbestimmt').to.equal(false);
        expect($input[0].checked, 'jetzt überall an').to.equal(true);
      });

      readOnlyPerElement('e2e/downloads/multi-selection-clicked.json')
        .should('deep.equal', [true, true]);
    });
  });

  /**
   * The reported symptom of #1119. `idList` carries the ids of the whole selection so that a drop
   * list can leave the selected lists out of its own "connected lists" options. It used to be wiped
   * by the merge loop, and GetValidDropListsPipe answers `undefined` with an empty array — so with
   * several drop lists selected the field offered nothing at all and they could not be connected
   * together in one go.
   */
  describe('three drop lists', () => {
    const connectedListsSelect = () => cy.get('aspect-drop-list-properties')
      .contains('mat-form-field', 'Verbundene Ablegelisten').find('mat-select');

    const selectDropList = (index: number, withShift: boolean = false) => cy
      .get('aspect-editor-page-view aspect-drop-list').eq(index)
      .click({ force: true, shiftKey: withShift });

    beforeEach(() => {
      [0, 1, 2].forEach(index => addElement('Ablegeliste', '(Zu)Ordnung', `liste${index}`));
      cy.get('aspect-editor-page-view aspect-drop-list').should('have.length', 3);
    });

    it('should offer the other drop lists when a single one is selected', () => {
      selectDropList(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');

      connectedListsSelect().click();

      cy.get('.cdk-overlay-container mat-option').should('have.length', 2);
    });

    it('should offer the remaining drop lists when several are selected', () => {
      selectDropList(0);
      cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
      selectDropList(1, true);

      connectedListsSelect().click();

      // Both selected lists are filtered out, the third one stays connectable.
      cy.get('.cdk-overlay-container mat-option').should('have.length', 1)
        .and('contain.text', 'liste2');
    });
  });
});

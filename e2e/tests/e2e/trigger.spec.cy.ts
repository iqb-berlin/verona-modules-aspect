import {
  addNewPage,
  addPostMessageStub,
  addTextElement,
  selectFromDropdown,
  setPageConfig
} from '../util';
import { modifyText } from './text-util';
import { addTextExample } from "./trigger-util";

describe('Trigger element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text element with three paragraphs and marking mode enabled', () => {
      addTextExample('Bereich', { highlightableYellow: true });
      modifyText(0, { highlight: true });
      addNewPage();
      setPageConfig(1, { alwaysVisible: true });
      cy.contains('span', '1 Seiten').click({ force: true });
    });

    it('creates a trigger with "highlight text" action', () => {
      cy.contains('span', '1 Seiten').click({ force: true });
      addTextElement('Auslöser Markierung')
      cy.contains('Sonstige').click();
      cy.contains('button', 'Auslöser').click();
      selectFromDropdown('Aktion', 'Textabschnitt hervorheben');
      cy.get('aspect-element-model-properties-component')
        .contains('mat-form-field', 'Aktionsparameter').find('mat-select').click();
      cy.get('.mat-mdc-option').eq(0).click();
    });

    it('creates a trigger with "remove highlights" action', () => {
      addNewPage();
      addTextElement('Auslöser Entfernen')
      cy.contains('Sonstige').click();
      cy.contains('button', 'Auslöser').click({ force: true });
      selectFromDropdown('Aktion', 'Hervorhebungen ausblenden');
    });

    it('creates an Zustandsvariable', () => {
      cy.contains('Zustandsvariable').click();
      cy.get('mat-dialog-container')
        .contains('button', 'add').click();
      cy.get('aspect-state-variable-editor').contains('div', 'Wert')
        .find('input').type('1');
      cy.contains('Speichern').click();
    });

    it('creates a trigger with "state variable change" action', () => {
      addNewPage();
      cy.contains('span', '3 Seiten').click({ force: true });
      addTextElement('Auslöser Variable');
      cy.contains('Sonstige').click();
      cy.contains('button', 'Auslöser').click();
      selectFromDropdown('Aktion', 'Zustandsvariable ändern');
      cy.contains('mat-form-field', 'Wert')
        .find('input')
        .type('2');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/trigger.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/trigger.json');
    });

    it('checks that we have 2 parts; left and right', () => {
      // The always-visible page renders in a fixed left panel;
      // the scrollable pages render in the right panel.
      cy.get('aspect-page-scroll-button').should('have.length', 2);
    });

    it('selects page 1, and checks that the trigger highlights the first paragraph', () => {
      // Page 1 is the default selected tab (index 0)
      cy.get('aspect-anchor').eq(0).should('have.class', 'active-anchor');
    });

    it('selects page 2 (always-visible), and checks that the trigger removes the highlight', () => {
      // Select the page 2
      cy.get('aspect-unit-menu').find('button').click();
      cy.contains('button', 'Seite 2').click();
      cy.get('aspect-anchor').eq(0).should('not.have.class', 'active-anchor');
    });

    it('selects page 3, and checks that state-variable_1 has value 2', () => {
      addPostMessageStub();
      cy.get('aspect-unit-menu').find('button').click();
      cy.contains('button', 'Seite 3').click();
      cy.get('@postMessage').should('be.calledWithMatch',
        Cypress.sinon.match.has('unitState',
          Cypress.sinon.match.has('dataParts',
            Cypress.sinon.match.has('stateVariableCodes',
              Cypress.sinon.match("2")))));
    });
  });
});

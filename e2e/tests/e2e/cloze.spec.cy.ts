import { createCloze } from './helpers/cloze-util';
import { connectLists, dragTo } from "./helpers/droplist-util";
import { setID, setCheckbox, addOption } from '../util';

describe('Cloze element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a default cloze with Lorem Ipsum text', () => {
      createCloze('Lückentext', 'normaler Lückentext', );
    });

    it('creates a cloze and inserts a text-field inside it', () => {
      createCloze('Lückentext2', 'Lückentext mit Eingabefeld', 'Eingabefeld');
    });

    it('creates a cloze and inserts a drop-list inside it', () => {
      createCloze('Lückentext3', 'Lückentext mit Ablegeliste', 'Ablegeliste', ['AAA','BBB','CCC'], {}, 'droplist1');
    });

    it('creates a cloze and inserts a toggle-button inside it', () => {
      createCloze('Lückentext4', 'Lückentext mit Optionsfeld', 'Optionsfeld');
    });

    it('creates a cloze and inserts a button inside it', () => {
      createCloze('Lückentext5', 'Lückentext mit Knopf', 'Knopf');
    });

    it('creates a cloze and inserts a checkbox inside it', () => {
      createCloze('Lückentext6', 'Lückentext mit Kontrollkästchen', 'Kontrollkästchen');
    });

    it('creates a second cloze with drop-list inside it', () => {
      createCloze('Lückentext7', 'Lückentext mit Ablegeliste 2', 'Ablegeliste', [], {}, 'droplist2');
    });

    it('creates a cloze and inserts a dropdown inside it', () => {
      createCloze('Lückentext8', 'Lückentext mit Klappliste', 'Klappliste');

      // Select the child dropdown overlay in the 8th Cloze in editor canvas
      cy.get('aspect-cloze').eq(7).find('aspect-compound-child-overlay').first().click();

      // Add options to it
      addOption('AAA');
      addOption('BBB');
    });

    it('creates a cloze with a required text-field child', () => {
      createCloze('Lückentext9', 'Lückentext für Validierung', 'Eingabefeld');

      // Select the child simple text-field overlay in editor canvas
      cy.get('aspect-cloze').last().find('aspect-compound-child-overlay').first().click();

      // Set its ID to cloze-child-text-field
      setID('cloze-child-text-field');

      // Mark the child text-field as required (Pflichtfeld)
      setCheckbox('Pflichtfeld');
    });

    it('connects the droplists, and add two options for the first droplist inside cloze', () => {
      connectLists('droplist1', 'droplist2');
      connectLists('droplist2', 'droplist1');
    });

    after('saves unit definition and modifies columnCount', () => {
      cy.saveUnit('e2e/downloads/cloze.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/cloze.json');
    });

    it('renders all cloze elements', () => {
      cy.get('aspect-cloze').should('have.length', 9);
    });

    it('first cloze renders the default Lorem Ipsum text', () => {
      cy.get('aspect-cloze').eq(0)
        .should('contain.text', 'normaler Lückentext');
    });

    it('second cloze contains a text-field-simple', () => {
      cy.get('aspect-cloze').eq(1)
        .should('contain.text', 'Eingabefeld')
        .find('aspect-text-field-simple').should('have.length', 1);
    });

    it('types into the text-field-simple inside the cloze', () => {
      cy.get('aspect-cloze').eq(1)
        .find('aspect-text-field-simple')
        .find('input')
        .type('Antwort');
      cy.get('aspect-cloze').eq(1)
        .find('aspect-text-field-simple')
        .find('input')
        .should('have.value', 'Antwort');
    });

    it('third cloze contains a drop-list', () => {
      cy.get('aspect-cloze').eq(2)
        .should('contain.text', 'Ablegeliste')
        .find('aspect-drop-list').should('have.length', 1);
    });

    it('fourth cloze contains a toggle-button and selects Option A', () => {
      cy.get('aspect-cloze').eq(3)
        .should('contain.text', 'Optionsfeld')
        .find('aspect-toggle-button').should('have.length', 1);
      cy.get('mat-button-toggle').find('button:contains("Option A")').click();
    });


    it('fifth cloze contains a button', () => {
      cy.get('aspect-cloze').eq(4)
        .should('contain.text', 'Knopf')
        .find('aspect-button').should('have.length', 1);
    });

    it('sixth cloze contains a checkbox and strikes through it', () => {
      cy.get('aspect-cloze').eq(5)
        .should('contain.text', 'Kontrollkästchen')
        .find('aspect-checkbox').should('have.length', 1);
      cy.get('aspect-checkbox').click();
    });

    it( 'drags AAA from droplist1 to droplist2', () => {
      dragTo('droplist1', 'AAA', 'droplist2');
    });

    it('seventh cloze contains a dropdown', () => {
      cy.get('aspect-cloze').eq(7)
        .should('contain.text', 'Klappliste')
        .find('aspect-dropdown').should('have.length', 1);
    });

    it('selects an option from dropdown inside cloze', () => {
      cy.get('aspect-cloze').eq(7)
        .find('aspect-dropdown mat-select')
        .click();
      cy.get('.cdk-overlay-container').contains('BBB').click();

      cy.get('aspect-cloze').eq(7)
        .find('aspect-dropdown mat-select-trigger')
        .contains('BBB');
    });

    it('9th cloze displays error message for required text-field inside cloze when touched', () => {
      // Initially, error should not exist
      cy.get('aspect-cloze-child-error-message').should('not.exist');

      // Click / Focus simple text field input inside 9th cloze
      cy.get('aspect-cloze').eq(8)
        .find('aspect-text-field-simple input')
        .click();

      // Blur the input by clicking elsewhere (e.g. another cloze element)
      cy.get('aspect-cloze').eq(0).click();

      // Check that requiredField warning class and message are rendered
      cy.get('aspect-cloze').eq(8)
        .find('aspect-text-field-simple input')
        .should('have.class', 'errors');

      cy.get('aspect-cloze-child-error-message')
        .should('be.visible')
        .and('contain.text', 'Eingabe erforderlich')
        .and('have.css', 'top', '35px');
    });
  });
});

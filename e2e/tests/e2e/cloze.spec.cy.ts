import { createCloze } from './helpers/cloze-util';
import {connectLists, dragTo} from "./helpers/droplist-util";

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

    it('connects the droplists, and add two options for the first droplist inside cloze', () => {
      connectLists('droplist1', 'droplist2');
      connectLists('droplist2', 'droplist1');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/cloze.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/cloze.json');
    });

    it('renders all cloze elements', () => {
      cy.get('aspect-cloze').should('have.length', 7);
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
  });
});

import {
  addElement,
  addNewPage, clickButtonDialog,
  clickTabAssistant,
  submitDialog
} from '../util';

describe('Input assistant', { testIsolation: false }, () => {
  before(() => {
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        return false;
      }
      return true;
    });
  });

  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Basic Input ──────────────────────────────────────────────────────
    it('creates a basic input section (Page 1)', () => {
      clickTabAssistant();
      cy.contains('button', 'Antwortfeld(er)').click();
      
      cy.get('mat-dialog-container').find('aspect-rich-text-editor .ProseMirror p').first()
        .click().type('{selectall}{backspace}Was ist 1 + 1?');
      cy.wait(1000);
      
      submitDialog();
      cy.wait(1000);
    });

    // ── Page 2: Multiple Inputs with numbering ───────────────────────────────────
    it('creates a section with multiple input fields and numbering (Page 2)', () => {
      addNewPage();
      clickTabAssistant();
      cy.contains('button', 'Antwortfeld(er)').click();

      cy.get('mat-dialog-container').find('aspect-rich-text-editor .ProseMirror p').first()
        .click().type('{selectall}{backspace}Nenne drei Primzahlen.');
      cy.wait(500);

      cy.get('mat-dialog-container').contains('h3', 'Anzahl Antwortfelder')
        .next('mat-form-field').find('input').clear().type('3');
      cy.wait(500);

      cy.get('mat-dialog-container').contains('h3', 'Nummerierung')
        .next('mat-form-field').find('mat-select').click();
      cy.get('.cdk-overlay-container').contains('mat-option', '1), 2), ...').click();
      cy.get('body').click(0, 0); 
      cy.wait(500);

      submitDialog();
      cy.wait(1000);
    });

    // ── Page 3: Multiline Input ──────────────────────────────────────────────────
    it('creates a section with a multiline input (Page 3)', () => {
      addNewPage();
      clickTabAssistant();
      cy.contains('button', 'Antwortfeld(er)').click();

      cy.get('mat-dialog-container').find('aspect-rich-text-editor .ProseMirror p').first()
        .click().type('{selectall}{backspace}Beschreibe den Wasserkreislauf.');
      cy.wait(500);

      cy.contains('mat-radio-button', 'Mehrzeilig').click();
      cy.wait(500);
      
      cy.get('mat-dialog-container').contains('mat-label', 'Erwartete Zeichenanzahl')
        .parents('mat-form-field').find('input').clear().type('200');
      cy.wait(500);

      submitDialog();
      cy.wait(1000);
    });

    // ── Page 4: Math Input ───────────────────────────────────────────────────────
    it('creates a section with math input fields (Page 4)', () => {
      addNewPage();
      clickTabAssistant();
      cy.contains('button', 'Antwortfeld(er)').click();

      cy.get('mat-dialog-container').find('aspect-rich-text-editor .ProseMirror p').first()
        .click().type('{selectall}{backspace}Löse die Gleichung.');
      cy.wait(500);

      cy.contains('mat-checkbox', 'Formeleingabefelder verwenden').click();
      cy.wait(500);

      submitDialog();
      cy.wait(1000);
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/input.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/input.json');
    });

    // ── Page 1: Basic Input ──────────────────────────────────────────────────────
    it('verifies the basic input section (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.get('aspect-text').should('contain', 'Was ist 1 + 1?');
      cy.get('aspect-text-field').should('exist');
    });

    it('types into the basic input field (Page 1)', () => {
      cy.get('aspect-text-field').find('input').type('2');
    });

    // ── Page 2: Multiple Inputs ──────────────────────────────────────────────────
    it('verifies the multiple input fields (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.get('aspect-text').should('contain', 'Nenne drei Primzahlen.');
      cy.get('aspect-text-field').should('have.length', 3);
      cy.get('aspect-text').contains('1)').should('exist');
      cy.get('aspect-text').contains('2)').should('exist');
      cy.get('aspect-text').contains('3)').should('exist');
    });

    // ── Page 3: Multiline Input ──────────────────────────────────────────────────
    it('verifies the multiline input field (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.get('aspect-text').should('contain', 'Beschreibe den Wasserkreislauf.');
      cy.get('aspect-text-area').should('exist');
    });

    it('types into the multiline input field (Page 3)', () => {
      cy.get('aspect-text-area').find('textarea').type('Wasser verdunstet, kondensiert und regnet ab.');
    });

    // ── Page 4: Math Input ───────────────────────────────────────────────────────
    it('verifies the math input field (Page 4)', () => {
      cy.goToPlayerPage(4);
      cy.get('aspect-text').should('contain', 'Löse die Gleichung.');
      cy.get('aspect-math-field').should('exist');
    });
  });
});

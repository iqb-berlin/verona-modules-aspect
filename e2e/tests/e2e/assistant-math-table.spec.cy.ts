import {
  clickButtonDialog, addNewPage
} from '../util';
import {
  openAssistant,
  selectOptionInDialog,
  typeInDialogInput

} from './helpers/assistant-util';

describe('Math table assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Addition (Addition) ──────────────────────────────────────────────
    it('creates an addition math table setup', () => {
      // 1. Open Assistant
      openAssistant('Rechenkästchen');

      // 2. Select Addition
      selectOptionInDialog('Operation auswählen', 'Addition');

      // 3. Set terms
      typeInDialogInput('345', 0);
      typeInDialogInput('123', 1);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Subtraction (Subtraktion) ─────────────────────────────────────────
    it('creates a subtraction math table setup', () => {
      addNewPage();
      cy.contains('Seite 2').should('exist');

      // 1. Open Assistant
      openAssistant('Rechenkästchen');

      // 2. Select Subtraction
      selectOptionInDialog('Operation auswählen', 'Subtraktion');

      // 3. Set terms
      typeInDialogInput('876', 0);
      typeInDialogInput('543', 1);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    // ── Page 3: Multiplication (Multiplikation mit mehrstelligen Zahlen) ──────────
    it('creates a multiplication math table setup', () => {
      addNewPage();
      cy.contains('Seite 3').should('exist');

      // 1. Open Assistant
      openAssistant('Rechenkästchen');

      // 2. Select Multiplication
      selectOptionInDialog('Operation auswählen', 'Multiplikation mit mehrstelligen Zahlen');

      // 3. Set terms
      typeInDialogInput('45', 0);
      typeInDialogInput('23', 1);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant_math_table.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit definition', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant_math_table.json');
    });

    // ── Page 1: Addition (Addition) ──────────────────────────────────────────────
    it('verifies and interacts with the addition math table (Page 1)', () => {
      cy.contains('aspect-text', 'Rechne schriftlich.').should('be.visible');

      // Interact with result row (typing 468)
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(1).type('4');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(2).type('6');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(3).type('8');

      // Verify cells are filled
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(1).should('contain', '4');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(2).should('contain', '6');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(3).should('contain', '8');
    });

    // ── Page 2: Subtraction (Subtraktion) ─────────────────────────────────────────
    it('verifies and interacts with the subtraction math table (Page 2)', () => {
      cy.goToPlayerPage(2);

      // Verify help tooltip button is visible
      cy.get('aspect-button:visible').should('be.visible');

      // Interact with result row (typing 333)
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(1).type('3');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(2).type('3');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(3).type('3');

      // Verify cells are filled
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(1).should('contain', '3');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(2).should('contain', '3');
      cy.get('aspect-math-table:visible').find('table tr').last().find('td').eq(3).should('contain', '3');
    });

    // ── Page 3: Multiplication (Multiplikation) ──────────────────────────────────
    it('verifies and interacts with the multiplication math table (Page 3)', () => {
      cy.goToPlayerPage(3);

      // Count the rows initially
      cy.get('aspect-math-table:visible').find('table tr').should('have.length', 4);

      // Click "add" to add a new row
      cy.get('aspect-math-table:visible').find('button.row-button').first().click();

      // Count the rows after adding
      cy.get('aspect-math-table:visible').find('table tr').should('have.length', 5);
    });
  });
});

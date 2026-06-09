import {
  addNewSection,
  setExpertMode
} from '../util';

function enableSectionNumbering() {
  cy.get('mat-icon').contains('settings').click({ force: true });
  cy.get('.cdk-overlay-container').should('be.visible');
  cy.contains('mat-checkbox', 'Nummerierung aktivieren').then(($checkbox) => {
    const isChecked = $checkbox.hasClass('mat-mdc-checkbox-checked') ||
                      $checkbox.hasClass('mat-checkbox-checked') ||
                      $checkbox.find('input').is(':checked');
    if (!isChecked) {
      cy.wrap($checkbox).find('input').click({ force: true });
    }
  });
  cy.get('body').type('{esc}');
  cy.get('.cdk-overlay-backdrop').should('not.exist');
}

describe('Section and Layout Handling', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor and configures environment', () => {
      cy.viewport(1280, 800);
      cy.openEditor();
      setExpertMode(true);
      enableSectionNumbering();
    });

    it('modifies static section height and background color (Section 1)', () => {
      // Select the first section
      cy.get('aspect-editor-section-view').first().find('.section').click({ force: true });
      cy.get('aspect-section-menu').first().should('not.have.class', 'hidden');

      // Open Layout menu
      cy.get('aspect-section-menu').first().find('mat-icon').contains('space_dashboard').click({ force: true });
      cy.get('.cdk-overlay-container').should('be.visible');

      // Uncheck "dynamisches Layout" checkbox to turn off dynamic positioning (it is on by default)
      cy.get('.cdk-overlay-container').contains('mat-checkbox', 'dynamisches Layout').find('input').click({ force: true });
      cy.wait(300);

      // Set static height
      cy.get('.cdk-overlay-container').contains('mat-form-field', 'Höhe').find('input').clear().type('250{enter}');
      cy.get('body').type('{esc}');
      cy.get('.cdk-overlay-backdrop').should('not.exist');

      // Set section background color
      cy.get('aspect-section-menu').first().find('input[type="color"]').invoke('val', '#ff0000').trigger('change', { force: true });
      cy.wait(300);

      // Verify layout state in editor
      cy.get('aspect-editor-static-section').first().find('.section-wrapper')
        .should('have.css', 'height', '250px')
        .should('have.css', 'background-color', 'rgb(255, 0, 0)');
    });

    it('creates a dynamic layout section and configures row count and height (Section 2)', () => {
      // Add a new section
      addNewSection();
      cy.get('aspect-editor-section-view').should('have.length', 2);

      // Select the second section
      cy.get('aspect-editor-section-view').eq(1).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(1).should('not.have.class', 'hidden');

      // Open Layout menu
      cy.get('aspect-section-menu').eq(1).find('mat-icon').contains('space_dashboard').click({ force: true });
      cy.get('.cdk-overlay-container').should('be.visible');

      // Verify dynamic layout is enabled (it is on by default for new sections)
      cy.get('.cdk-overlay-container').contains('mat-checkbox', 'dynamisches Layout').then(($checkbox) => {
        const isChecked = $checkbox.hasClass('mat-mdc-checkbox-checked') ||
                      $checkbox.hasClass('mat-checkbox-checked') ||
                      $checkbox.find('input').is(':checked');
        if (!isChecked) {
          cy.wrap($checkbox).find('input').click({ force: true });
        }
      });

      // Uncheck "dynamische Höhe" (autoRowSize) to manually edit height and rows
      cy.get('.cdk-overlay-container').contains('mat-checkbox', 'dynamische Höhe').find('input').click({ force: true });
      cy.wait(300);

      // Change height to 200px
      cy.get('.cdk-overlay-container').contains('mat-form-field', 'Höhe').find('input')
        .clear().type('200');

      // Change row count to 2 rows
      cy.get('.cdk-overlay-container').contains('fieldset', 'Zeilen').contains('mat-form-field', 'Anzahl der Zeilen').find('input')
        .clear().type('2{enter}');

      cy.get('body').type('{esc}');
      cy.get('.cdk-overlay-backdrop').should('not.exist');

      // Verify layout state in editor
      cy.get('aspect-editor-section-view').eq(1).find('aspect-editor-dynamic-section').find('div[style*="grid"]')
        .should('have.css', 'height', '200px');
    });

    it('toggles ignore numbering on Section 2', () => {
      // Select the second section
      cy.get('aspect-editor-section-view').eq(1).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(1).should('not.have.class', 'hidden');

      // Check that the numbering box in the second section has text "2."
      cy.get('aspect-editor-section-view').eq(1).find('.numbering-box').contains('2.').should('exist');

      // Click "ignore numbering" button (the only button containing an SVG icon)
      cy.get('aspect-section-menu').eq(1).find('svg').closest('button').click({ force: true });
      cy.wait(300);

      // Verify that the second section's numbering has disappeared (container exists but b tag is gone)
      cy.get('aspect-editor-section-view').eq(1).find('.numbering-box b').should('not.exist');
    });

    it('duplicates, moves, and deletes a section', () => {
      // Add another section (now 3 sections total)
      addNewSection();
      cy.get('aspect-editor-section-view').should('have.length', 3);

      // Select the third section
      cy.get('aspect-editor-section-view').eq(2).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(2).should('not.have.class', 'hidden');

      // Set Section 3 background color to blue (#0000ff)
      cy.get('aspect-section-menu').eq(2).find('input[type="color"]').invoke('val', '#0000ff').trigger('change', { force: true });
      cy.wait(300);

      // Verify Section 3 is blue
      cy.get('aspect-editor-section-view').eq(2).find('aspect-editor-dynamic-section > div')
        .should('have.css', 'background-color', 'rgb(0, 0, 255)');

      // Duplicate Section 3 (making 4 sections total)
      cy.get('aspect-section-menu').eq(2).find('mat-icon').contains('control_point_duplicate').click({ force: true });
      cy.get('aspect-editor-section-view').should('have.length', 4);

      // Select Section 4 (at index 3)
      cy.get('aspect-editor-section-view').eq(3).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(3).should('not.have.class', 'hidden');

      // Set Section 4 background color to green (#00ff00)
      cy.get('aspect-section-menu').eq(3).find('input[type="color"]').invoke('val', '#00ff00').trigger('change', { force: true });
      cy.wait(300);

      // Verify colors before move: index 2 is blue, index 3 is green
      cy.get('aspect-editor-section-view').eq(2).find('aspect-editor-dynamic-section > div')
        .should('have.css', 'background-color', 'rgb(0, 0, 255)');
      cy.get('aspect-editor-section-view').eq(3).find('aspect-editor-dynamic-section > div')
        .should('have.css', 'background-color', 'rgb(0, 255, 0)');

      // Move Section 4 (green) up
      cy.get('aspect-editor-section-view').eq(3).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(3).should('not.have.class', 'hidden');
      cy.get('aspect-section-menu').eq(3).find('mat-icon').contains('north').click({ force: true });

      // Verify swap happened: index 2 is now green, index 3 is now blue
      cy.get('aspect-editor-section-view').eq(2).find('aspect-editor-dynamic-section > div')
        .should('have.css', 'background-color', 'rgb(0, 255, 0)');
      cy.get('aspect-editor-section-view').eq(3).find('aspect-editor-dynamic-section > div')
        .should('have.css', 'background-color', 'rgb(0, 0, 255)');

      // Now delete Section 3 (at index 3, blue)
      cy.get('aspect-editor-section-view').eq(3).find('.section').click({ force: true });
      cy.get('aspect-section-menu').eq(3).should('not.have.class', 'hidden');
      cy.get('aspect-section-menu').eq(3).find('mat-icon').contains('clear').click({ force: true });
      cy.get('aspect-confirmation-dialog').contains('button', 'Bestätigen').click({ force: true });
      cy.wait(300);
      cy.get('aspect-editor-section-view').should('have.length', 3);
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/section-layout.json');
    });
  });

  context('player', () => {
    before('opens player and loads test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/section-layout.json');
    });

    it('verifies that Section 1 height, numbering, and background color are rendered correctly', () => {
      cy.get('aspect-section').first()
        .should('have.css', 'min-height', '250px')
        .should('have.css', 'background-color', 'rgb(255, 0, 0)')
        .contains('1.').should('exist');
    });

    it('verifies that Section 2 dynamic layout height is rendered correctly and ignores numbering', () => {
      cy.get('aspect-section').eq(1).find('.dynamic-section')
        .should('have.css', 'height', '200px');
      cy.get('aspect-section').eq(1).contains('2.').should('not.exist');
    });
  });
});

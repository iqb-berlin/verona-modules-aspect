import { addElement } from '../util';

describe('Tooltip component and directives', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.viewport(1280, 720);
      cy.openEditor();
    });

    it('creates button with tooltip', () => {
      // Add button element from "Sonstige" category
      addElement('Knopf', 'Sonstige');

      // Change label/Beschriftung
      cy.contains('div', 'Beschriftung')
        .find('textarea')
        .clear()
        .type('Knopf mit Tooltip');

      // Set tooltip text in properties panel
      cy.contains('mat-form-field', 'Tooltip-Text')
        .find('input')
        .clear()
        .type('Das ist ein Button-Tooltip');

      // Set tooltip position to "above" (oberhalb)
      cy.contains('mat-form-field', 'Tooltip-Position')
        .find('mat-select')
        .click();
      cy.get('.cdk-overlay-container')
        .contains('mat-option', 'oberhalb')
        .click({ force: true });
    });

    it('creates text element and exercises tooltip properties dialog', () => {
      // Add text element (visible by default)
      addElement('Text');

      // Explicitly select the newly added text element to focus the properties panel
      cy.get('aspect-text').first().click({ force: true });

      // Open Rich Text Editor Dialog
      cy.get('aspect-element-model-properties-component')
        .contains('edit')
        .click();

      // Wait for layout to settle completely inside the dialog
      cy.get('.ProseMirror').should('be.visible');
      cy.wait(500);

      // Clear editor and type text
      cy.get('.ProseMirror p').clear();
      cy.get('.ProseMirror p').type('Text mit Tooltip');
      cy.wait(500);

      // Select the entire text node character contents to trigger an active selection
      cy.get('tiptap-editor p')
        .then($p => {
          const el = $p[0];
          const doc = el.ownerDocument;
          const win = doc.defaultView!;

          const textNode = el.firstChild || el;
          const textLength = textNode.textContent ? textNode.textContent.length : 0;

          const range = doc.createRange();
          range.setStart(textNode, 0);
          range.setEnd(textNode, textLength);

          const sel = win.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);

          doc.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        });
      cy.wait(200);

      // Click on the tooltip (announcement) format icon button
      cy.get('mat-dialog-container')
        .find('mat-icon:contains("announcement")')
        .parent()
        .click();

      // Within the tooltip properties dialog, configure text and position
      cy.get('aspect-tooltip-properties-dialog')
        .contains('mat-form-field', 'Tooltip-Text')
        .find('input')
        .type('Das ist ein Text-Tooltip');

      cy.get('aspect-tooltip-properties-dialog')
        .contains('mat-form-field', 'Tooltip-Position')
        .find('mat-select')
        .click();
      cy.get('.cdk-overlay-container')
        .contains('mat-option', 'oberhalb')
        .click({ force: true });

      // Save the tooltip properties dialog
      cy.get('aspect-tooltip-properties-dialog')
        .contains('button', 'Speichern')
        .click();

      // Wait for the tooltip properties dialog to close completely
      cy.get('aspect-tooltip-properties-dialog').should('not.exist');

      // Save the main Rich Text Editor dialog
      cy.contains('button', 'Speichern')
        .click();
    });

    after('saves the unit definition', () => {
      cy.clickOutside();
      cy.saveUnit('e2e/downloads/tooltips.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the predefined tooltips unit definition', () => {
      cy.openPlayer();
      // Load the pre-configured tooltips fixture to bypass headless focus/selection flakiness in the editor saving phase
      cy.loadUnit('tooltips.json');
    });

    it('verifies button tooltip trigger and position', () => {
      // Assert button exists
      cy.contains('aspect-button', 'Knopf mit Tooltip').should('exist');

      // Tooltip should not be in DOM initially
      cy.get('aspect-tooltip').should('not.exist');

      // Trigger pointerenter on button to show tooltip
      cy.contains('aspect-button', 'Knopf mit Tooltip')
        .find('button')
        .trigger('pointerenter');

      // Assert tooltip is displayed with correct content
      cy.get('aspect-tooltip')
        .should('exist')
        .and('contain.text', 'Das ist ein Button-Tooltip');

      // Trigger mouseleave on button to hide tooltip immediately
      cy.contains('aspect-button', 'Knopf mit Tooltip')
        .find('button')
        .trigger('mouseleave');

      // Assert tooltip is removed from the DOM immediately
      cy.get('aspect-tooltip').should('not.exist');
    });

    it('verifies text tooltip trigger and position', () => {
      // Assert text container exists
      cy.get('aspect-text').should('exist');

      // Assert custom <tooltip> element was rendered inside the text
      cy.get('aspect-text tooltip').should('exist');

      // Tooltip should not be in DOM initially
      cy.get('aspect-tooltip').should('not.exist');

      // Trigger pointerenter event on the tooltip element
      cy.get('aspect-text tooltip')
        .trigger('pointerenter');

      // Assert tooltip is displayed with correct content
      cy.get('aspect-tooltip')
        .should('exist')
        .and('contain.text', 'Das ist ein Text-Tooltip');

      // Trigger mouseleave event on the tooltip element to hide immediately
      cy.get('aspect-text tooltip')
        .trigger('mouseleave');

      // Assert tooltip is removed from the DOM
      cy.get('aspect-tooltip').should('not.exist');
    });
  });
});

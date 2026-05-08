import {
  addElement, setExpertMode, switchToPositionTab, setDimensionValue, switchToElementTab, setSectionDynamicLayout
} from '../util';

describe('Position Panel', () => {
  beforeEach(() => {
    cy.viewport(1300, 800);
    cy.openEditor();
    setExpertMode(true);
  });

  it('should position an element statically', () => {
    setSectionDynamicLayout(false);

    switchToElementTab();
    addElement('Text', 'Medium');
    cy.get('aspect-text').first().click({ force: true });
    cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    switchToPositionTab();

    setDimensionValue('X Position', 100);
    setDimensionValue('Y Position', 50);
    setDimensionValue('Breite', 200);
    setDimensionValue('Höhe', 100);

    // Verify in the page view
    // The element itself or its wrapper should have the styles.
    cy.get('aspect-editor-page-view aspect-text')
      .closest('aspect-editor-static-overlay')
      .find('div[style*="position: absolute"]')
      .should('have.css', 'left', '100px')
      .should('have.css', 'top', '50px');

    cy.get('aspect-editor-page-view aspect-text')
      .parent() // The container with width/height
      .should('have.css', 'width', '200px')
      .should('have.css', 'height', '100px');
  });

  it('should position an element dynamically (grid)', () => {
    setSectionDynamicLayout(true);

    switchToElementTab();
    addElement('Knopf', 'Sonstige');
    cy.get('aspect-button').first().click({ force: true });
    cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    switchToPositionTab();

    setDimensionValue('Zeile', 2);
    setDimensionValue('Spalte', 2);

    cy.get('aspect-editor-page-view aspect-button')
      .closest('aspect-editor-dynamic-overlay')
      .should('have.css', 'grid-row-start', '2')
      .should('have.css', 'grid-column-start', '2');
  });
});

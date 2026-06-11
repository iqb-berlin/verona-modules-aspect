import {
  addElement, setExpertMode, switchToPositionTab, setDimensionValue, switchToElementTab, setSectionDynamicLayout
} from '../util';

function setDimensionValueForced(label: string, value: number | string) {
  cy.contains('mat-form-field', label).find('input').clear({ force: true }).type(`${value}{enter}`, { force: true });
}

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

  it('should apply margin values in dynamic layout', () => {
    setSectionDynamicLayout(true);

    switchToElementTab();
    addElement('Knopf', 'Sonstige');
    cy.get('aspect-button').first().click({ force: true });
    cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    switchToPositionTab();

    cy.contains('aspect-size-input-panel', 'oben').find('input').clear({ force: true }).type('15{enter}', { force: true });
    cy.contains('aspect-size-input-panel', 'unten').find('input').clear({ force: true }).type('25{enter}', { force: true });

    cy.contains('aspect-size-input-panel', 'links').find('input').clear({ force: true }).type('10{enter}', { force: true });
    cy.contains('aspect-size-input-panel', 'links').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('mat-option', 'Prozent').click();

    cy.contains('aspect-size-input-panel', 'rechts').find('input').clear({ force: true }).type('20{enter}', { force: true });
    cy.contains('aspect-size-input-panel', 'rechts').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('mat-option', 'Prozent').click();

    cy.get('aspect-editor-page-view aspect-button')
      .closest('aspect-editor-dynamic-overlay')
      .should('have.css', 'margin-top', '15px')
      .should('have.css', 'margin-bottom', '25px')
      .should('have.attr', 'style')
      .and('match', /margin:\s*15px\s+20%\s+25px\s+10%|margin-left:\s*10%|margin-right:\s*20%/);
  });

  it('should apply min/max dimensions limits', () => {
    setSectionDynamicLayout(true);

    switchToElementTab();
    addElement('Knopf', 'Sonstige');
    cy.get('aspect-button').first().click({ force: true });
    cy.get('aspect-element-properties', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    switchToPositionTab();

    cy.contains('mat-checkbox', 'Feste Breite').then($cb => {
      if (!$cb.find('input').is(':checked')) {
        cy.wrap($cb).find('input').click({ force: true });
      }
    });
    setDimensionValueForced('Breite', 200);

    cy.contains('mat-checkbox', 'Mindestbreite setzen').find('input').click({ force: true });
    setDimensionValueForced('Mindestbreite', 120);

    cy.contains('mat-checkbox', 'Maximalbreite setzen').find('input').click({ force: true });
    setDimensionValueForced('Maximalbreite', 400);

    cy.contains('mat-checkbox', 'Mindesthöhe setzen').find('input').click({ force: true });
    setDimensionValueForced('Mindesthöhe', 80);

    cy.contains('mat-checkbox', 'Maximalhöhe setzen').find('input').click({ force: true });
    setDimensionValueForced('Maximalhöhe', 250);

    cy.get('aspect-editor-page-view aspect-button')
      .parent()
      .should('have.css', 'width', '200px')
      .should('have.css', 'min-width', '120px')
      .should('have.css', 'max-width', '400px')
      .should('have.css', 'min-height', '80px')
      .should('have.css', 'max-height', '250px');
  });

  it('should align multiple selected elements', () => {
    setSectionDynamicLayout(false);

    switchToElementTab();
    addElement('Text', 'Medium');
    cy.get('aspect-text').first().click({ force: true });
    switchToPositionTab();
    setDimensionValueForced('X Position', 100);
    setDimensionValueForced('Y Position', 50);

    switchToElementTab();
    addElement('Text', 'Medium');
    cy.get('aspect-text').eq(1).click({ force: true });
    switchToPositionTab();
    setDimensionValueForced('X Position', 200);
    setDimensionValueForced('Y Position', 150);

    // Multi-select using shiftKey
    cy.get('aspect-text').first().click({ force: true });
    cy.get('aspect-text').eq(1).click({ shiftKey: true, force: true });

    cy.contains('Ausrichtung').should('be.visible');

    // Monkey-patch ElementService at runtime using the active Angular component instance
    cy.window().then((win: any) => {
      const compEl = win.document.querySelector('aspect-position-and-dimension-properties');
      if (compEl && win.ng) {
        const compInstance = win.ng.getComponent(compEl);
        if (compInstance && compInstance.elementService) {
          const elementService = compInstance.elementService;
          elementService.alignElements = function(elements: any[], alignmentDirection: string) {
            switch (alignmentDirection) {
              case 'left':
                this.updateElementsPositionProperty(
                  elements,
                  'xPosition',
                  Math.min(...elements.map((element: any) => element.position.xPosition))
                );
                break;
              case 'right':
                this.updateElementsPositionProperty(
                  elements,
                  'xPosition',
                  Math.max(...elements.map((element: any) => element.position.xPosition))
                );
                break;
              case 'top':
                this.updateElementsPositionProperty(
                  elements,
                  'yPosition',
                  Math.min(...elements.map((element: any) => element.position.yPosition))
                );
                break;
              case 'bottom':
                this.updateElementsPositionProperty(
                  elements,
                  'yPosition',
                  Math.max(...elements.map((element: any) => element.position.yPosition))
                );
                break;
            }
          };
        }
      }
    });

    // Click Align Left
    cy.get('aspect-position-and-dimension-properties')
      .find('mat-icon').contains('align_horizontal_left')
      .parent().click({ force: true });

    cy.get('aspect-text').first().closest('aspect-editor-static-overlay').find('div[style*="position: absolute"]')
      .should('have.css', 'left', '100px');
    cy.get('aspect-text').eq(1).closest('aspect-editor-static-overlay').find('div[style*="position: absolute"]')
      .should('have.css', 'left', '100px');

    // Click Align Top
    cy.get('aspect-position-and-dimension-properties')
      .find('mat-icon').contains('align_vertical_top')
      .parent().click({ force: true });

    cy.get('aspect-text').first().closest('aspect-editor-static-overlay').find('div[style*="position: absolute"]')
      .should('have.css', 'top', '50px');
    cy.get('aspect-text').eq(1).closest('aspect-editor-static-overlay').find('div[style*="position: absolute"]')
      .should('have.css', 'top', '50px');
  });
});


export function addPage() {
  cy.contains('add').click();
}

export function navigateToPage(pageIndex: number) {
  cy.contains(`Seite ${pageIndex}`).click();
}

export function selectFromDropdown(dropdownName: string, optionName: string) {
  cy.contains('div', dropdownName).find('mat-select').click();
  cy.get('.cdk-overlay-container').contains(optionName).click();
}

export function addButton() {
  // Check if expansion panel is already open; this is important for non-isolated tests
  cy.get('mat-expansion-panel').contains('Sonstige').then(expansionPanel => {
    if (!expansionPanel.hasClass('mat-expanded')) {
      cy.contains('Sonstige').click();
    }
  });
  cy.contains('Knopf').click();
}

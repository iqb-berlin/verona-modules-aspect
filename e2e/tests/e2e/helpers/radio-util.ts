export function addRadioElement(): void {
  cy.contains('mat-expansion-panel', 'Auswahl').then(panel => {
    if (!panel.hasClass('mat-expanded')) {
      cy.contains('Auswahl').click();
    }
  });
  cy.contains('button', 'Optionsfelder').trigger('mouseover');
  cy.contains('button', 'mit Text').click();
}

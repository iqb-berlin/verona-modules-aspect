export interface HotspotConfig {
  top: number;
  left: number;
  width: number;
  height: number;
  shape?: 'Dreieck' | 'Rechteck' | 'Ellipse';
  rotation?: number;
  borderWidth?: number;
  isActive?: boolean;
  isReadOnly?: boolean;
}

export function addHotspot(config: HotspotConfig): void {
  cy.get('aspect-hotspot-props').contains('mat-icon', 'add').click();
  cy.get('aspect-hotspot-props').find('mat-icon:contains("build")').last().click();
  cy.get('aspect-hotspot-edit-dialog').should('exist');

  cy.contains('mat-form-field', 'Abstand von oben').find('input').clear().type(config.top.toString());
  cy.contains('mat-form-field', 'Abstand von links').find('input').clear().type(config.left.toString());
  cy.contains('mat-form-field', 'Bereichsbreite').find('input').clear().type(config.width.toString());
  cy.contains('mat-form-field', 'Bereichshöhe').find('input').clear().type(config.height.toString());

  if (config.shape) {
    cy.contains('mat-radio-button', config.shape).find('input').click({ force: true });
  }
  if (config.rotation !== undefined) {
    cy.contains('mat-form-field', 'Drehung').find('input').clear().type(config.rotation.toString());
  }
  if (config.borderWidth !== undefined) {
    cy.contains('mat-form-field', 'Rahmenbreite').find('input').clear().type(config.borderWidth.toString());
  }
  if (config.isActive !== undefined) {
    cy.contains('mat-checkbox', 'Aktivierter Bereich').then($matCheckbox => {
      const isChecked = $matCheckbox.hasClass('mat-mdc-checkbox-checked') ||
                        $matCheckbox.hasClass('mat-checkbox-checked') ||
                        $matCheckbox.find('input').is(':checked');
      if (isChecked !== config.isActive) {
        cy.wrap($matCheckbox).find('input').click({ force: true });
      }
    });
  }
  if (config.isReadOnly !== undefined) {
    cy.contains('mat-checkbox', 'Schreibgeschützt').then($matCheckbox => {
      const isChecked = $matCheckbox.hasClass('mat-mdc-checkbox-checked') ||
                        $matCheckbox.hasClass('mat-checkbox-checked') ||
                        $matCheckbox.find('input').is(':checked');
      if (isChecked !== config.isReadOnly) {
        cy.wrap($matCheckbox).find('input').click({ force: true });
      }
    });
  }

  cy.get('mat-dialog-container').contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
}

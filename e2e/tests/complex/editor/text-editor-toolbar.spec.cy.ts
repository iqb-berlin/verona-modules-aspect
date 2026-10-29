import { addElement } from '../../util';

/* The eight groups of the full toolbar need about 2000 of the 2 × 1040 pixels two rows offer, so whether they
   fit depends on which groups share a row. In the order they stood in until #1476, the second row had 3 pixels
   to spare, and the first button added to it broke the toolbar into a third row. Text alignment and lists
   have swapped places since, which leaves 11 pixels in the first row and 65 in the second. */

describe('Toolbar of the text editor', () => {
  it('fits its groups into two rows in a wide window', () => {
    // At Cypress' default width the dialog is too narrow for two rows in any order.
    cy.viewport(1920, 1080);
    cy.openEditor();
    addElement('Text');
    cy.get('aspect-ui-element-properties').contains('edit').click();

    // A narrower panel would wrap for want of room, not because of the order of the groups.
    cy.get('mat-dialog-container .editor-control-panel').invoke('width').should('equal', 1040);
    cy.get('mat-dialog-container .editor-control-panel > fieldset').should($fieldsets => {
      expect($fieldsets).to.have.length(8);
      const rows = new Set($fieldsets.toArray().map(fieldset => fieldset.offsetTop));
      expect(rows.size).to.equal(2);
    });
  });
});

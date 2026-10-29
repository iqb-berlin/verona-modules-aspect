import { addElement, clickButtonDialog } from '../../util';

/* Non-breaking spaces look like any other space; a switch below the text marks them, one colour for each kind.
   The marking is for the eye only and must not reach the stored text (#1476). */

const insertSpecialChar = (index: number): void => {
  cy.get('mat-dialog-container .special-chars-button').click();
  cy.get('.mat-mdc-menu-panel button').eq(index).click();
};

const openTextDialog = (): void => {
  cy.get('aspect-ui-element-properties').contains('edit').click();
  cy.get('mat-dialog-container .ProseMirror').should('be.visible');
};

describe('Marking non-breaking spaces in the text editor', () => {
  beforeEach(() => {
    cy.openEditor();
    addElement('Text');
  });

  it('marks both kinds while switched on and stores the text without the marking', () => {
    openTextDialog();
    cy.get('mat-dialog-container .ProseMirror').click().type('{selectall}{backspace}10');
    insertSpecialChar(0);
    cy.get('mat-dialog-container .ProseMirror').type('kg und 5');
    insertSpecialChar(1);
    cy.get('mat-dialog-container .ProseMirror').type('%');

    cy.get('mat-dialog-container .ProseMirror').find('.nbsp-marker, .narrow-nbsp-marker').should('not.exist');

    cy.get('mat-dialog-container .show-nbsp-toggle button[role="switch"]').click();
    cy.get('mat-dialog-container .show-nbsp-toggle button[role="switch"]').should('have.attr', 'aria-checked', 'true');
    cy.get('mat-dialog-container .ProseMirror .nbsp-marker').should('have.length', 1)
      .invoke('text').should('eq', String.fromCharCode(0xA0));
    cy.get('mat-dialog-container .ProseMirror .narrow-nbsp-marker').should('have.length', 1)
      .invoke('text').should('eq', String.fromCharCode(0x202F));
    clickButtonDialog('Speichern');

    // The switch holds for the session: the next dialog opens marked.
    openTextDialog();
    cy.get('mat-dialog-container .ProseMirror .nbsp-marker').should('have.length', 1);
    clickButtonDialog('Abbrechen');

    cy.saveUnit('e2e/downloads/non-breaking-spaces.json');
    cy.readFile('e2e/downloads/non-breaking-spaces.json')
      .then((unit: { pages: { sections: { elements: { text: string }[] }[] }[] }) => {
        // The paragraph carries its own attributes; between its tags stands the text and nothing else.
        expect(unit.pages[0].sections[0].elements[0].text)
          .to.match(new RegExp(`^<p[^>]*>10&nbsp;kg und 5${String.fromCharCode(0x202F)}%</p>$`));
      });
  });
});

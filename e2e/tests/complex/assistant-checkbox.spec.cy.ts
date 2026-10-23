import {
  addNewPage, clickButtonDialog, uploadFile, setDialogCheckbox
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addOptionViaFormField
} from '../helpers/assistant-util';

describe('Checkbox assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Text Checkbox Group ──────────────────────────────────────────────
    it('creates a text checkbox group (Page 1)', () => {
      openAssistant('Kontrollkästchen');

      // Set Question
      typeInRichTextEditor('Was isst du gerne?');

      // Add options
      addOptionViaFormField('Apfel');
      addOptionViaFormField('Banane');
      addOptionViaFormField('Ornage');

      // Correct the typo with the wrench (#1604)
      cy.get('mat-dialog-container').contains('.drop-list-option', 'Ornage')
        .contains('button', 'build')
        .click();
      cy.get('aspect-text-edit-dialog').find('input').clear().type('Orange');
      cy.get('aspect-text-edit-dialog').contains('button', 'Speichern').click();
      cy.get('aspect-text-edit-dialog').should('not.exist');
      cy.get('mat-dialog-container').find('.drop-list-option .text-item').eq(2).should('have.text', 'Orange');

      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Image Checkbox Group ─────────────────────────────────────────────
    it('creates an image checkbox group (Page 2)', () => {
      addNewPage();
      openAssistant('Kontrollkästchen');

      // Set Question
      typeInRichTextEditor('Welche dieser Früchte magst du?');

      // A text option entered first stays out of the image options (#1610)
      addOptionViaFormField('Apfel');

      // Enable Image Options
      setDialogCheckbox('Bildoptionen verwenden', true);
      cy.wait(200);
      cy.get('mat-dialog-container').find('.drop-list-option').should('not.exist');

      // Upload option image
      cy.stubFileInput();
      cy.contains('button', 'Bild hochladen').click();
      uploadFile('446878.jpeg');

      // image resize dialog pops up, click Speichern
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();

      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant-checkbox.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant-checkbox.json');
    });

    // ── Page 1: Text Checkbox Group ──────────────────────────────────────────────
    it('verifies the text checkbox group (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.contains('aspect-text', 'Was isst du gerne?').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Apfel').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Banane').should('be.visible');
      cy.contains('aspect-checkbox:visible', 'Orange').should('be.visible');
    });

    it('checks options in the text checkbox group (Page 1)', () => {
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('input')
        .click();
      cy.contains('aspect-checkbox:visible', 'Apfel')
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');

      cy.contains('aspect-checkbox:visible', 'Orange')
        .find('input')
        .click();
      cy.contains('aspect-checkbox:visible', 'Orange')
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');

      // Banane remains unchecked
      cy.contains('aspect-checkbox:visible', 'Banane')
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
    });

    // ── Page 2: Image Checkbox Group ─────────────────────────────────────────────
    it('verifies the image checkbox group (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.contains('aspect-text', 'Welche dieser Früchte magst du?').should('be.visible');
      cy.get('aspect-checkbox:visible').find('img[alt="Bildplatzhalter"]').should('be.visible');
    });

    // Counted in the unit: with the bug back, `aspect-checkbox:visible img` found one of its two image checkboxes
    it('has no checkbox made from the text option entered before switching (Page 2, #1610)', () => {
      cy.readFile('e2e/downloads/assistant-checkbox.json')
        .then((unit: { pages: { sections: { elements: { type: string }[] }[] }[] }) => {
          const checkboxes = unit.pages[1].sections.flatMap(section => section.elements)
            .filter(element => element.type === 'checkbox');
          expect(checkboxes).to.have.length(1);
        });
    });

    it('checks option in the image checkbox group (Page 2)', () => {
      cy.get('aspect-checkbox:visible').first()
        .find('mat-checkbox')
        .should('not.have.class', 'mat-mdc-checkbox-checked');
      cy.get('aspect-checkbox:visible').first()
        .find('input')
        .click();
      cy.get('aspect-checkbox:visible').first()
        .find('mat-checkbox')
        .should('have.class', 'mat-mdc-checkbox-checked');
    });
  });
});

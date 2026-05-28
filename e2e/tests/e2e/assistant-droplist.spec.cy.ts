import {
  clickButtonDialog, addNewPage
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addOptionViaFormField,
  setCheckboxInDialog
} from './helpers/assistant-util';
import { dragTo } from './helpers/droplist-util';

describe('Droplist assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Classic Droplist (Zuordnung) ─────────────────────────────────────
    // CHECK FORMAT
    it('creates a classic droplist (Zuordnung)', () => {

      openAssistant('Drag & Drop');
      cy.get('mat-dialog-container').contains('button', 'Zuordnung').click();

      // Frage/Instruktion
      typeInRichTextEditor('Ordnen Sie die Elemente zu!', 0);

      // Elementliste Überschrift
      typeInRichTextEditor('Startliste', 1);

      // Add Elementliste options
      addOptionViaFormField('Item A', 0);
      addOptionViaFormField('Item B', 0);

      // Ziel-Ablagen Überschrift
      typeInRichTextEditor('Zielliste', 2);

      // Add Ziel-Ablagen options
      // WRONG FORMAT
      addOptionViaFormField('Target X', 2);
      addOptionViaFormField('Target Y', 2);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Sort Droplist (Sortieren) ────────────────────────────────────────
    it('creates a sort droplist (Sortieren)', () => {
      // Add a new page first
      addNewPage();
      cy.contains('Seite 2').should('exist');

      openAssistant('Drag & Drop');
      cy.get('mat-dialog-container').contains('button', 'Sortieren').click();

      // Frage/Instruktion
      typeInRichTextEditor('Sortieren Sie die Elemente!', 0);

      // SHOULD SHOW IT
      // Elementliste Überschrift
      typeInRichTextEditor('Unsortiert', 1);

      // Add Elementliste options
      addOptionViaFormField('First', 0);
      addOptionViaFormField('Second', 0);

      // Enable numbering
      setCheckboxInDialog('Nummerierung aktivieren');

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    // ── Page 3: Two-sided Droplist (Zuordnung 2-seitig) ──────────────────────────
    // CHECK SEITE 1: FORMAT
    it('creates a two-sided droplist (Zuordnung 2-seitig)', () => {
      // Add a new page first
      addNewPage();
      cy.contains('Seite 3').should('exist');

      openAssistant('Drag & Drop');
      cy.get('mat-dialog-container').contains('button', 'Zuordnung (2-seitig)').click();

      // Frage/Instruktion
      typeInRichTextEditor('Zuordnung 2-seitig!', 0);

      // Elementliste Überschrift
      typeInRichTextEditor('Zweiseitige Startliste', 1);

      // Add Elementliste options (first list inputs)
      addOptionViaFormField('Text Option A', 0);
      addOptionViaFormField('Text Option B', 0);

      // Situierung
      typeInRichTextEditor('Situierungstext', 2);

      // Ziel-Ablagen Überschrift
      typeInRichTextEditor('Zweiseitige Zielliste', 3);

      // Add Ziel-Ablagen target labels (second list inputs)
      // WRONG FORMAT
      addOptionViaFormField('Text Target X', 1);
      addOptionViaFormField('Text Target Y', 1);

      // Quelle
      typeInRichTextEditor('Quellentext', 4);

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/droplist_assistant.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist_assistant.json');
    });

    // ── Page 1: Classic Droplist (Zuordnung) ─────────────────────────────────────
    it('verifies the classic droplist (Page 1)', () => {
      cy.contains('aspect-text', 'Ordnen Sie die Elemente zu!').should('be.visible');
      cy.contains('aspect-text', 'Startliste').should('be.visible');
      cy.contains('Item A').should('be.visible');
      cy.contains('Item B').should('be.visible');

      cy.contains('aspect-text', 'Zielliste').should('be.visible');
      // Always-visible page renders on the left
      cy.contains('aspect-text', 'Text Target X').should('be.visible');
    });

    it('drags items in the classic droplist (Page 1)', () => {
      // Find classic start list (which uniquely contains 'Item A' on the right side)
      cy.contains('.drop-list:visible', 'Item A').invoke('attr', 'data-list-alias').then(sourceAlias => {
        // Classic targets are at index 3 and 4 on the right side page
        cy.get('.drop-list:visible').eq(3).invoke('attr', 'data-list-alias').then(targetXAlias => {
          cy.get('.drop-list:visible').eq(4).invoke('attr', 'data-list-alias').then(targetYAlias => {
            // Drag Item A to Target X
            dragTo(sourceAlias!, 'Item A', targetXAlias!);
            cy.get('.drop-list:visible').eq(3).contains('.drop-list-item:not(.cc-placeholder)', 'Item A').should('be.visible');
            cy.get('.drop-list:visible').eq(2).contains('.drop-list-item:not(.cc-placeholder)', 'Item A').should('not.exist');

            // Drag Item B to Target Y
            dragTo(sourceAlias!, 'Item B', targetYAlias!);
            cy.get('.drop-list:visible').eq(4).contains('.drop-list-item:not(.cc-placeholder)', 'Item B').should('be.visible');
            cy.get('.drop-list:visible').eq(2).contains('.drop-list-item:not(.cc-placeholder)', 'Item B').should('not.exist');
          });
        });
      });
    });

    // ── Page 2: Sort Droplist (Sortieren) ────────────────────────────────────────
    it('verifies the sort droplist (Page 2)', () => {
      cy.goToPlayerPage(2);

      cy.contains('aspect-text', 'Sortieren Sie die Elemente!').should('be.visible');
      cy.contains('First').should('be.visible');
      cy.contains('Second').should('be.visible');

      // Verify that numbering is shown
      cy.contains('1.').should('be.visible');
      cy.contains('2.').should('be.visible');
    });

    it('reorders elements in the sort droplist (Page 2)', () => {
      cy.contains('.drop-list:visible', 'First').invoke('attr', 'data-list-alias').then(alias => {
        cy.getByAlias(alias!).contains('.drop-list-item', 'First').trigger('mousedown', { button: 0 });
        cy.getByAlias(alias!).contains('.drop-list-item', 'Second').trigger('mouseenter', { bubbles: false, force: true, button: 0 });
        cy.get('.drag-preview').trigger('mouseup', { force: true });
      });

      // Verify reordering success
      cy.contains('.drop-list:visible', 'Second').find('.drop-list-item').eq(0).contains('Second');
      cy.contains('.drop-list:visible', 'First').find('.drop-list-item').eq(1).contains('First');
    });

    // ── Page 3: Two-sided Droplist (Zuordnung 2-seitig) ──────────────────────────
    it('verifies the two-sided droplist (Page 3)', () => {
      cy.goToPlayerPage(3);

      cy.contains('aspect-text', 'Zuordnung 2-seitig!').should('be.visible');
      cy.contains('aspect-text', 'Zweiseitige Startliste').should('be.visible');
      cy.contains('Text Option A').should('be.visible');
      cy.contains('Text Option B').should('be.visible');

      // Targets on always-visible left page
      cy.contains('aspect-text', 'Situierungstext').should('be.visible');
      cy.contains('aspect-text', 'Zweiseitige Zielliste').should('be.visible');
      cy.contains('aspect-text', 'Quellentext').should('be.visible');
    });

    it('drags items across pages in two-sided droplist (Page 3)', () => {
      // Find two-sided start list (which uniquely contains 'Text Option A' on the right side)
      cy.contains('.drop-list:visible', 'Text Option A').invoke('attr', 'data-list-alias').then(sourceAlias => {
        // Targets on left side always-visible page are at index 0 and 1
        cy.get('.drop-list:visible').eq(0).invoke('attr', 'data-list-alias').then(targetXAlias => {
          cy.get('.drop-list:visible').eq(1).invoke('attr', 'data-list-alias').then(targetYAlias => {
            // Drag Text Option A to Target X
            dragTo(sourceAlias!, 'Text Option A', targetXAlias!);
            cy.get('.drop-list:visible').eq(0).contains('.drop-list-item:not(.cc-placeholder)', 'Text Option A').should('be.visible');
            cy.get('.drop-list:visible').eq(2).contains('.drop-list-item:not(.cc-placeholder)', 'Text Option A').should('not.exist');

            // Drag Text Option B to Target Y
            dragTo(sourceAlias!, 'Text Option B', targetYAlias!);
            cy.get('.drop-list:visible').eq(1).contains('.drop-list-item:not(.cc-placeholder)', 'Text Option B').should('be.visible');
            cy.get('.drop-list:visible').eq(2).contains('.drop-list-item:not(.cc-placeholder)', 'Text Option B').should('not.exist');
          });
        });
      });
    });
  });
});

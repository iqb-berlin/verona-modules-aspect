import { addElement } from '../util';

describe('Rich text editor paste', () => {
  beforeEach(() => {
    cy.viewport(1300, 800);
    cy.openEditor();
    addElement('Text');
    cy.get('aspect-ui-element-properties').contains('edit').click();
    cy.get('mat-dialog-container .ProseMirror').as('editor');
  });

  afterEach(() => {
    cy.contains('Speichern').click();
  });

  it('pastes formatted clipboard content as plain text', () => {
    cy.get('@editor').trigger('paste', {
      clipboardData: {
        getData: (type: string) => {
          if (type === 'text/plain') return 'Hallo Welt';
          if (type === 'text/html') return '<p><strong style="color: red;">Hallo Welt</strong></p>';
          return '';
        }
      }
    });

    cy.get('@editor').should('contain.text', 'Hallo Welt');
    cy.get('@editor').find('strong').should('not.exist');
  });

  it('pastes multi-line text as separate paragraphs', () => {
    cy.get('@editor').trigger('paste', {
      clipboardData: {
        getData: (type: string) => (type === 'text/plain' ? 'Zeile 1\nZeile 2' : '')
      }
    });

    cy.get('@editor').find('p').contains('Zeile 1').should('exist');
    cy.get('@editor').find('p').contains('Zeile 2').should('exist');
  });

  it('pastes HTML-only clipboard content as plain text', () => {
    cy.get('@editor').trigger('paste', {
      clipboardData: {
        getData: (type: string) => (type === 'text/html' ? '<h1>Titel</h1><p><em>kursiv</em></p>' : '')
      }
    });

    cy.get('@editor').should('contain.text', 'Titel');
    cy.get('@editor').should('contain.text', 'kursiv');
    cy.get('@editor').find('h1').should('not.exist');
    cy.get('@editor').find('em').should('not.exist');
  });
});

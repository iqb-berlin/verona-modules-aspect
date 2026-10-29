import { addElement, addOption } from '../../util';

/* Material stops the content of a dialog at 65vh, whatever the window. At 650px that is 423px, and in
   "Text bearbeiten" the toolbar takes more than half of it (#1006). The dialogs with a text editor lift
   that limit, and the text dialog takes the whole height for its text area.

   Sizes are read as offsets: the dialog scales up while it opens, and a bounding box taken then is a
   fraction of the real one. */

const WINDOW_HEIGHT = 650;

/** Content stopped short of the dialog leaves an empty band below the buttons. */
const buttonsAtTheBottom = (): void => {
  cy.get('mat-dialog-container').should($container => {
    const surface = $container.find('.mat-mdc-dialog-surface')[0];
    const actions = $container.find('.mat-mdc-dialog-actions')[0];
    expect(surface.offsetHeight, 'dialog inside the window').to.be.at.most(WINDOW_HEIGHT);
    expect(actions.offsetTop + actions.offsetHeight, 'buttons at the bottom of the dialog')
      .to.be.closeTo(surface.clientHeight, 1);
  });
};

describe('Dialogs with a text editor', { viewportWidth: 1366, viewportHeight: WINDOW_HEIGHT }, () => {
  beforeEach(() => {
    cy.openEditor();
  });

  it('gives the text dialog the height of the window and fills it with the editor', () => {
    addElement('Text');
    cy.get('aspect-ui-element-properties').contains('edit').click();

    cy.get('mat-dialog-container').should('have.attr', 'aria-label', 'Text bearbeiten');
    cy.get('mat-dialog-container .mat-mdc-dialog-title').should('not.exist');
    cy.get('mat-dialog-container .mat-mdc-dialog-surface').should($surface => {
      expect($surface[0].offsetHeight).to.be.closeTo(0.95 * WINDOW_HEIGHT, 1);
    });
    cy.get('mat-dialog-container .mat-mdc-dialog-content').should($content => {
      const editor = $content[0].querySelector('aspect-rich-text-editor') as HTMLElement;
      // What is left besides the editor is the padding of the content, 20px above and below.
      expect(editor.offsetHeight).to.be.at.least($content[0].clientHeight - 40);
    });
    buttonsAtTheBottom();
  });

  it('scrolls a long text in its text area, with the toolbar in view', () => {
    addElement('Text');
    cy.get('aspect-ui-element-properties').contains('edit').click();
    // Static, or the alias would run its query again when read, after the typing.
    cy.get('mat-dialog-container .mat-mdc-dialog-content').invoke('prop', 'scrollHeight')
      .as('emptyHeight', { type: 'static' });

    cy.get('mat-dialog-container .ProseMirror').type('Zeile{enter}'.repeat(40));

    cy.get<number>('@emptyHeight').then(emptyHeight => {
      cy.get('mat-dialog-container .mat-mdc-dialog-content')
        .should('have.prop', 'scrollHeight', emptyHeight);
    });
    cy.get('mat-dialog-container .ProseMirror').should($text => {
      expect($text[0].scrollHeight, 'text area scrolls').to.be.greaterThan($text[0].clientHeight);
    });
  });

  it('lets the drop list option dialog use the window, with its buttons at the bottom', () => {
    addElement('Ablegeliste', '(Zu)Ordnung');
    addOption('Apfel', 'Vorbelegung');
    cy.get('.option-draggable').contains('Apfel')
      .closest('.option-draggable')
      .find('mat-icon').contains('build')
      .click();

    cy.get('mat-dialog-container .mat-mdc-dialog-content').should('have.css', 'max-height', 'none');
    buttonsAtTheBottom();
  });
});

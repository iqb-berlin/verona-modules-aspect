import {
  addElement, addNewSection, submitDialog, switchToPositionTab
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  addOptionViaFormField
} from './helpers/assistant-util';

/* The two-sided droplist prepends an always visible page, which shifts every page index by one.
   A selection pointing at anything but the first section used to survive that shift unchanged and
   then addressed a section that does not exist on the newly prepended page. */
describe('Droplist assistant selection handling', { testIsolation: false }, () => {
  before('opens an editor', () => {
    cy.openEditor();
  });

  it('creates a two-sided droplist while a section other than the first one is selected', () => {
    addNewSection();
    addElement('Text');

    openAssistant('Drag & Drop');
    cy.get('mat-dialog-container').contains('button', 'Zuordnung (2-seitig)').click();

    typeInRichTextEditor('Zuordnung 2-seitig!', 0);
    typeInRichTextEditor('Zweiseitige Startliste', 1);
    addOptionViaFormField('Text Option A', 0);
    addOptionViaFormField('Text Option B', 0);
    typeInRichTextEditor('Situierungstext', 2);
    typeInRichTextEditor('Zweiseitige Zielliste', 3);
    addOptionViaFormField('Text Target X', 1);
    addOptionViaFormField('Text Target Y', 1);
    typeInRichTextEditor('Quellentext', 4);

    submitDialog();

    cy.contains('Unerwarteter Fehler').should('not.exist');
    cy.get('mat-dialog-container').should('not.exist');
  });

  it('creates the always visible page and keeps the pre-existing element', () => {
    cy.contains('dauerhaft sichtbare Seite').should('exist');
    cy.contains('aspect-text', 'Zweiseitige Zielliste').should('exist');
    // The regular pages live on their own lazily rendered tab
    cy.contains('.mat-mdc-tab', 'Seiten').click();
    cy.contains('aspect-text', 'Zweiseitige Startliste').should('exist');
  });

  it('shows the position properties of the selected element', () => {
    switchToPositionTab();
    cy.get('aspect-position-field-set').should('exist');
  });
});

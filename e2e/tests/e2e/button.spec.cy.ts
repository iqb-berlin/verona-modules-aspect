import {
  addPage, addPostMessageStub, navigateToPage, selectFromDropdown
} from '../util';

describe('Button element', { testIsolation: false }, () => {
  it('creates basic buttons in editor', () => {
    cy.openEditor();
    cy.wait(1000); // Wait for expansion panel to render. Otherwise the last panel is not there yet, sometimes.
    cy.contains('Sonstige').click();
    cy.contains('Knopf').click();
  });

  it('creates hyperlink button in editor', () => {
    cy.contains('Knopf').click();
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-Hyper');
    cy.contains('Hyperlink').click();
  });

  it('creates unit nav button in editor', () => {
    cy.contains('Knopf').click();
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-next-unit');
    selectFromDropdown('Aktion', 'Unitnavigation');
    selectFromDropdown('Aktionsparameter', 'Nächste Unit');
  });

  it('creates page nav button in editor', () => {
    addPage();
    cy.contains('Knopf').click();
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-seite-2');
    navigateToPage(1);
    cy.contains('Knopf').click();
    cy.contains('div', 'Beschriftung').find('textarea').clear().type('Knopf-page-2');
    selectFromDropdown('Aktion', 'Seitennavigation');
    selectFromDropdown('Aktionsparameter', '2');
  });

  it('creates image button in editor', () => {
    cy.contains('Knopf').click();
    cy.get('#button-image-upload').selectFile('example_data/media/446878.jpeg', { force: true });
  });

  it('saves unit definition', () => {
    cy.saveUnit('e2e/downloads/buttons.json');
  });

  // ### PLAYER ####

  it('pass some basic checks', () => {
    cy.openPlayer();
    cy.loadUnit('../downloads/buttons.json');
    cy.contains('Knopf-not-existing').should('not.exist');
    cy.get('aspect-button').should('have.length', 5);
  });

  it('finds and uses a button without an action', () => {
    cy.contains('aspect-button', 'Knopf').find('button').should('exist');
  });

  it('finds and uses a hyperlink button', () => {
    cy.contains('aspect-button', 'Knopf-Hyper').find('a').should('exist');
  });

  it('finds and uses a button with unit nav', () => {
    addPostMessageStub();
    cy.contains('button', 'Knopf-next-unit').click();
    cy.get('@postMessage')
      .should('be.calledWithMatch',
        Cypress.sinon.match({
          type: 'vopUnitNavigationRequestedNotification',
          target: 'next'
        }));
  });

  it('finds and uses a button with page nav', () => {
    cy.contains('button', 'Knopf-page-2').click();
    cy.contains('Knopf-seite-2');
  });

  it('finds and uses a button with an image', () => {
    cy.get('input[type="image"').should('have.attr', 'alt', 'Bild nicht gefunden');
    cy.get('[src^="data:image"]');
  });
});

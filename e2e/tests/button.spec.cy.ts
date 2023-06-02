describe('Buttons', () => {
  beforeEach(() => {
    cy.openPlayer();
    cy.loadUnit('buttons.json');
  });

  function addPostMessageStub() {
    const postMessageStub = cy.stub().as('postMessage');
    cy.window().then(window => {
      window.parent.addEventListener('message', e => {
        postMessageStub(e.data);
      });
    });
  }

  /* Check for any false-positives */
  it('pass some basic crosschecks', () => {
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
        Cypress.sinon.match(message => message.type === 'vopUnitNavigationRequestedNotification' &&
            message.target === 'next'));
  });

  it('finds and uses a button with page nav', () => {
    addPostMessageStub();
    cy.contains('button', 'Knopf-page-2').click();
    cy.contains('Knopf-seite-2');
  });

  it('finds and uses a button with an image', () => {
    cy.get('input[type="image"').should('have.attr', 'alt', 'Bild nicht gefunden');
    cy.get('[src^="data:image"]');
  });
});

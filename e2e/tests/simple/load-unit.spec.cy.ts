/* `loadUnit` used to post the start command twice, 150 ms apart, in case the player was not listening
   yet. Every start command rebuilds the unit, so a click in between landed on an element that was then
   torn down (#1555). It now waits for the player's ready notification and posts once. */

describe('loadUnit', () => {
  it('starts the player exactly once', () => {
    let startCommands = 0;
    cy.openPlayer();
    cy.window().then(window => {
      window.addEventListener('message', (event: MessageEvent<unknown>) => {
        const { data } = event;
        if (typeof data === 'object' && data !== null && 'type' in data && data.type === 'vopStartCommand') {
          startCommands += 1;
        }
      });
    });
    cy.loadUnit('cloze-word-break.json');
    cy.getElementByAlias('cloze_word').should('exist');
    // What is checked is that nothing more arrives, so it takes a fixed wait: twice the former retry delay.
    cy.wait(300);
    cy.then(() => expect(startCommands, 'start commands received by the player').to.equal(1));
  });
});

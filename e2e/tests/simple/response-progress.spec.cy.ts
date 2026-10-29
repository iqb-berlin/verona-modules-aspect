import { addElement, setCheckbox, addPostMessageStub } from '../util';

/* The player told the host a unit was still complete after a required response had been taken back
   again (#1354). What the host is told matters twice over: it decides whether navigation is denied,
   and only a denied navigation makes the player show its "input required" messages. */
describe('responseProgress of a required response', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a required text field', () => {
      addElement('Eingabefeld', 'Eingabe', 'field1');
      setCheckbox('Pflichtfeld', true);
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/response-progress.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnit('../downloads/response-progress.json');
    });

    it('reports complete while the field is filled and none once it is cleared again', () => {
      cy.get('aspect-text-field input').type('abc');
      expectLastResponseProgress('complete');

      cy.get('aspect-text-field input').clear();
      expectLastResponseProgress('none');
    });
  });
});

/* The stub collects every state changed notification the player sent, so what counts is the last one
   carrying a responseProgress. Asserted inside `should`, which retries: the notification follows the
   input with a delay of its own. */
function expectLastResponseProgress(expected: string): void {
  cy.get('@postMessage').should(stub => {
    const calls = (stub as unknown as {
      args: { unitState?: { responseProgress?: string } }[][]
    }).args;
    const reported = calls
      .map(call => call[0]?.unitState?.responseProgress)
      .filter(progress => progress !== undefined);
    expect(reported[reported.length - 1]).to.equal(expected);
  });
}

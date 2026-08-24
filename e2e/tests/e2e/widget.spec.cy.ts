import { addElement } from '../util';

interface WidgetCallMessage {
  callId: string;
  parameters: { key: string, value: string }[];
}

interface PostMessageStub {
  lastCall: { args: [WidgetCallMessage] };
}

describe('Widget Element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a periodic table widget', () => {
      addElement('Periodensystem', 'Widgets');
      cy.get('aspect-widget-periodic-table').should('exist');
    });

    it('adds a molecule editor widget', () => {
      addElement('Molekül-Editor', 'Widgets');
      cy.get('aspect-widget-molecule-editor').should('exist');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/widget.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/widget.json');
    });

    it('checks that all widgets are rendered', () => {
      cy.get('aspect-widget-periodic-table').should('exist');
      cy.get('aspect-widget-molecule-editor').should('exist');
    });

    it.skip('verifies periodic table widget call and return handling', () => {
      const postMessageStub = cy.stub().as('postMessage');
      cy.window().then(window => {
        window.parent.addEventListener('message', e => {
          postMessageStub(e.data);
        });
      });

      // Click periodic table fab button to trigger widget call
      cy.get('aspect-widget-periodic-table button').click({ force: true });

      // Assert vopWidgetCall was sent with converted UPPER_SNAKE_CASE parameters
      cy.get('@postMessage').should('be.calledWithMatch', Cypress.sinon.match({
        type: 'vopWidgetCall',
        widgetType: 'PERIODIC_TABLE'
      })).then(stub => {
        const msg = (stub as unknown as PostMessageStub).lastCall.args[0];
        expect(msg.callId).to.be.a('string').with.length.greaterThan(0);
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_ORDER', value: 'true' });
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_E_NEG', value: 'false' });
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_A_MASS', value: 'true' });
        expect(msg.parameters).to.deep.include({ key: 'CLOSE_ON_SELECTION', value: 'false' });
        expect(msg.parameters).to.deep.include({ key: 'MAX_NUMBER_OF_SELECTIONS', value: '1' });

        // Post back a vopWidgetReturn message echoing the callId
        cy.window().then(window => {
          window.postMessage({
            type: 'vopWidgetReturn',
            callId: msg.callId,
            state: 'H He Li'
          }, '*');
        });
      });

      // Assert that the states are loaded and rendered
      cy.get('aspect-widget-periodic-table .element-square').should('have.length', 3);
      cy.get('aspect-widget-periodic-table .element-square').eq(0).should('have.text', 'H');
      cy.get('aspect-widget-periodic-table .element-square').eq(1).should('have.text', 'He');
      cy.get('aspect-widget-periodic-table .element-square').eq(2).should('have.text', 'Li');
    });

    it('verifies molecule editor widget call and return handling', () => {
      const postMessageStub = cy.stub().as('postMessage');
      cy.window().then(window => {
        window.parent.addEventListener('message', e => {
          postMessageStub(e.data);
        });
      });

      // Open the periodic table first and "close" it without an answer (no vopWidgetReturn)
      cy.get('aspect-widget-periodic-table button').click({ force: true });

      // Click molecule editor fab button
      cy.get('aspect-widget-molecule-editor button').click({ force: true });

      // Assert vopWidgetCall was sent
      cy.get('@postMessage').should('be.calledWithMatch', Cypress.sinon.match({
        type: 'vopWidgetCall',
        widgetType: 'MOLECULE_EDITOR'
      })).then(stub => {
        const msg = (stub as unknown as PostMessageStub).lastCall.args[0];
        expect(msg.callId).to.be.a('string').with.length.greaterThan(0);

        // Post back a vopWidgetReturn message echoing the callId
        cy.window().then(window => {
          window.postMessage({
            type: 'vopWidgetReturn',
            callId: msg.callId,
            state: 'mock-molecule-data'
          }, '*');
        });
      });

      // Assert that the molecule editor displays the state value
      cy.get('aspect-widget-molecule-editor .state-value').should('have.text', 'mock-molecule-data');

      // Regression #1085: the abandoned periodic table must NOT receive the molecule editor state
      cy.get('aspect-widget-periodic-table .element-square').should('not.exist');
    });
  });
});

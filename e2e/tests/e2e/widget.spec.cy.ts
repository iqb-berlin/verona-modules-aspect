import { addElement } from '../util';

describe('Widget Element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a periodic table widget', () => {
      addElement('Periodensystem', 'Widgets');
      cy.get('aspect-widget-periodic-table').should('exist');
    });

    it('adds a calculator widget', () => {
      addElement('Rechner', 'Widgets');
      cy.get('aspect-widget-calc').should('exist');
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
      cy.get('aspect-widget-calc').should('exist');
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
      })).then((stub: any) => {
        const lastCall = stub.lastCall;
        const msg = lastCall.args[0];
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_ORDER', value: 'true' });
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_E_NEG', value: 'false' });
        expect(msg.parameters).to.deep.include({ key: 'SHOW_INFO_A_MASS', value: 'true' });
        expect(msg.parameters).to.deep.include({ key: 'CLOSE_ON_SELECTION', value: 'false' });
        expect(msg.parameters).to.deep.include({ key: 'MAX_NUMBER_OF_SELECTIONS', value: '1' });
      });

      // Post back a vopWidgetReturn message
      cy.window().then(window => {
        window.postMessage({
          type: 'vopWidgetReturn',
          state: 'H He Li'
        }, '*');
      });

      // Assert that the states are loaded and rendered
      cy.get('aspect-widget-periodic-table .element-square').should('have.length', 3);
      cy.get('aspect-widget-periodic-table .element-square').eq(0).should('have.text', 'H');
      cy.get('aspect-widget-periodic-table .element-square').eq(1).should('have.text', 'He');
      cy.get('aspect-widget-periodic-table .element-square').eq(2).should('have.text', 'Li');
    });

    it('verifies calculator widget call and return handling', () => {
      const postMessageStub = cy.stub().as('postMessage');
      cy.window().then(window => {
        window.parent.addEventListener('message', e => {
          postMessageStub(e.data);
        });
      });

      // Click calculator fab button
      cy.get('aspect-widget-calc button').click({ force: true });

      // Assert vopWidgetCall was sent
      cy.get('@postMessage').should('be.calledWithMatch', Cypress.sinon.match({
        type: 'vopWidgetCall',
        widgetType: 'CALC'
      }));

      // Post back a vopWidgetReturn message
      cy.window().then(window => {
        window.postMessage({
          type: 'vopWidgetReturn',
          state: '42'
        }, '*');
      });

      // Assert that the calculator displays the state value
      cy.get('aspect-widget-calc .state-value').should('have.text', '42');
    });

    it('verifies molecule editor widget call and return handling', () => {
      const postMessageStub = cy.stub().as('postMessage');
      cy.window().then(window => {
        window.parent.addEventListener('message', e => {
          postMessageStub(e.data);
        });
      });

      // Click molecule editor fab button
      cy.get('aspect-widget-molecule-editor button').click({ force: true });

      // Assert vopWidgetCall was sent
      cy.get('@postMessage').should('be.calledWithMatch', Cypress.sinon.match({
        type: 'vopWidgetCall',
        widgetType: 'MOLECULE_EDITOR'
      }));

      // Post back a vopWidgetReturn message
      cy.window().then(window => {
        window.postMessage({
          type: 'vopWidgetReturn',
          state: 'mock-molecule-data'
        }, '*');
      });

      // Assert that the molecule editor displays the state value
      cy.get('aspect-widget-molecule-editor .state-value').should('have.text', 'mock-molecule-data');
    });
  });
});

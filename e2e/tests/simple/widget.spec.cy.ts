import { addElement } from '../util';

interface WidgetCallMessage {
  type: string;
  widgetType: string;
  callId: string;
  parameters: { key: string, value: string }[];
}

interface PostMessageStub {
  getCalls: () => { args: unknown[] }[];
}

function isWidgetCall(arg: unknown, widgetType: string): arg is WidgetCallMessage {
  if (typeof arg !== 'object' || arg === null) return false;
  if (!('type' in arg) || !('widgetType' in arg) || !('callId' in arg)) return false;
  return arg.type === 'vopWidgetCall' && arg.widgetType === widgetType;
}

/** Later player messages overwrite `lastCall`, so the matching widget call is taken from the list. */
function widgetCallFromStub(stub: PostMessageStub, widgetType: string): WidgetCallMessage {
  const match = stub.getCalls()
    .map(call => call.args[0])
    .reverse()
    .find(arg => isWidgetCall(arg, widgetType));
  expect(match, `vopWidgetCall for ${widgetType}`).to.not.equal(undefined);
  return match as WidgetCallMessage;
}

/** `loadUnit` sends its start command twice, 150 ms apart, and the second one builds the unit anew -- a
    call made in between is answered to an element that no longer exists. The start command goes out
    once here, after the player has said it is ready to take it. */
function startPlayerWith(fixture: string): void {
  const ready = cy.stub().as('ready');
  const onMessage = (e: MessageEvent): void => {
    if (e.data?.type === 'vopReadyNotification') ready();
  };
  cy.visit('http://localhost:4202/', {
    onBeforeLoad(window) {
      window.parent.addEventListener('message', onMessage);
    }
  });
  cy.get('@ready').should('have.been.called');
  cy.window().then(window => window.parent.removeEventListener('message', onMessage));
  cy.get('aspect-unit').should('exist');
  cy.fixture(fixture).then(unit => {
    cy.window().then(window => {
      window.postMessage({ type: 'vopStartCommand', unitDefinition: JSON.stringify(unit) }, '*');
    });
  });
}

describe('Widget Element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a periodic table widget', () => {
      addElement('Periodensystem', 'Widgets');
      cy.get('aspect-widget-periodic-table').should('exist');
      // A 0 means view only, and the field is where an author learns it (#1488)
      cy.contains('mat-hint', '0 = keine Auswahl, nur Ansehen').should('exist');
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
      startPlayerWith('../downloads/widget.json');
    });

    it('checks that all widgets are rendered', () => {
      cy.get('aspect-widget-periodic-table').should('exist');
      cy.get('aspect-widget-molecule-editor').should('exist');
    });

    it('verifies periodic table widget call and return handling', () => {
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
        const msg = widgetCallFromStub(stub as unknown as PostMessageStub, 'PERIODIC_TABLE');
        expect(msg.callId).to.be.a('string').with.length.greaterThan(0);
        expect(msg.parameters).to.have.deep.members([
          { key: 'SHOW_INFO_ORDER', value: '1' },
          { key: 'SHOW_INFO_E_NEG', value: '0' },
          { key: 'SHOW_INFO_A_MASS', value: '1' },
          { key: 'SHOW_INFO_NAME', value: '1' },
          { key: 'SHOW_INFO_SYMBOL', value: '1' },
          { key: 'HIGHLIGHT_BLOCKS', value: '0' },
          { key: 'CLOSE_ON_SELECTION', value: '0' },
          { key: 'MAX_NUMBER_OF_SELECTIONS', value: '1' }
        ]);
        expect(msg).to.not.have.property('sharedParameters');

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
      // White on the widget's purple, as the widget shows a selection (#1369)
      cy.get('aspect-widget-periodic-table .element-square').eq(0)
        .should('have.css', 'background-color', 'rgb(107, 54, 154)')
        .and('have.css', 'color', 'rgb(255, 255, 255)');
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
        const msg = widgetCallFromStub(stub as unknown as PostMessageStub, 'MOLECULE_EDITOR');
        expect(msg.callId).to.be.a('string').with.length.greaterThan(0);
        expect(msg.parameters).to.deep.equal([{ key: 'BONDING_TYPE', value: 'VALENCE' }]);
        expect(msg).to.not.have.property('sharedParameters');

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
      cy.get('aspect-widget-periodic-table').should('not.contain.text', 'mock-molecule-data');
    });
  });

  context('player with stored periodic tables', () => {
    const callFor = (alias: string): Cypress.Chainable<WidgetCallMessage> => {
      // One alias per element: the stubs of all calls in a test are made while the test queues its
      // commands, so a shared alias would point every call at the last one
      const postMessageStub = cy.stub().as(`postMessage-${alias}`);
      const onMessage = (e: MessageEvent): void => postMessageStub(e.data);
      let listeningWindow: Window | undefined;
      cy.window().then(window => {
        listeningWindow = window.parent;
        listeningWindow.addEventListener('message', onMessage);
      });
      cy.getElementByAlias(alias).find('button').click({ force: true });
      return cy.get(`@postMessage-${alias}`)
        .should('be.calledWithMatch', Cypress.sinon.match({ type: 'vopWidgetCall', widgetType: 'PERIODIC_TABLE' }))
        .then(stub => {
          listeningWindow?.removeEventListener('message', onMessage);
          return widgetCallFromStub(stub as unknown as PostMessageStub, 'PERIODIC_TABLE');
        });
    };

    /* A maximum of 0 means view only: the widget gets the 0, and whatever comes back is no answer -- a
       widget that still reads 0 as unlimited sends a selection all the same (#1488). */
    it('takes no answer from a periodic table that is only there to look at', () => {
      startPlayerWith('widget-periodic-table-view-only.json');
      callFor('pse_zero').then(msg => {
        expect(msg.parameters).to.deep.include({ key: 'MAX_NUMBER_OF_SELECTIONS', value: '0' });
        cy.window().then(window => {
          window.postMessage({ type: 'vopWidgetReturn', callId: msg.callId, state: 'Na Cl' }, '*');
        });
      });
      // Messages arrive in the order they were sent: once the answer of the table beside it shows, the
      // return to the view-only table has been handled as well
      callFor('pse_one').then(msg => {
        cy.window().then(window => {
          window.postMessage({ type: 'vopWidgetReturn', callId: msg.callId, state: 'K' }, '*');
        });
      });
      cy.getElementByAlias('pse_one').find('.element-square').should('have.text', 'K');
      cy.getElementByAlias('pse_zero').find('.element-square').should('not.exist');
    });

    /* With block colours the widget colours every field by its block, which the player does not
       know; the answer stands in dark grey (#1369). */
    it('shows the answer dark grey when the fields are coloured by block', () => {
      startPlayerWith('widget-periodic-table-block-colors.json');
      callFor('pse_blocks').then(msg => {
        expect(msg.parameters).to.deep.include({ key: 'HIGHLIGHT_BLOCKS', value: '1' });
        cy.window().then(window => {
          window.postMessage({ type: 'vopWidgetReturn', callId: msg.callId, state: 'Na Cl' }, '*');
        });
      });
      cy.getElementByAlias('pse_blocks').find('.element-square').should('have.length', 2)
        .first()
        .should('have.css', 'background-color', 'rgb(66, 66, 66)');
    });
  });
});

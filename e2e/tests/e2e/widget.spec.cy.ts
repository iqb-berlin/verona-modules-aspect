import { addElement } from '../util';

interface WidgetCallMessage {
  type: string;
  widgetType: string;
  callId: string;
  parameters: { key: string, value: string }[];
  sharedParameters: { key: string, value: string }[];
}

interface PostMessageStub {
  getCalls: () => { args: unknown[] }[];
}

interface SharedStateMessage {
  type: 'vopStateChangedNotification';
  playerState: {
    currentPage: string;
    validPages: { id: string, label: string }[];
    sharedParameters: { key: string, value: string }[];
  };
}

function isSharedState(arg: unknown): arg is SharedStateMessage {
  if (typeof arg !== 'object' || arg === null) return false;
  if (!('type' in arg) || arg.type !== 'vopStateChangedNotification') return false;
  if (!('playerState' in arg) || typeof arg.playerState !== 'object' || arg.playerState === null) return false;
  return 'sharedParameters' in arg.playerState;
}

/** The player state with shared parameters that went out last before `call`. */
function sharedStateBefore(stub: PostMessageStub, call: WidgetCallMessage): SharedStateMessage {
  const messages = stub.getCalls().map(entry => entry.args[0]);
  const match = messages
    .slice(0, messages.lastIndexOf(call))
    .reverse()
    .find(isSharedState);
  expect(match, 'player state with shared parameters before the widget call').to.not.equal(undefined);
  return match as SharedStateMessage;
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
        const msg = widgetCallFromStub(stub as unknown as PostMessageStub, 'PERIODIC_TABLE');
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
        const msg = widgetCallFromStub(stub as unknown as PostMessageStub, 'MOLECULE_EDITOR');
        expect(msg.callId).to.be.a('string').with.length.greaterThan(0);
        // The widget reads BONDING_TYPE as a shared parameter; as a parameter it never arrived (#1420)
        expect(msg.sharedParameters).to.deep.include({ key: 'BONDING_TYPE', value: 'VALENCE' });
        expect(msg.parameters).to.deep.include({ key: 'LANGUAGE', value: 'de' });

        // The player API carries shared parameters in the player state, and the host needs them before
        // the widget starts. The pages travel along: the testcenter empties its navigation for a
        // player state without them (#1475).
        const sharedState = sharedStateBefore(stub as unknown as PostMessageStub, msg);
        expect(sharedState.playerState.sharedParameters)
          .to.deep.equal([{ key: 'BONDING_TYPE', value: 'VALENCE' }]);
        expect(sharedState.playerState.validPages).to.have.length.greaterThan(0);
        expect(sharedState.playerState.currentPage).to.be.a('string');

        // The periodic table opened first shares both field colours, each with its default
        const periodicTableCall = widgetCallFromStub(stub as unknown as PostMessageStub, 'PERIODIC_TABLE');
        expect(sharedStateBefore(stub as unknown as PostMessageStub, periodicTableCall).playerState.sharedParameters)
          .to.deep.equal([
            { key: 'TEXT_COLOR', value: '#ffffff' },
            { key: 'BACKGROUND_COLOR', value: '#6b369a' }
          ]);

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

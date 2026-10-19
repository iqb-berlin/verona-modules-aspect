/* A definition that cannot be loaded is named in the dialog of the player or the editor by a text whose translation
   key carries the code of the player specification (#1578). Reading the texts from the running applications is what
   holds the keys and the translation files together; the unit tests only see the keys. The dialog has no close
   option, and the host keeps player and editor for the next unit, so the next start command takes it away (#1581). */

const definition = (version: string): string => JSON.stringify({
  type: 'aspect-unit-definition',
  version,
  stateVariables: [],
  pages: [],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
});

const LOADABLE_TEXT = 'Ladbare Aufgabe';

const loadableDefinition = JSON.stringify({
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages: [{
    sections: [{
      elements: [{
        type: 'text',
        id: 'text_1',
        alias: 'text_1',
        text: `<p>${LOADABLE_TEXT}</p>`,
        position: {
          gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
        }
      }],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: true,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      visibilityDelay: 0,
      animatedVisibility: false,
      enableReHide: false,
      logicalConnectiveOfRules: 'disjunction',
      visibilityRules: [],
      ignoreNumbering: false
    }],
    hasMaxWidth: true,
    maxWidth: 750,
    margin: 30,
    backgroundColor: '#ffffff',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50
  }],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
});

const cases = [
  { name: 'cannot be parsed', unitDefinition: 'no json', text: 'Aufgabendefinition konnte nicht gelesen werden!' },
  { name: 'is newer', unitDefinition: definition('99.0.0'), text: 'Aufgabenversion ist neuer als dieser' },
  { name: 'is too old to migrate', unitDefinition: definition('3.0.0'), text: 'Aufgabenversion ist veraltet.' }
];

function startPlayer(unitDefinition: string): void {
  cy.sendStartCommand({ sessionId: 'session_1', unitDefinition });
}

function startEditor(unitDefinition: string): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition,
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
}

describe('A unit definition that cannot be loaded', () => {
  context('in the player', () => {
    beforeEach(() => {
      cy.openPlayer();
      cy.get('aspect-unit', { timeout: 10000 }).should('exist');
    });

    cases.forEach(({ name, unitDefinition, text }) => {
      it(`names a definition that ${name}`, () => {
        startPlayer(unitDefinition);
        cy.get('aspect-unit-def-error-dialog').should('contain.text', text);
      });
    });

    it('takes the dialog away when the next unit starts', () => {
      startPlayer(definition('99.0.0'));
      cy.get('aspect-unit-def-error-dialog').should('exist');

      startPlayer(loadableDefinition);

      cy.get('aspect-unit-def-error-dialog').should('not.exist');
      cy.contains(LOADABLE_TEXT).should('be.visible');
    });
  });

  context('in the editor', () => {
    beforeEach(() => {
      cy.openEditor();
    });

    cases.forEach(({ name, unitDefinition, text }) => {
      it(`names a definition that ${name}`, () => {
        startEditor(unitDefinition);
        cy.get('aspect-unit-def-error-dialog').should('contain.text', text);
      });
    });

    it('takes the dialog away when the next unit starts', () => {
      startEditor(definition('99.0.0'));
      cy.get('aspect-unit-def-error-dialog').should('exist');

      startEditor(loadableDefinition);

      cy.get('aspect-unit-def-error-dialog').should('not.exist');
      cy.get('aspect-editor-page-view').contains(LOADABLE_TEXT).should('be.visible');
    });
  });
});

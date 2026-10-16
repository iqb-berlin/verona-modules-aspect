/* A definition that cannot be loaded is named in the dialog of the player or the editor by a text whose translation
   key carries the code of the player specification (#1578). Reading the texts from the running applications is what
   holds the keys and the translation files together; the unit tests only see the keys. */

const definition = (version: string): string => JSON.stringify({
  type: 'aspect-unit-definition',
  version,
  stateVariables: [],
  pages: [],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
});

const cases = [
  { name: 'cannot be parsed', unitDefinition: 'no json', text: 'Aufgabendefinition konnte nicht gelesen werden!' },
  { name: 'is newer', unitDefinition: definition('99.0.0'), text: 'Aufgabenversion ist neuer als dieser' },
  { name: 'is too old to migrate', unitDefinition: definition('3.0.0'), text: 'Aufgabenversion ist veraltet.' }
];

describe('A unit definition that cannot be loaded', () => {
  context('in the player', () => {
    cases.forEach(({ name, unitDefinition, text }) => {
      it(`names a definition that ${name}`, () => {
        cy.openPlayer();
        cy.get('aspect-unit', { timeout: 10000 }).should('exist');
        cy.window().then(window => {
          const message = { type: 'vopStartCommand', sessionId: 'session_1', unitDefinition };
          window.postMessage(message, '*');
          // Retried as `loadUnit` does, in case the player's message subscription is not up yet.
          return Cypress.Promise.delay(150).then(() => window.postMessage(message, '*'));
        });
        cy.get('aspect-unit-def-error-dialog').should('contain.text', text);
      });
    });
  });

  context('in the editor', () => {
    cases.forEach(({ name, unitDefinition, text }) => {
      it(`names a definition that ${name}`, () => {
        cy.openEditor();
        cy.window().then(window => {
          window.postMessage({
            type: 'voeStartCommand',
            sessionId: 'dev',
            unitDefinition,
            unitDefinitionType: 'aspect-unit-definition',
            editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
          }, '*');
        });
        cy.get('aspect-unit-def-error-dialog').should('contain.text', text);
      });
    });
  });
});

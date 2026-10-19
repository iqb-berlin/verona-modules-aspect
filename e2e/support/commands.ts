/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//   }
// }

import type { PlayerConfigOptions, VopStartCommandMessage } from './index';

/** Player windows that have sent their `vopReadyNotification`. The player sends it once per page load, so
    a unit loaded into a player that is already running cannot wait for a new one; what it asks is
    whether the window it is in has said it is ready. Held per window, a reload starts from "not ready". */
const readyPlayers = new WeakSet<Window>();

Cypress.on('window:before:load', (window: Window) => {
  const onMessage = (event: MessageEvent<unknown>): void => {
    const { data } = event;
    if (event.source === window && typeof data === 'object' && data !== null &&
      'type' in data && data.type === 'vopReadyNotification') {
      readyPlayers.add(window);
      window.parent.removeEventListener('message', onMessage);
    }
  };
  window.parent.addEventListener('message', onMessage);
  // The editor never sends it, and a page can be left before it does; the listener goes with the page.
  window.addEventListener('pagehide', () => window.parent.removeEventListener('message', onMessage));
});

/* The player subscribes to start commands in the same change detection run in which it sends its ready
   notification, so once that has arrived, one start command is enough. A second one would rebuild the
   unit under whatever the test is doing at that moment (#1555). */
Cypress.Commands.add('sendStartCommand', (startCommand: VopStartCommandMessage) => {
  cy.window({ timeout: 10000 }).should(window => {
    expect(readyPlayers.has(window), 'vopReadyNotification received').to.equal(true);
  });
  cy.window().then(window => {
    window.postMessage({ type: 'vopStartCommand', ...startCommand }, '*');
  });
});

/* The editor subscribes to start commands in `AppComponent.ngOnInit`, on a plain Subject, so a command sent
   before that is lost and the test runs against an empty editor (#1585). Its ready notification cannot tell when
   that has happened: Cypress rewrites `window === window.parent` to `window === window.self`, so under Cypress the
   editor takes itself for standalone and posts nothing at all. What it renders can: the tab headers of the element
   toolbox are drawn by a loop, so they appear in the update pass below `AppComponent`, after its `ngOnInit`, and
   they do not depend on the unit. The definition is a string so that a spec can send one that is not JSON. */
Cypress.Commands.add('sendEditorStartCommand', (unitDefinition: string) => {
  cy.get('aspect-ui-element-toolbox [role="tab"]', { timeout: 10000 }).should('exist');
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition,
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
});

/** What the player renders once it has built a unit, or the dialog in which it says why it could not. */
const UNIT_OUTCOME = 'aspect-player-layout, aspect-print-layout, mat-dialog-container';

/** Loads a fixture into the running player and waits until the player has built it or rejected it. A start
    command first takes the previous unit down, so only an outcome that was not on the page before it counts.
    A rejection fails here, with the player's reason, rather than at the first selector that finds nothing. */
function loadUnitWith(filename: string, playerConfig?: PlayerConfigOptions): void {
  cy.fixture(filename).then(unit => {
    cy.get('body').then($body => {
      const previousOutcome = $body.find(UNIT_OUTCOME).toArray();
      cy.sendStartCommand({ unitDefinition: JSON.stringify(unit), ...(playerConfig && { playerConfig }) });
      cy.get(UNIT_OUTCOME, { timeout: 10000 })
        .should($outcome => {
          expect($outcome.not(previousOutcome), 'unit built or rejected').to.have.length.greaterThan(0);
        })
        .then($outcome => {
          const errorDialog = $outcome.not(previousOutcome).filter('mat-dialog-container');
          if (errorDialog.length > 0) {
            throw new Error(`Player rejected unit definition: ${errorDialog.text().trim()}`);
          }
        });
    });
  });
}

Cypress.Commands.add('openPlayer', () => {
  cy.visit('http://localhost:4202/');
});

Cypress.Commands.add('openEditor', () => {
  cy.visit('http://localhost:4201/');
});

Cypress.Commands.add('switchToTabbedViewMode', () => {
  cy.get('[data-cy="extras-menu"]').click();
  cy.get('.cdk-overlay-container').should('be.visible');
  cy.get('.cdk-overlay-container').contains('Seitenansicht untereinander').click();
  cy.get('body').type('{esc}');
  cy.get('.cdk-overlay-backdrop').should('not.exist');
});

Cypress.Commands.add('loadUnit', (filename: string) => loadUnitWith(filename));

Cypress.Commands.add('loadUnitWithPrintMode', (filename: string, printMode: 'off' | 'on' | 'on-with-ids') => (
  loadUnitWith(filename, { printMode })));

Cypress.Commands.add('saveUnit', (filepath: string = 'e2e/downloads/export.json') => {
  cy.get('body').type('{esc}', { force: true });
  cy.get('body').then($body => {
    if ($body.find('.cdk-overlay-backdrop').length > 0) {
      cy.get('body').click(0, 0, { force: true });
    }
  });
  cy.contains('Unit speichern').click({ force: true });
  cy.get('a[download]')
    .should('have.length.at.least', 1)
    .last()
    .invoke('prop', 'href')
    .then((url: string) => cy.window().then(win => win.fetch(url).then(response => response.text())))
    .then(content => cy.task('writeTextFile', { filepath, content }, { log: false }));
});

Cypress.Commands.add('getByAlias', (alias: string) => cy.get(`[data-list-alias="${alias}"]`));

Cypress.Commands.add('getElementByAlias', (alias: string) => cy.get(`[data-element-alias="${alias}"]`));

Cypress.Commands.add('goToPlayerPage', (pageIndex: number) => {
  cy.get('aspect-unit-menu').find('button').click();
  cy.contains('button', `Seite ${pageIndex}`).click();
});

Cypress.Commands.add('clickOutside', (): void => {
  cy.get('body').click(0, 0);
});

Cypress.Commands.add('getElement', (elementType: string, label?: string) => {
  if (label) {
    return cy.contains(elementType, label);
  }

  return cy.get(elementType);
});

Cypress.Commands.add('stubFileInput', () => {
  // The app creates a hidden <input type=file> via document.createElement that is never
  // appended to the DOM. Intercept createElement to attach it to <body> so Cypress can find it.
  cy.window().then(win => {
    const originalCreateElement = win.document.createElement.bind(win.document);
    cy.stub(win.document, 'createElement').callsFake((tagName: string, options?: ElementCreationOptions) => {
      const el = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'input') {
        const originalClick = el.click.bind(el);
        el.click = () => {
          if ((el as HTMLInputElement).type === 'file') {
            win.document.body.appendChild(el);
          }
          originalClick();
        };
      }
      return el;
    });
  });
});

Cypress.Commands.add('loadUnitWithOptions', (filename: string, playerConfig: PlayerConfigOptions) => (
  loadUnitWith(filename, playerConfig)));

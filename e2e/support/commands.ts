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

Cypress.Commands.add('openPlayer', () => {
  cy.visit('http://localhost:4202/');
});

Cypress.Commands.add('openEditor', () => {
  cy.visit('http://localhost:4201/');
});

Cypress.Commands.add('switchToTabbedViewMode', () => {
  cy.get('[data-cy="extras-menu"]').click();
  cy.contains('Seitenansicht untereinander').click();
  cy.get('body').click();
});

Cypress.Commands.add('loadUnit', (filename: string) => {
  cy.fixture(filename).then(unit => {
    cy.get('aspect-unit', { timeout: 10000 }).should('exist');
    cy.window().then(window => {
      const postMessage = {
        type: 'vopStartCommand',
        unitDefinition: JSON.stringify(unit)
      };
      window.postMessage(postMessage, '*');
      // Retry once to avoid race conditions while the player message subscription initializes.
      return Cypress.Promise.delay(150).then(() => {
        window.postMessage(postMessage, '*');
      });
    });
    cy.get('body', { timeout: 10000 }).then($body => {
      const errorDialog = $body.find('mat-dialog-container');
      if (errorDialog.length > 0) {
        throw new Error(`Player rejected unit definition: ${errorDialog.text().trim()}`);
      }
    });
  });
});

Cypress.Commands.add('loadUnitWithPrintMode', (filename: string, printMode: 'off' | 'on' | 'on-with-ids') => {
  cy.fixture(filename).then(unit => {
    cy.get('aspect-unit', { timeout: 10000 }).should('exist');
    cy.window().then(window => {
      const postMessage = {
        type: 'vopStartCommand',
        unitDefinition: JSON.stringify(unit),
        playerConfig: { printMode }
      };
      window.postMessage(postMessage, '*');
      return Cypress.Promise.delay(150).then(() => {
        window.postMessage(postMessage, '*');
      });
    });
    cy.get('body', { timeout: 10000 }).then($body => {
      const errorDialog = $body.find('mat-dialog-container');
      if (errorDialog.length > 0) {
        throw new Error(`Player rejected unit definition: ${errorDialog.text().trim()}`);
      }
    });
  });
});

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
    .first()
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
    cy.stub(win.document, 'createElement').callsFake((tagName: string, ...args: any[]) => {
      const el = originalCreateElement(tagName, ...args);
      if (tagName.toLowerCase() === 'input') {
        const originalClick = el.click.bind(el);
        el.click = () => {
          win.document.body.appendChild(el);
          originalClick();
        };
      }
      return el;
    });
  });
});

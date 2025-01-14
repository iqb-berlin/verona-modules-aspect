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
//     }
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
  cy.fixture(filename).as('unit').then(unit => {
    cy.window().then(window => {
      const postMessage = {
        type: 'vopStartCommand',
        unitDefinition: JSON.stringify(unit)
      };
      window.postMessage(postMessage, '*');
    });
  });
});

Cypress.Commands.add('saveUnit', (filepath: string = 'e2e/downloads/export.json') => {
  cy.contains('Unit speichern').click();
  cy.get('a[download]')
    .then(anchor => (
      new Cypress.Promise((resolve, reject) => {
        // Use XHR to get the blob that corresponds to the object URL.
        const xhr = new XMLHttpRequest();
        xhr.open('GET', anchor.prop('href'), true);
        xhr.responseType = 'blob';

        // Once loaded, use FileReader to get the string back from the blob.
        xhr.onload = () => {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const reader = new FileReader();
            reader.onload = () => {
              // Once we have a string, resolve the promise to let
              // the Cypress chain continue, e.g. to assert on the result.
              resolve(reader.result);
              cy.writeFile(filepath, reader.result as string);
            };
            reader.readAsText(blob);
          }
        };
        xhr.send();
      })
    ));
});

Cypress.Commands.add('getByAlias', (alias: string) => {
  return cy.get(`[data-list-alias="${alias}"]`);
});

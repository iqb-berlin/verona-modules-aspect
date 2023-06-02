export {};

declare global {
  namespace Cypress {
    interface Chainable {
      loadUnit(value: string): Chainable<JQuery<HTMLElement>>;
      openPlayer(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

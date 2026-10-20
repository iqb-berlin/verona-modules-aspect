import type { PlayerConfigOptions } from '../../support/index';

type NavigationTargets = PlayerConfigOptions['enabledNavigationTargets'];

const BUTTON_LABELS = ['Auf der Seite', 'Im Lückentext'];

function navigationButtons(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-button').filter((_, button) => BUTTON_LABELS.includes((button.textContent || '').trim()));
}

function expectButtons(visible: boolean): void {
  BUTTON_LABELS.forEach(label => {
    cy.contains('aspect-button', label).should(visible ? 'be.visible' : 'not.be.visible');
  });
}

function sendNavigationTargets(enabledNavigationTargets: NavigationTargets): void {
  cy.window().then(win => {
    win.postMessage({
      type: 'vopPlayerConfigChangedNotification',
      playerConfig: { enabledNavigationTargets }
    }, '*');
  });
}

/* A button for unit navigation is offered only while the host allows its target. The same button
   is placed on the page and in a cloze: the children of a cloze are hidden in code rather than in a
   template and once followed the opposite rule (#1583). */
describe('Enabled navigation targets', () => {
  it('follows the targets the host sends at the start and while the unit runs', () => {
    cy.openPlayer();
    cy.loadUnitWithOptions('unit-navigation-targets.json', { enabledNavigationTargets: ['previous'] });
    navigationButtons().should('have.length', BUTTON_LABELS.length);
    expectButtons(false);

    sendNavigationTargets(['next']);
    expectButtons(true);

    sendNavigationTargets([]);
    expectButtons(false);

    sendNavigationTargets(undefined);
    expectButtons(true);
  });
});

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
  const cases: { targets: NavigationTargets; visible: boolean }[] = [
    { targets: undefined, visible: true },
    { targets: ['next'], visible: true },
    { targets: ['next', 'previous'], visible: true },
    { targets: [], visible: false },
    { targets: ['previous'], visible: false }
  ];

  cases.forEach(({ targets, visible }) => {
    it(`${visible ? 'shows' : 'hides'} the buttons for "next" when started with ${JSON.stringify(targets)}`, () => {
      cy.openPlayer();
      cy.loadUnitWithOptions('unit-navigation-targets.json', { enabledNavigationTargets: targets });
      navigationButtons().should('have.length', BUTTON_LABELS.length);

      expectButtons(visible);
    });
  });

  it('follows the targets the host changes while the unit runs', () => {
    cy.openPlayer();
    cy.loadUnitWithOptions('unit-navigation-targets.json', {});
    navigationButtons().should('have.length', BUTTON_LABELS.length);
    expectButtons(true);

    sendNavigationTargets([]);
    expectButtons(false);

    sendNavigationTargets(['next']);
    expectButtons(true);

    sendNavigationTargets(['previous']);
    expectButtons(false);

    sendNavigationTargets(undefined);
    expectButtons(true);
  });
});

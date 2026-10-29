import type { PlayerConfigOptions } from '../../support';

/* The host can change the paging mode while a unit runs, with a vopPlayerConfigChangedNotification (#1584). Each
   step below switches the mode of the same running unit. The message arrives after the next command has started,
   so every step first waits for a sign that only the new mode has, and checks the rest against that view; checked
   first, they would pass on the view of the step before. The steps build on each other, so the spec keeps its page
   between them. */

/** Sends the host's config change. The player takes it as the whole new config, so only the paging mode is set. */
function changePagingMode(pagingMode: PlayerConfigOptions['pagingMode']): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'vopPlayerConfigChangedNotification', sessionId: 'dev', playerConfig: { pagingMode }
    }, '*');
  });
}

/** The tabs of `separate` and `buttons` show one page at a time. A tab renders its page only once it has been
    shown, so the other page may be hidden or not there at all. */
function expectOnePageShown(): void {
  cy.get('[data-element-alias^="seite_"]:visible').should('have.length', 1);
}

describe('Changing the paging mode while a unit runs', { testIsolation: false }, () => {
  before(() => {
    cy.openPlayer();
    cy.loadUnitWithOptions('paging-mode.json', { pagingMode: 'separate' });
  });

  // Cypress sets the viewport back before every test.
  beforeEach(() => {
    cy.viewport(1600, 900);
  });

  it('starts in separate mode', () => {
    cy.get('aspect-pages-layout mat-tab-group').should('exist').and('not.have.class', 'buttons-mode');
    cy.get('aspect-page-nav-button').should('not.exist');
    cy.getElementByAlias('seite_1').should('be.visible');
    expectOnePageShown();
  });

  it('switches to buttons', () => {
    changePagingMode('buttons');
    cy.get('aspect-pages-layout mat-tab-group').should('have.class', 'buttons-mode');
    cy.get('aspect-page-nav-button[direction="next"]').should('exist');
    expectOnePageShown();
  });

  /* Both pages are short enough to be on the screen together. */
  it('switches to concat-scroll', () => {
    changePagingMode('concat-scroll');
    cy.get('aspect-pages-layout mat-tab-group').should('not.exist');
    cy.get('.concat-scroll-snap, .concat-scroll-snap-align').should('not.exist');
    cy.get('aspect-page-nav-button').should('not.exist');
    cy.get('[data-element-alias^="seite_"]:visible').should('have.length', 2);
  });

  /* In snap mode every page is as high as the screen, so only the first one is in view; that both are there, one
     below the other, shows in the pages that snap. */
  it('switches to concat-scroll-snap', () => {
    changePagingMode('concat-scroll-snap');
    cy.get('aspect-page-scroll-button.concat-scroll-snap').should('exist');
    cy.get('aspect-pages-layout mat-tab-group').should('not.exist');
    cy.get('.concat-scroll-snap-align').should('have.length', 2);
  });

  /* Each page that comes into view in a concatenated view becomes the current page, so the tabs may open on either
     of them. */
  it('switches back to separate', () => {
    changePagingMode('separate');
    cy.get('aspect-pages-layout mat-tab-group').should('exist').and('not.have.class', 'buttons-mode');
    cy.get('.concat-scroll-snap, .concat-scroll-snap-align').should('not.exist');
    cy.get('aspect-page-nav-button').should('not.exist');
    expectOnePageShown();
  });
});

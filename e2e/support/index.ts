export { };

/* The player options the suite passes to a vopStartCommand. e2e holds no imports from projects/,
   so the ones it sets are named here. */
export interface PlayerConfigOptions {
  pagingMode?: 'separate' | 'buttons' | 'concat-scroll' | 'concat-scroll-snap';
  printMode?: 'off' | 'on' | 'on-with-ids';
  logPolicy?: 'lean' | 'rich' | 'debug' | 'disabled';
}

declare global {
  // Cypress declares Chainable inside a namespace, so augmenting it needs one too.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loadUnit(value: string): Chainable<JQuery<HTMLElement>>;
      saveUnit(filepath?: string): Chainable<JQuery<HTMLElement>>;
      openPlayer(): Chainable<JQuery<HTMLElement>>;
      openEditor(): Chainable<JQuery<HTMLElement>>;
      switchToTabbedViewMode(): Chainable<JQuery<HTMLElement>>;
      getByAlias(alias: string): Chainable<JQuery<HTMLElement>>;
      getElementByAlias(alias: string): Chainable<JQuery<HTMLElement>>;
      clickOutside(): Chainable<JQuery<HTMLElement>>;
      getElement(elementType: string, label?: string): Chainable<JQuery<HTMLElement>>;
      goToPlayerPage(pageIndex: number): Chainable<JQuery<HTMLElement>>;
      stubFileInput(): Chainable<void>;
      loadUnitWithPrintMode(filename: string, printMode: 'off' | 'on' | 'on-with-ids'): Chainable<void>;
      loadUnitWithOptions(filename: string, playerConfig: PlayerConfigOptions): Chainable<void>;
    }
  }
}

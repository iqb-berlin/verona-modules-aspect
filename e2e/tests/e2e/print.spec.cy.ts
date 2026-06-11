import { addElement, addTextElement, setID, setPreferencesElement } from '../util';

// ─────────────────────────────────────────────────────────────────────────────
// Print module – E2E tests
//
// Three printMode values are tested:
//   'off'          → normal interactive player layout (regression check)
//   'on'           → static print layout, NO element alias labels
//   'on-with-ids'  → static print layout WITH floating alias labels
// ─────────────────────────────────────────────────────────────────────────────

describe('Print module', { testIsolation: false }, () => {

  // ── Editor ──────────────────────────────────────────────────────────────────
  context('editor', () => {
    before('opens the editor', () => {
      cy.openEditor();
    });

    it('adds a Text element (print-text)', () => {
      addTextElement('Drucktext Beispiel');
      setID('print-text');
    });

    it('adds a Text-field element (print-field)', () => {
      addElement('Eingabefeld');
      setPreferencesElement('Druckfeld');
      setID('print-field');
    });

    it('adds a Checkbox element (print-checkbox)', () => {
      addElement('Kontrollkästchen');
      setID('print-checkbox');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/print.json');
    });
  });

  // ── Player: printMode 'off' (regression – normal interactive layout) ────────
  context("player: printMode 'off' (normal layout)", () => {
    before("opens player and loads unit with printMode 'off'", () => {
      cy.openPlayer();
      cy.loadUnitWithPrintMode('../downloads/print.json', 'off');
    });

    it('does NOT render the print layout', () => {
      cy.get('aspect-print-layout').should('not.exist');
    });

    it('renders the normal player layout', () => {
      cy.get('aspect-player-layout').should('exist');
    });

    it('renders the text-field in interactive form (mat-form-field)', () => {
      cy.contains('mat-form-field', 'Druckfeld').should('exist');
    });

    it('renders the text content', () => {
      cy.contains('aspect-text', 'Drucktext Beispiel').should('exist');
    });
  });

  // ── Player: printMode 'on' ───────────────────────────────────────────────────
  context("player: printMode 'on'", () => {
    before("opens player and loads unit with printMode 'on'", () => {
      cy.openPlayer();
      cy.loadUnitWithPrintMode('../downloads/print.json', 'on');
    });

    it('renders the print layout', () => {
      cy.get('aspect-print-layout').should('exist');
    });

    it('does NOT render the interactive player layout', () => {
      cy.get('aspect-player-layout').should('not.exist');
    });

    it('renders at least one print page', () => {
      cy.get('aspect-print-page').should('have.length.at.least', 1);
    });

    it('renders at least one print section', () => {
      cy.get('aspect-print-section').should('have.length.at.least', 1);
    });

    it('renders at least one print element', () => {
      cy.get('aspect-print-element').should('have.length.at.least', 1);
    });

    it('does NOT show floating alias labels (no aspect-print-label)', () => {
      // In mode 'on' the elementComponents array stays empty, so no labels are emitted
      cy.get('aspect-print-label').should('not.exist');
    });

    it('renders the text content inside the print layout', () => {
      cy.get('aspect-print-layout').contains('Drucktext Beispiel').should('exist');
    });

    it('renders the text-field inside the print layout', () => {
      cy.get('aspect-print-layout').find('aspect-text-field').should('exist');
    });

    it('renders the checkbox inside the print layout', () => {
      cy.get('aspect-print-layout').find('aspect-checkbox').should('exist');
    });

    it('print-element wrappers carry data-element-alias attributes', () => {
      cy.get('aspect-print-element [data-element-alias="print-text"]').should('exist');
      cy.get('aspect-print-element [data-element-alias="print-field"]').should('exist');
      cy.get('aspect-print-element [data-element-alias="print-checkbox"]').should('exist');
    });
  });

  // ── Player: printMode 'on-with-ids' ─────────────────────────────────────────
  context("player: printMode 'on-with-ids'", () => {
    before("opens player and loads unit with printMode 'on-with-ids'", () => {
      cy.openPlayer();
      cy.loadUnitWithPrintMode('../downloads/print.json', 'on-with-ids');
    });

    it('renders the print layout', () => {
      cy.get('aspect-print-layout').should('exist');
    });

    it('does NOT render the interactive player layout', () => {
      cy.get('aspect-player-layout').should('not.exist');
    });

    it('renders at least one print page', () => {
      cy.get('aspect-print-page').should('have.length.at.least', 1);
    });

    it('shows floating alias labels (aspect-print-label exists)', () => {
      // Labels are rendered via CdkConnectedOverlay and land in .cdk-overlay-container
      cy.get('aspect-print-label', { timeout: 5000 }).should('exist');
    });

    it('floating labels show the alias of the text element', () => {
      cy.get('.cdk-overlay-container').contains('.element-label', 'print-text').should('exist');
    });

    it('floating labels show the alias of the text-field element', () => {
      cy.get('.cdk-overlay-container').contains('.element-label', 'print-field').should('exist');
    });

    it('floating labels show the alias of the checkbox element', () => {
      cy.get('.cdk-overlay-container').contains('.element-label', 'print-checkbox').should('exist');
    });

    it('print-element wrappers carry data-element-alias attributes', () => {
      cy.get('aspect-print-element [data-element-alias="print-text"]').should('exist');
      cy.get('aspect-print-element [data-element-alias="print-field"]').should('exist');
      cy.get('aspect-print-element [data-element-alias="print-checkbox"]').should('exist');
    });

    it('print-element wrappers carry data-element-id attributes', () => {
      cy.get('aspect-print-element [data-element-id]')
        .should('have.length.at.least', 3);
    });
  });
});

import { addElement, setCheckbox, switchToPositionTab } from '../util';
import {
    createTable,
    openTableEditDialog,
    addTableCellElement,
    saveTableEditDialog
} from './helpers/table-util';

describe('Table element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.openEditor();
        });

        it('creates a default 2x2 table without borders', () => {
            createTable('table-default', 2, 2, false);
        });

        it('presets the bottom margin of a new table with 30px', () => {
            // The raw-number registry default used to reach the position group unconverted,
            // leaving new tables without their bottom margin until the next reload (#1061)
            switchToPositionTab();
            cy.contains('aspect-size-input-panel', 'unten').find('input[type="number"]')
                .should('have.value', '30');
            // Switch the properties panel back to the model tab for the following tests
            cy.get('.mat-mdc-tab').contains('mat-icon', 'build').click({ force: true });
        });

        it('does not show add/remove buttons on the canvas', () => {
            // Add/remove buttons must only appear in the "Elemente anpassen" dialog,
            // where their events are handled (#1053, #1060)
            cy.get('aspect-table').should('exist');
            cy.get('aspect-table button').should('not.exist');
        });

        it('creates a 2x3 table with borders and adds child elements', () => {
            addElement('Tabelle', 'Verbund', 'table-with-content');

            // Wait for properties panel to reflect the new element
            cy.get('aspect-ui-element-properties')
                .contains('mat-form-field', 'ID').find('input').should('have.value', 'table-with-content');

            // Add a third column
            cy.get('aspect-table-properties')
                .contains('mat-form-field', 'Anzahl der Spalten')
                .find('input')
                .clear()
                .type('3{enter}');

            // Enable table borders
            setCheckbox('Tabellenränder zeichnen');

            // Open the cell-content dialog
            openTableEditDialog();

            // Add a text element in cell row=1, col=1
            addTableCellElement('Text', 1, 1);

            // Add a text-field in cell row=1, col=2
            addTableCellElement('Eingabefeld', 1, 2);

            // Add a checkbox in cell row=2, col=1
            addTableCellElement('Kontrollkästchen', 2, 1);

            saveTableEditDialog();
        });

        it('updates the canvas checkbox display when toggling its preset value', () => {
            // Select the checkbox child element on the canvas
            cy.get('aspect-table aspect-checkbox').closest('.wrapper').click();

            cy.get('aspect-ui-element-properties mat-button-toggle-group')
                .contains('mat-button-toggle', 'wahr').click();
            cy.get('aspect-table aspect-checkbox .svg-checkbox-cross')
                .should('have.attr', 'style').and('match', /opacity: 1/);

            // Reset, so the player tests below start with an unchecked checkbox
            cy.get('aspect-ui-element-properties mat-button-toggle-group')
                .contains('mat-button-toggle', 'falsch').click();
            cy.get('aspect-table aspect-checkbox .svg-checkbox-cross')
                .should('have.attr', 'style').and('match', /opacity: 0/);
        });

        after('saves unit definition', () => {
            cy.saveUnit('e2e/downloads/table.json');
        });
    });

    context('player', () => {
        before('opens player and loads unit', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/table.json');
        });

        it('renders two table elements', () => {
            cy.get('aspect-table').should('have.length', 2);
        });

        // ── First table (2×2, no edges) ──────────────────────────────────────────
        it('first table (no borders) has no top border on first row cells', () => {
            cy.get('aspect-table').eq(0)
                .find('.cell-container')
                .first()
                .should('have.css', 'border-top-style', 'none');
        });

        it('first table (no borders) has no left border on first column cells', () => {
            cy.get('aspect-table').eq(0)
                .find('.cell-container')
                .first()
                .should('have.css', 'border-left-style', 'none');
        });

        // ── Second table (2×3, borders enabled) ──────────────────────────────────
        it('second table (edges enabled) has solid left border on first column cell', () => {
            // Per the template logic: border-left is none when (j > 0) regardless of tableEdgesEnabled.
            // The leftmost column (j=0, i.e. .eq(0)) gets solid left border only when tableEdgesEnabled=true.
            cy.get('aspect-table').eq(1)
                .find('.cell-container')
                .eq(0)
                .should('have.css', 'border-left-style', 'solid');
        });

        it('second table contains a text element', () => {
            cy.get('aspect-table').eq(1)
                .find('aspect-text').should('have.length', 1);
        });

        it('second table contains a text-field and allows typing', () => {
            cy.get('aspect-table').eq(1)
                .find('aspect-text-field')
                .should('have.length', 1)
                .find('input')
                .type('Tabelleneintrag');

            cy.get('aspect-table').eq(1)
                .find('aspect-text-field')
                .find('input')
                .should('have.value', 'Tabelleneintrag');
        });

        it('shows an inset focus ring on the focused table text-field', () => {
            // The ring must lie inside the cell, otherwise neighboring cells cover it (#1069).
            // It is drawn by coloring the always-present transparent border, because an
            // inset outline leaves 1px gaps to the table lines in Firefox (#1091).
            cy.get('aspect-table').eq(1)
                .find('aspect-text-field input')
                .blur({ force: true })
                .should('have.css', 'border-style', 'solid')
                .and('have.css', 'border-width', '2px')
                .and('have.css', 'border-color', 'rgba(0, 0, 0, 0)');

            cy.get('aspect-table').eq(1)
                .find('aspect-text-field input')
                .focus()
                .should('have.css', 'outline-style', 'none')
                // indigo-pink theme primary, like the focused mat-form-field
                .and('have.css', 'border-color', 'rgb(63, 81, 181)');
        });

        it('second table contains a checkbox and allows checking', () => {
            cy.get('aspect-table').eq(1)
                .find('aspect-checkbox')
                .find('.svg-checkbox-cross')
                .click({ force: true });

            cy.get('aspect-table').eq(1)
                .find('aspect-checkbox')
                .find('.svg-checkbox-cross')
                .should('have.attr', 'style')
                .and("match", /opacity: 1;/);
        });

        it('unchecks the checkbox in the second table', () => {
            cy.get('aspect-table').eq(1)
                .find('aspect-checkbox')
                .find('.svg-checkbox-cross')
                .click({ force: true });

            cy.get('aspect-table').eq(1)
                .find('aspect-checkbox')
                .find('.svg-checkbox-cross')
                .should('have.attr', 'style')
                .and("match", /opacity: 0;/);
        });
    });
});

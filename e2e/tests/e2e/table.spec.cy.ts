import { addElement, setCheckbox } from '../util';
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

        it('creates a 2x3 table with borders and adds child elements', () => {
            addElement('Tabelle', 'Verbund', 'table-with-content');

            // Wait for properties panel to reflect the new element
            cy.get('aspect-element-model-properties-component')
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

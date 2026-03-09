import { addElement, setCheckbox } from '../../util';

/**
 * Creates a table element in the editor.
 *
 * @param id              Element alias to assign
 * @param rows            Number of rows (default: 2)
 * @param cols            Number of columns (default: 2)
 * @param edgesEnabled    Whether to enable table border rendering
 */
export function createTable(
    id: string,
    rows: number = 2,
    cols: number = 2,
    edgesEnabled: boolean = false
): void {
    addElement('Tabelle', 'Verbund', id);

    // Wait for properties panel to reflect the new element
    cy.get('aspect-element-model-properties-component')
        .contains('mat-form-field', 'ID').find('input').should('have.value', id);

    // Adjust row count if needed (default is 2)
    if (rows !== 2) {
        cy.get('aspect-table-properties')
            .contains('mat-form-field', 'Anzahl der Zeilen')
            .find('input')
            .clear()
            .type(`${rows}{enter}`);
    }

    // Adjust column count if needed (default is 2)
    if (cols !== 2) {
        cy.get('aspect-table-properties')
            .contains('mat-form-field', 'Anzahl der Spalten')
            .find('input')
            .clear()
            .type(`${cols}{enter}`);
    }

    if (edgesEnabled) {
        setCheckbox('Tabellenränder zeichnen');
    }
}

/**
 * Opens the "Elemente anpassen" dialog for the currently selected table element.
 */
export function openTableEditDialog(): void {
    cy.get('aspect-table-properties').contains('button', 'Elemente anpassen').click();
    cy.get('mat-dialog-container').should('be.visible');
}

/**
 * Adds an element inside the table edit dialog at the given 1-based grid position.
 * Relies on the CSS grid-row-start / grid-column-start inline styles set by the component.
 *
 * @param elementLabel   German label shown in the context-menu (e.g. 'Text', 'Eingabefeld', 'Kontrollkästchen')
 * @param row            1-based row index (matching CSS gridRowStart)
 * @param col            1-based column index (matching CSS gridColumnStart)
 */
export function addTableCellElement(elementLabel: string, row: number, col: number): void {
    cy.get('mat-dialog-content aspect-table .cell-container')
        .filter((_index, el) => {
            const style = (el as HTMLElement).style;
            return style.gridRowStart === String(row) && style.gridColumnStart === String(col);
        })
        .find('button[mat-mini-fab]')
        .click();
    cy.get('.cdk-overlay-container').contains('button', elementLabel).click();
}

/**
 * Saves/closes the table edit dialog.
 */
export function saveTableEditDialog(): void {
    cy.get('mat-dialog-actions').contains('button', 'Speichern').click();
    cy.get('mat-dialog-container').should('not.exist');
}

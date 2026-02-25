import {addElement, setID} from '../util';
import {setConfigDroplist} from "./droplist-util";

export function createCloze(id: string, text: string, contentType?: string, options?:string[],
                            settings?: Record<string, boolean>, secondId?: string): void {
    addElement('Lückentext', 'Verbund', id);
    // open the cloze inline editor
    // Give some time for properties panel to catch up and ensure correct element is selected
    cy.get('aspect-element-model-properties-component')
        .contains('mat-form-field', 'ID').find('input').should('have.value', id);

    cy.get('aspect-element-model-properties-component')
        .contains('button', 'edit').click();

    // wait for dialog and replace default Lorem Ipsum text
    cy.get('.ProseMirror p').clear();
    cy.get('.ProseMirror p').type(text);
    cy.get('.ProseMirror p').type("\t");

    // insert a child via the cloze toolbar button - specifically target buttons
    if ( contentType!== undefined) {
      cy.get('mat-dialog-content').find('button').contains(contentType).click();
    }
    cy.contains('button', 'Speichern').click();
    cy.get('mat-dialog-container').should('not.exist');
    if (contentType === 'Ablegeliste') {
      cy.get('aspect-drop-list').last().click({ force: true });
      if (secondId !== undefined) {
        setID(secondId);
      }
      setConfigDroplist(options, settings);
    }
}


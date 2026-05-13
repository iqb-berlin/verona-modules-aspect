import {addElement, addTextElement, setID, uploadFile} from "../../util";

/**
 * Opens the "Medienoptionen anpassen" dialog.
 * Requires expert mode to be active first.
 */
export function editElementConfigDialog(): void {
  cy.get('aspect-element-model-properties-component')
    .contains('button', 'Medienoptionen anpassen')
    .click();
  cy.get('mat-dialog-container').should('be.visible');
}

/** Sets a numeric field inside the active mat-dialog-container. */
export function setDialogField(label: string, value: number): void {
  cy.get('mat-dialog-container')
    .contains('mat-form-field', label)
    .find('input')
    .clear()
    .type(`${value}{enter}`)
    .blur();
}

export function setDialogCheckbox(label: string, checked: boolean): void {
  cy.get('mat-dialog-container')
    .contains('mat-checkbox', label)
    .then(($matCheckbox) => {
      const isChecked = $matCheckbox.hasClass('mat-mdc-checkbox-checked') || 
                        $matCheckbox.hasClass('mat-checkbox-checked') || 
                        $matCheckbox.find('input').is(':checked');
      if (isChecked !== checked) {
        cy.wrap($matCheckbox).click({ force: true });
      }
    });
}


/**
 * Adds an audio element and immediately provides the file to the file-picker
 * that Angular opens as part of the element-creation flow.
 * Must be called with stubFileInput already set up.
 */
export function addAudioElement(title:string, filename: string,id: string): void {
  addTextElement(title);
  cy.stubFileInput();
  addElement('Audio', 'Medium');
  uploadFile(filename);
  // Wait for the element to be added to the canvas
  cy.get('aspect-element-model-properties-component').should('be.visible');
  setID(id);
}

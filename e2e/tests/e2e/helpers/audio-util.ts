import { addElement, addTextElement, setID, uploadFile } from "../../util";


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

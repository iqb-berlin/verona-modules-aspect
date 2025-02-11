import {addDescriptionOptions} from "./options-util";
import {selectFromDropdown} from "../util";

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a textfield', () => {
      // cy.contains('Eingabefeld').click();
      addDescriptionOptions('Eingabefeld','Eingabefeld A',{},'textfield1')

      // Preentered text
      cy.contains('mat-form-field', 'Vorbelegung')
        .find('input')
        .type('Hola');

      // select Aussehen
      selectFromDropdown('Aussehen', 'Ausgefüllt');
      // selectFromDropdown('Aussehen', 'Umrandet');

      // enter length
      cy.contains('mat-form-field', 'Minimallänge')
        .find('input')
        .clear()
        .clear()
        .type('4');
      cy.contains('mat-form-field', 'Maximallänge')
        .find('input')
        .clear()
        .clear()
        .type('20');
      selectFromDropdown('Eingabehilfe auswählen','Ziffern');
      selectFromDropdown('Eingabehilfeposition','rechts')
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-field-basic.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-field-basic.json');
    });

    it('s', () => {
    });
  });
});

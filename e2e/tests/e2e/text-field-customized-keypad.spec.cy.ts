import {addBasicProperties} from "../util";
import {addHelp, addMuster, addSettings} from "./text-field-util";

describe('Text field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text field with customized keypad', () => {
      addBasicProperties('Eingabefeld','Eigene Zeichen',{required:true});
      addSettings(3,20,'',{clearable:true, hasKeyboardIcon:true});
      addMuster('ö12');
      addHelp('Eigene Zeichen', 'rechts', undefined, "öäü12" );
    });
    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-field-customized-keypad.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-field-customized-keypad.json');
    });

    it('clicks at the text field, and appears the keypad with customized characters', () => {
      cy.get('aspect-keypad').should('not.exist');
      cy.contains('mat-form-field','Eigene Zeichen').click();
      cy.get('aspect-keypad').contains('ö').should('exist');
      cy.get('aspect-keypad').contains('p').should('not.exist')
    });

    it('types the wrong answer', () => {
      cy.contains('mat-form-field','Eigene Zeichen')
        .find('input')
        .clear()
        .type('4444{enter}');
      cy.contains('mat-form-field','Eigene Zeichen')
        .find('mat-error').should('exist');
    });

    it('types the correct answer', () => {
      cy.contains('mat-form-field','Eigene Zeichen')
        .find('input')
        .clear()
        .type('ö12{enter}');
      cy.contains('mat-form-field','Eigene Zeichen')
        .find('mat-error').should('not.exist');
    });
  });
});

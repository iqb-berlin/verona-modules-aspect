
import {
  addOption,
  selectFromDropdown,
  setCheckbox,
  setPreferencesElement
} from '../util';
import {addRadioElement} from "./helpers/radio-util";

describe('Radio element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a common radio group with two options', () => {
      addRadioElement();
      setPreferencesElement('Optionsfelder');
      addOption('Ja');
      addOption('Nein');
    });

    it('creates a readonly radio group', () => {
      addRadioElement();
      setPreferencesElement('Optionsfelder mit Schreibschutz', { readOnly: true });
      addOption('Option A');
      addOption('Option B');
    });

    it('creates a required radio group with a custom warning', () => {
      addRadioElement();
      setPreferencesElement('Optionsfelder Pflichtfeld', { required: true });
      addOption('Eins');
      addOption('Zwei');
      cy.contains('mat-form-field', 'Warnmeldung')
        .find('input')
        .clear()
        .type('Bitte eine Option auswählen');
    });

    it('creates a radio group that strikes other options on selection', () => {
      addRadioElement();
      setPreferencesElement('Optionsfelder mit Durchstreichen');
      addOption('Alpha');
      addOption('Beta');
      addOption('Gamma');
      setCheckbox('Nicht gewählte Optionen durchstreichen');
    });

    it('creates a radio group with horizontal alignment', () => {
      addRadioElement();
      setPreferencesElement('Optionsfelder horizontal');
      addOption('Links');
      addOption('Rechts');
      selectFromDropdown('Ausrichtung', 'horizontal');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/radio.json');
    });
  });

  context('player', () => {
    before('opens player and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/radio.json');
    });

    it('renders all five radio groups', () => {
      cy.get('aspect-radio-button-group').should('have.length', 5);
    });

    it('selects an option in the common radio group', () => {
      cy.contains('aspect-radio-button-group', 'Optionsfelder')
        .find('mat-radio-button input').first()
        .click();
      cy.contains('aspect-radio-button-group', 'Optionsfelder')
        .find('mat-radio-button').first()
        .should('have.class', 'mat-mdc-radio-checked');
    });

    it('checks that the readonly radio group cannot be changed', () => {
      cy.contains('aspect-radio-button-group', 'Optionsfelder mit Schreibschutz')
        .find('mat-radio-button').first()
        .should('have.css', 'pointer-events', 'none');
    });

    it('shows error on required radio group when untouched', () => {
      cy.contains('aspect-radio-button-group', 'Optionsfelder Pflichtfeld')
        .find('mat-radio-button input').first()
        .focus()
        .blur();
      cy.contains('aspect-radio-button-group', 'Optionsfelder Pflichtfeld')
        .find('mat-error')
        .contains('Bitte eine Option auswählen');
    });

    it('selects option and other options get struck through', () => {
      cy.contains('aspect-radio-button-group', 'Optionsfelder mit Durchstreichen')
        .find('mat-radio-button input').eq(1)
        .click();
      cy.wait(100);
      cy.contains('aspect-radio-button-group', 'Optionsfelder mit Durchstreichen')
        .find('mat-radio-button').first()
        .should('have.class', 'strike');
      cy.contains('aspect-radio-button-group', 'Optionsfelder mit Durchstreichen')
        .find('mat-radio-button').eq(2)
        .should('have.class', 'strike');
    });

    it('renders horizontal radio group with row layout', () => {
      cy.contains('aspect-radio-button-group', 'Optionsfelder horizontal')
        .find('mat-radio-group')
        .should('have.css', 'flex-direction', 'row');
    });
  });
});

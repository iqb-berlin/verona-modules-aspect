import { addElement, setPreferencesElement, addNewPage } from '../util';
import { setRegexPattern, setPreferences, validateTextField, setInputAssistance } from './helpers/text-field-util';

describe('Text field element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.viewport(1600, 900);
            cy.openEditor();
        });

        // ── Page 1: basic tests ──────────────────────────────────────────────────
        it('creates a readonly text field (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Eingabefeld mit Schreibschutz', { readOnly: true });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Readonly');
        });

        it('creates a required text field (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Pflichtfeld Eingabefeld', { required: true });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Required');
        });

        it('creates a text field with a minimum length of 3 characters (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Minimallänge 3');
            setPreferences({ minLength: 3 });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Min3');
        });

        it('creates a text field with a maximum length of 10 characters (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Maximallänge 10');
            setPreferences({ maxLength: 10, settings: { isLimitedToMaxLength: true } });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Max10');
        });

        it('creates a text field with clear option (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Löschtaste');
            setPreferences({ settings: { clearable: true } });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Clear');
        });

        it('creates a text field that accepts only the pattern 1[a-z]000 (Page 1)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('1[a-z]000 Muster');
            setRegexPattern('1[a-z]000');
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Regex');
        });

        // ── Page 2: customized keypad ─────────────────────────────────────────────
        it('creates a text field with customized keypad (Page 2)', () => {
            addNewPage();
            addElement('Eingabefeld');
            setPreferencesElement('Eigene Zeichen', { required: true });
            setInputAssistance('Eigene Zeichen', 'rechts', '12345');
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_Keypad');
        });

        it('creates a text field with the same customized keypad disabling other characters (Page 2)', () => {
            addElement('Eingabefeld');
            setPreferencesElement('Eigene Zeichen (Restricted)', { required: true });
            setInputAssistance('Eigene Zeichen', 'rechts', '12345', { disableOtherCharacters: true });
            cy.get('aspect-element-model-properties-component').contains('mat-form-field', 'ID').find('input').clear().type('TF_KeypadRest');
        });

        after('save an unit definition', () => {
            cy.saveUnit('e2e/downloads/text-field.json');
        });
    });

    context('player', () => {
        before('opens a player, and loads the previously saved json file', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/text-field.json');
        });

        // ── Page 1 Player Tests ──────────────────────────────────────────────────
        it('checks readonly text field (Page 1)', () => {
            cy.get('aspect-page-scroll-button').eq(0).click();
            cy.contains('mat-form-field', 'Eingabefeld mit Schreibschutz')
                .find('input')
                .should('have.attr', 'readonly');
        });

        it('checks required text field (Page 1)', () => {
            cy.contains('mat-form-field', 'Pflichtfeld Eingabefeld').click();
            cy.clickOutside();
            cy.contains('mat-form-field', 'Pflichtfeld Eingabefeld')
                .find('mat-error').should('exist')
                .contains('Eingabe erforderlich');
        });

        it('checks minimal length warning (Page 1)', () => {
            cy.contains('mat-form-field', 'Minimallänge 3')
                .find('mat-error').should('not.exist');
            validateTextField('Minimallänge 3', '12', 'Eingabe zu kurz');
        });

        it('checks maximal length warning (Page 1)', () => {
            cy.contains('mat-form-field', 'Maximallänge 10')
                .find('mat-error').should('not.exist');
            validateTextField('Maximallänge 10', '12345678910', 'Eingabe zu lang');
        });

        it('checks regex of the text field (Page 1)', () => {
            cy.contains('mat-form-field', '1[a-z]000 Muster')
                .find('mat-error').should('not.exist');
            validateTextField('1[a-z]000 Muster', '6000', 'Eingabe entspricht nicht der Vorgabe');
            validateTextField('1[a-z]000 Muster', '1a000');
        });

        it('checks clear button (Page 1)', () => {
            cy.contains('mat-form-field', 'Löschtaste')
                .find('button:contains("close")').should('exist');
        });

        // ── Page 2 Player Tests ──────────────────────────────────────────────────
        it('checks customized keypad characters (Page 2)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 2').click();

            cy.get('aspect-keypad').should('not.exist');
            cy.contains('mat-form-field', 'Eigene Zeichen').click();
            cy.get('aspect-keypad').contains('1').should('exist');
            cy.get('aspect-keypad').contains('7').should('not.exist');
        });

        it('allows restricted characters in the first field (Page 2)', () => {
            cy.contains('mat-form-field', 'Eigene Zeichen')
                .find('input')
                .clear()
                .type('7777{enter}');
            // Focus another field 
            cy.contains('mat-form-field', 'Eigene Zeichen (Restricted)').click();
            cy.contains('mat-form-field', 'Eigene Zeichen')
                .find('mat-error').should('not.exist');
        });

        it('prevents restricted characters in the second field (Page 2)', () => {
            cy.contains('mat-form-field', 'Eigene Zeichen (Restricted)')
                .find('input')
                .clear()
                .type('7777{enter}');
            // Focus another field
            cy.contains('mat-form-field', 'Eigene Zeichen').click();
            cy.contains('mat-form-field', 'Eigene Zeichen (Restricted)')
                .find('mat-error').should('contain.text', 'Eingabe erforderlich');
        });
    });
});

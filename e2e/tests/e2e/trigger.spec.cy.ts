import { selectFromDropdown, setLabelText } from '../util';
import { addText, modifyText } from './text-util';

describe('Trigger element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.openEditor();
        });

        it('creates a text element with three paragraphs and marking mode enabled', () => {
            addText(2, 1, 1, 'Bereich', { highlightableYellow: true });
        });

        it('creates a trigger with "highlight text" action', () => {
            const sectionName = modifyText(2, { highlightSection: 'zweiter-abschnitt' });
          cy.contains('Speichern').click();
            cy.contains('Sonstige').click();
            cy.contains('button', 'Auslöser').click();
            cy.pause();
            selectFromDropdown('Aktion', 'Text markieren');
            selectFromDropdown('Aktionsparameter', sectionName!);
            setLabelText('Auslöser Markierung');
            cy.pause();
        });

        it.skip('creates a trigger with "remove highlights" action', () => {
            cy.contains('button', 'Auslöser').click();
            selectFromDropdown('Aktion', 'Markierungen entfernen');
            setLabelText('Auslöser Entfernen');
        });

        it('creates a trigger with "state variable change" action', () => {
            cy.contains('button', 'Auslöser').click();
            selectFromDropdown('Aktion', 'Variable ändern');
            setLabelText('Auslöser Variable');
        });

        after('saves unit definition', () => {
            cy.saveUnit('e2e/downloads/trigger.json');
        });
    });

    context('player', () => {
        before('opens a player and loads the saved unit', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/trigger.json');
        });

        it('renders exactly 3 trigger elements', () => {
            cy.get('aspect-trigger').should('have.length', 3);
        });

        it('renders the "highlight text" trigger', () => {
            cy.contains('aspect-trigger', 'Auslöser Markierung').should('exist');
        });

        it('renders the "remove highlights" trigger', () => {
            cy.contains('aspect-trigger', 'Auslöser Entfernen').should('exist');
        });

        it('renders the "state variable change" trigger', () => {
            cy.contains('aspect-trigger', 'Auslöser Variable').should('exist');
        });

        it('renders the text element with three markable paragraphs', () => {
            cy.get('aspect-text-group-element').should('exist');
            cy.get('aspect-markable-word').should('have.length.greaterThan', 0);
        });
    });
});

import { addMarkingPanel } from './helpers/marking-panel-util';
import { addTextElement, setID, selectFromDropdown, addNewPage } from '../util';
import { connectToMarkingPanels, generateRandomText } from './helpers/text-util';

describe('Marking Panel element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.openEditor();
        });

        it('creates a marking panel with orange and turquoise', () => {
            addMarkingPanel({ yellow: false, orange: true, turquoise: true }, 'MP_1');
        });

        it('creates a text element and links it to MP_1', () => {
            addTextElement(generateRandomText(1, 2));
            setID('text_1');
            connectToMarkingPanels(['MP_1']);
            selectFromDropdown('Markierungsmodus', 'Bereich');
        });

        it('creates a marking panel with all buttons', () => {
            addNewPage();
            addMarkingPanel({ yellow: true, orange: true, turquoise: true }, 'MP_ALL');
        });

        it('creates a marking panel with minimal buttons (Yellow only)', () => {
            addNewPage();
            addMarkingPanel({ yellow: true, orange: false, turquoise: false }, 'MP_MIN');
        });

        after('save an unit definition', () => {
            cy.saveUnit('e2e/downloads/marking-panel.json');
        });
    });

    context('player', () => {
        before('opens a player, and loads the previously saved json file', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/marking-panel.json');
        });

        it('checks marking panel MP_1 buttons', () => {
            cy.get('aspect-page-scroll-button').eq(0).click();
            cy.getElementByAlias('MP_1').find('button.marking-button').should('have.length', 3); // Orange, Turquoise, Delete
        });

        it('marks text using MP_1', () => {
            // Select Orange from the panel
            cy.getElementByAlias('MP_1').find('button.marking-button').eq(1).click();

            // Verify that words became "active"
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(2)
                .find('span')
                .should('have.class', 'is-active');

            // Mark a range
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(2).click();
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(4).click();

            // Verify marking (orange color) on the span
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(2)
                .find('span')
                .should('have.css', 'background-color', 'rgb(255, 160, 106)');
        });

        it('deletes marking using MP_1', () => {
            // Select Delete from the panel
            cy.getElementByAlias('MP_1').find('button.marking-button').eq(2).click();

            // Click marked word
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(2).click();
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(4).click();

            // Verify marking removed
            cy.getElementByAlias('text_1')
                .find('aspect-markable-word').eq(2)
                .find('span')
                .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)'); // or 'transparent'
        });

        it('checks MP_ALL buttons', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 2').click();
            cy.getElementByAlias('MP_ALL').find('button.marking-button').should('have.length', 4); // Yellow, Turquoise, Orange, Delete
        });

        it('checks MP_MIN buttons', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 3').click();
            cy.getElementByAlias('MP_MIN').find('button.marking-button').should('have.length', 2); // Yellow, Delete
        });
    });
});

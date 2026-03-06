import { addNewPage } from '../util';
import { addText, selectRange } from "./helpers/text-util";


describe('Text element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.openEditor();
        });

        // ── Page 1: word-selection mode ──────────────────────────────────────────
        it('creates a text element in word selection mode (page 1)', () => {
            addText(3, 2, 3, 'Wort', {
                highlightableYellow: true,
                highlightableOrange: true,
                highlightableTurquoise: true
            }, 'text-words');
        });

        // ── Page 2: range mode ───────────────────────────────────────────────────
        it('creates a text element with range mode (page 2)', () => {
            addNewPage();
            addText(3, 2, 2, 'Auswahl', {
                highlightableYellow: true,
                highlightableTurquoise: true,
                hasSelectionPopup: true
            }, 'text-range');
        });

        // ── Page 3: Bereich (selection) mode ─────────────────────────────────────
        it('creates a text element with Bereich mode (page 3)', () => {
            addNewPage();
            addText(3, 2, 2, 'Bereich', {
                highlightableYellow: true,
                highlightableTurquoise: true
            }, 'text-selection');
        });

        after('saves the unit definition', () => {
            cy.saveUnit('e2e/downloads/text.json');
        });
    });

    context('player', () => {
        before('opens a player and loads the previously saved json file', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/text.json');
        });

        // ── Page 1 tests: word-selection mode ────────────────────────────────────
        it('highlights selected words on page 1', () => {
            cy.get('aspect-page-scroll-button').eq(0).click();

            cy.getElementByAlias('text-words')
                .find('button.marking-button').eq(0).click();
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(10).click();
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(17).click();

            // select color orange and mark words 25, 30, 31
            cy.getElementByAlias('text-words')
                .find('button.marking-button').eq(2).click();
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(25).click();
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(30).click();
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(31).click();
        });

        it('removes some marked words on page 1', () => {
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(25).click();
        });

        it('changes the color of the second word to the selected color on page 1', () => {
            cy.getElementByAlias('text-words')
                .find('aspect-markable-word').eq(10).click();
        });

        // ── Page 2 tests: range mode ─────────────────────────────────────────────
        it('highlights two sections on page 2', () => {
            cy.goToPlayerPage(2);

            cy.getElementByAlias('text-range')
                .find('button.marking-button').eq(0).click();
            selectRange(40, 70, 70, 100);

            cy.getElementByAlias('text-range')
                .find('button.marking-button').eq(1).click();
            selectRange(600, 100, 640, 130);
        });

        it('removes the first marked section on page 2', () => {
            cy.getElementByAlias('text-range')
                .find('button.marking-button').eq(2).click();
            selectRange(40, 70, 70, 100);
        });

        // ── Page 3 tests: Bereich (selection) mode ───────────────────────────────
        it('highlights two selections in different colors on page 3', () => {
            cy.goToPlayerPage(3);

            // highlights in yellow
            cy.getElementByAlias('text-selection')
                .find('button.marking-button').eq(0).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(10).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(17).click();

            // highlights in turquoise
            cy.getElementByAlias('text-selection')
                .find('button.marking-button').eq(1).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(30).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(35).click();
        });

        it('removes the second highlighted selection on page 3', () => {
            cy.getElementByAlias('text-selection')
                .find('button.marking-button').eq(2).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(30).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(35).click();
        });
    });
});

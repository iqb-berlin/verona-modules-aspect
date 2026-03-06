import { addNewPage, selectFromDropdown } from '../util';
import { addList, connectLists, dragTo, dragToByTouch } from './helpers/droplist-util';

describe('Droplist element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens editor', () => {
            cy.openEditor();
        });

        // ── Page 1: basic ────────────────────────────────────────────────────────
        it('creates droplists variants (Page 1)', () => {
            addList('Startliste', ['AAA', 'BBB', 'CCC'], { highlightReceivingDropList: true }, 'Startliste');
            addList('Verbunden', [], {}, 'Verbunden');
            addList('Nicht verbunden', [], {}, 'Nichtverbunden');
            connectLists('Startliste', 'Verbunden');
        });

        // ── Page 2: copy ─────────────────────────────────────────────────────────
        it('creates several droplists with copy capability (Page 2)', () => {
            addNewPage();
            addList('Nicht Kopieren Liste', ['AAA'], {
                highlightReceivingDropList: true,
                copyOnDrop: false
            }, 'NichtKopierenListe');
            addList('Kopieren Liste', ['BBB'], {
                highlightReceivingDropList: true,
                copyOnDrop: true
            }, 'KopierenListe');
            addList('Zielliste', [], {
                highlightReceivingDropList: true
            }, 'Zielliste');

            connectLists('NichtKopierenListe', 'Zielliste');
            connectLists('Zielliste', 'NichtKopierenListe');
            connectLists('KopierenListe', 'Zielliste');
            connectLists('Zielliste', 'KopierenListe');
        });

        // ── Page 3: numeration ───────────────────────────────────────────────────
        it('creates several droplists with numeration (Page 3)', () => {
            addNewPage();
            addList('Liste ohne Nummerierung', ['AAA', 'BBB'], {}, 'Liste');
            addList('Liste mit Nummerierung', ['CCC', 'DDD'], { showNumbering: true }, 'ListeNummerierung');
            addList('Liste mit Nummerierung bei 0 beginnen', ['EEE', 'FFF'], { showNumbering: true, startNumberingAtZero: true }, 'ListeZero');
        });

        // ── Page 4: orientation ──────────────────────────────────────────────────
        it('creates several droplists with different orientations (Page 4)', () => {
            addNewPage();
            addList('Horizontal linksbündig ausgerichtete Liste', ['AAA', 'BBB'], {}, 'Liste_P4');
            selectFromDropdown('Ausrichtung', 'horizontal linksbündig');
            addList('Vertikal ausgerichtete Liste', ['CCC', 'DDD'], {}, 'VertikalListe');
            selectFromDropdown('Ausrichtung', 'vertikal');
            addList('Horizontal zentriertete ausgerichtete Liste', ['EEE', 'FFF'], {}, 'ListeZero_P4');
            selectFromDropdown('Ausrichtung', 'horizontal zentriert');
        });

        // ── Page 5: readonly ─────────────────────────────────────────────────────
        it('creates several droplists, and the second is a read only list (Page 5)', () => {
            addNewPage();
            addList('Startliste', ['AAA'], { copyElement: true }, 'Startliste_P5');
            addList('Zielliste mit Schreibschutz', [], { readOnly: true }, 'ZiellisteSchutz');
            addList('Zielliste ohne Schreibschutz', [], {}, 'Zielliste_P5');

            connectLists('Startliste_P5', 'ZiellisteSchutz');
            connectLists('Startliste_P5', 'Zielliste_P5');
            connectLists('ZiellisteSchutz', 'Startliste_P5');
            connectLists('Zielliste_P5', 'Startliste_P5');
        });

        // ── Page 6: replace ──────────────────────────────────────────────────────
        it('creates several droplists with only-one and replacement (Page 6)', () => {
            addNewPage();
            addList('Startliste 1', ['AAA'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true }, 'Startliste1');
            addList('Startliste 2', ['BBB'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true }, 'Startliste2');
            addList('Startliste 3', ['CCC'], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true }, 'Startliste3');
            addList('Zielliste', [], { highlightReceivingDropList: true, onlyOneItem: true, allowReplacement: true }, 'Zielliste_P6');

            connectLists('Startliste1', 'Zielliste_P6');
            connectLists('Startliste2', 'Startliste3');
            connectLists('Startliste2', 'Zielliste_P6');
            connectLists('Startliste3', 'Zielliste_P6');
        });

        // ── Page 7: required ─────────────────────────────────────────────────────
        it('creates several droplists, and the last is a required list (Page 7)', () => {
            addNewPage();
            addList('Startliste', ['AAA'], { copyElement: true }, 'Startliste_P7');
            addList('Zielliste ohne Pflichtfeld', [], {}, 'Zielliste_P7');
            addList('Zielliste mit Pflichtfeld', [], { required: true }, 'ZielPflicht');

            connectLists('Startliste_P7', 'Zielliste_P7');
            connectLists('Startliste_P7', 'ZielPflicht');
        });

        // ── Page 8: sortlist ─────────────────────────────────────────────────────
        it('creates droplists variants of connected lists and highlighting (Page 8)', () => {
            addNewPage();
            addList('normale Liste', ['AAA', 'BBB'], { highlightReceivingDropList: true }, 'normaleListe');
            addList('Sortierliste mit Hervorhebung', ['DDD'], { highlightReceivingDropList: true, sortList: true }, 'Sortierliste1');
            addList('Sortierliste ohne Hervorhebung', ['EEE', 'FFF', 'GGG'], { sortList: true }, 'Sortierliste2');

            connectLists('Sortierliste1', 'normaleListe');
            connectLists('Sortierliste2', 'normaleListe');
            connectLists('normaleListe', 'Sortierliste1');
        });

        after('saves unit def', () => {
            cy.saveUnit('e2e/downloads/droplist.json');
        });
    });

    context('player', () => {
        before('opens player and test unit', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/droplist.json');
        });

        // ── Page 1 tests ─────────────────────────────────────────────────────────
        it('drags to a not connected list (Page 1)', () => {
            cy.get('aspect-page-scroll-button').eq(0).click();
            dragTo('Startliste', 'AAA', 'Nichtverbunden');
            cy.getByAlias('Nichtverbunden').children().should('have.length', 0);
        });

        it('drags to connected list (Page 1)', () => {
            dragTo('Startliste', 'AAA', 'Verbunden');
            cy.getByAlias('Startliste').children().should('have.length', 2);
            cy.getByAlias('Verbunden').children().should('have.length', 1);
        });

        it('highlights lists (Page 1)', () => {
            cy.getByAlias('Startliste').find('.drop-list-item').first()
                .trigger('mousedown', { button: 0 });
            cy.getByAlias('Verbunden').should('have.class', 'isHighlighted');
            cy.getByAlias('Nichtverbunden').should('not.have.class', 'isHighlighted');
            cy.get('.drag-preview').trigger('mouseup', { force: true });

            cy.getByAlias('Verbunden').find('.drop-list-item').first()
                .trigger('mousedown', { button: 0 });
            cy.getByAlias('Startliste').should('not.have.class', 'isHighlighted');
            cy.getByAlias('Nichtverbunden').should('not.have.class', 'isHighlighted');
            cy.get('.drag-preview').trigger('mouseup', { force: true });
        });

        it('works also by using touch events (Page 1)', () => {
            dragToByTouch('Startliste', 'BBB', 'Verbunden');
            cy.getByAlias('Startliste').children().should('have.length', 1);
            cy.getByAlias('Verbunden').children().should('have.length', 2);
        });

        // ── Page 2 tests ─────────────────────────────────────────────────────────
        it('copies one element to the empty droplist (Page 2)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 2').click();

            dragTo('NichtKopierenListe', 'AAA', 'Zielliste');
            cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
            dragTo('KopierenListe', 'BBB', 'Zielliste');
            cy.getByAlias('KopierenListe').children().should('have.length', 1);
            cy.getByAlias('KopierenListe').contains('BBB');
            cy.getByAlias('Zielliste').children().should('have.length', 2);
            cy.getByAlias('Zielliste').contains('AAA');
            cy.getByAlias('Zielliste').contains('BBB');
        });

        it('puts back an element (Page 2)', () => {
            dragTo('Zielliste', 'AAA', 'KopierenListe');
            cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
            cy.getByAlias('KopierenListe').children().should('have.length', 1);
            cy.getByAlias('Zielliste').children().should('have.length', 2);

            dragTo('Zielliste', 'BBB', 'KopierenListe');
            cy.getByAlias('NichtKopierenListe').children().should('have.length', 0);
            cy.getByAlias('KopierenListe').children().should('have.length', 1);
            cy.getByAlias('Zielliste').children().should('have.length', 1);
        });

        // ── Page 3 tests ─────────────────────────────────────────────────────────
        it('checks the non numerated list (Page 3)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 3').click();
            cy.getByAlias('Liste').contains('1.').should('not.exist');
        });

        it('checks the enumerated list (Page 3)', () => {
            cy.getByAlias('ListeNummerierung').contains('1.');
            cy.getByAlias('ListeNummerierung').contains('0.').should('not.exist');
        });

        it('checks the enumerated list starting from zero (Page 3)', () => {
            cy.getByAlias('ListeZero').contains('1.');
            cy.getByAlias('ListeZero').contains('0.');
        });

        // ── Page 5 tests ─────────────────────────────────────────────────────────
        it('drags to read only list (Page 5)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 5').click();

            dragTo('Startliste_P5', 'AAA', 'ZiellisteSchutz');
            cy.getByAlias('ZiellisteSchutz').children().should('have.length', 0);

            Cypress.on('fail', (error) => {
                if (!error.message.includes('pointer-events: none')) {
                    throw error;
                }
            });
        });

        it('drags to non read only list (Page 5)', () => {
            dragTo('Startliste_P5', 'AAA', 'Zielliste_P5');
            cy.getByAlias('Zielliste_P5').children().should('have.length', 1);
            dragTo('Zielliste_P5', 'AAA', 'Startliste_P5');
            cy.getByAlias('Zielliste_P5').children().should('have.length', 0);
        });

        // ── Page 6 tests ─────────────────────────────────────────────────────────
        it('replaces items without backward connection, recursively (Page 6)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 6').click();

            dragTo('Startliste3', 'CCC', 'Zielliste_P6');
            dragTo('Startliste2', 'BBB', 'Startliste3');
            cy.getByAlias('Startliste1').children().should('have.length', 1);
            cy.getByAlias('Startliste2').children().should('have.length', 0);
            cy.getByAlias('Startliste3').children().should('have.length', 1);
            cy.getByAlias('Zielliste_P6').children().should('have.length', 1);
            dragTo('Startliste1', 'AAA', 'Zielliste_P6');
            cy.getByAlias('Startliste1').children().should('have.length', 0);
            cy.getByAlias('Startliste2').children().should('have.length', 1);
            cy.getByAlias('Startliste3').children().should('have.length', 1);
            cy.getByAlias('Zielliste_P6').children().should('have.length', 1);
            cy.getByAlias('Startliste2').contains('BBB');
            cy.getByAlias('Startliste3').contains('CCC');
            cy.getByAlias('Zielliste_P6').contains('AAA');
        });

        // ── Page 7 tests ─────────────────────────────────────────────────────────
        it('clicks the non required list (Page 7)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 7').click();
            cy.getByAlias('Zielliste_P7').click();
            cy.getByAlias('Zielliste_P7').find('mat-error').should('not.exist');
        });

        it('clicks the required list (Page 7)', () => {
            cy.getByAlias('ZielPflicht').click();
            cy.getByAlias('ZielPflicht').find('mat-error').contains('Eingabe erforderlich');
        });

        it('drags from AAA to required list (Page 7)', () => {
            dragTo('Startliste_P7', 'AAA', 'ZielPflicht');
            cy.getByAlias('ZielPflicht').find('mat-error').should('not.exist');
        });

        // ── Page 8 tests ─────────────────────────────────────────────────────────
        it('highlights list (Page 8)', () => {
            cy.get('aspect-unit-menu').find('button').click();
            cy.contains('button', 'Seite 8').click();

            cy.getByAlias('normaleListe').find('.drop-list-item').first()
                .trigger('mousedown', { button: 0 });
            cy.getByAlias('Sortierliste1').should('have.class', 'isHighlighted');
            cy.getByAlias('Sortierliste2').should('not.have.class', 'isHighlighted');
            cy.get('.drag-preview').trigger('mouseup', { force: true });

            cy.getByAlias('Sortierliste1').find('.drop-list-item').first()
                .trigger('mousedown', { button: 0 });
            cy.getByAlias('normaleListe').should('have.class', 'isHighlighted');
            cy.getByAlias('Sortierliste2').should('not.have.class', 'isHighlighted');
            cy.get('.drag-preview').trigger('mouseup', { force: true });
        });

        it('drags to connected list (Page 8)', () => {
            dragTo('normaleListe', 'AAA', 'Sortierliste2');
            cy.getByAlias('Sortierliste2').children().should('have.length', 3);
            dragTo('normaleListe', 'AAA', 'Sortierliste1');
            cy.getByAlias('normaleListe').children().should('have.length', 1);
            cy.getByAlias('Sortierliste1').children().should('have.length', 2);
        });

        it('reorders sort items (Page 8)', () => {
            cy.getByAlias('Sortierliste2').contains('.drop-list-item', 'EEE').trigger('mousedown', { button: 0 });
            cy.getByAlias('Sortierliste2').contains('.drop-list-item', 'FFF').trigger('mouseenter', { bubbles: false, force: true, button: 0 });
            cy.get('.drag-preview').trigger('mouseup', { force: true });
            cy.getByAlias('Sortierliste2').find('.drop-list-item').eq(0).contains('FFF');
            cy.getByAlias('Sortierliste2').find('.drop-list-item').eq(1).contains('EEE');
        });
    });
});

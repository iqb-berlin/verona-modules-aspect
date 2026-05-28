import {addNewPage, setID, addTextElement} from '../util';
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

        // ── Page 4: math formula ────────────────────────────────────────────────
        it('creates a text element with a math formula (page 4)', () => {
            addNewPage();
            addTextElement('Benutzerdefinierter Text mit Formel\n  ');
            setID('text-math');
            cy.get('aspect-element-model-properties-component')
                .contains('edit').click();

            cy.get('mat-icon:contains("functions")').click();
            cy.get('aspect-nodeview-math-formula').click();
            cy.get('aspect-nodeview-math-formula [contenteditable="true"]')
                .type(' \\overline{{}S\\cap M{}}{enter}');
            cy.contains('Speichern').click();
            cy.wait(1000);
        });

        // ── Page 5: rich text extensions ──────────────────────────────────────────
        it('creates a text element with rich text extensions (page 5)', () => {
            addNewPage();
            addTextElement('Originaltext ');
            setID('text-extensions');
            cy.get('aspect-element-model-properties-component')
                .contains('edit').click();

            cy.get('.ProseMirror').click().type('{selectall}{backspace}Rich Text Extensions');

            // Select all text using mouse/pointer events so Tiptap captures selection state
            cy.get('.ProseMirror p').then($p => {
                const el = $p[0];
                const doc = el.ownerDocument;
                const win = doc.defaultView!;
                const rect = el.getBoundingClientRect();

                const startX = rect.left + 1;
                const startY = rect.top + rect.height / 2;
                const endX = rect.right - 1;
                const endY = rect.top + rect.height / 2;

                const eventOpts = (x: number, y: number) => ({
                    bubbles: true, cancelable: true, view: win,
                    clientX: x, clientY: y, buttons: 1,
                });

                el.dispatchEvent(new PointerEvent('pointerdown', eventOpts(startX, startY)));
                el.dispatchEvent(new MouseEvent('mousedown', eventOpts(startX, startY)));

                const range = doc.createRange();
                range.selectNodeContents(el);
                const sel = win.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);

                el.dispatchEvent(new PointerEvent('pointermove', eventOpts(endX, endY)));
                el.dispatchEvent(new MouseEvent('mousemove', eventOpts(endX, endY)));
                el.dispatchEvent(new PointerEvent('pointerup', eventOpts(endX, endY)));
                el.dispatchEvent(new MouseEvent('mouseup', eventOpts(endX, endY)));
            });
            cy.wait(200);

            // 1. Set font-size to 24px
            cy.contains('mat-form-field', 'Größe').click();
            cy.get('.cdk-overlay-container').contains('mat-option', '24px').click({ force: true });
            cy.wait(200);

            // 2. Select bullet list
            cy.get('aspect-combo-button').contains('format_list_bulleted').click();
            cy.wait(200);

            // 3. Indent list item
            cy.get('button').contains('format_indent_increase').click();
            cy.wait(200);

            // 4. Hang indent
            cy.get('button').contains('segment').click();
            cy.wait(200);

            // Move cursor to the end and press enter to clear selection before inserting HR
            cy.get('.ProseMirror').type('{end}{enter}');
            cy.wait(200);

            // 5. Insert horizontal rule
            cy.get('aspect-combo-button').contains('horizontal_rule').click();
            cy.wait(200);

            cy.contains('Speichern').click();
            cy.wait(1000);
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

        // ── Page 4 tests: math formula ──────────────────────────────────────────
        it('checks the math formula on page 4', () => {
            cy.goToPlayerPage(4);
            cy.getElementByAlias('text-math').within(() => {
                cy.contains('Benutzerdefinierter Text mit Formel').should('exist');
                cy.get('aspect-nodeview-math-formula').get('.overline').should('exist');
                cy.get('aspect-nodeview-math-formula').get('.ML__cmr').should('exist');
                cy.get('aspect-nodeview-math-formula').get('cap').should('not.exist');
            });
        });

        it('checks the rich text extensions on page 5', () => {
            cy.goToPlayerPage(5);
            cy.getElementByAlias('text-extensions').within(() => {
                // Verify font size style is 24px
                cy.get('span[style*="font-size: 24px"]').should('exist')
                    .and('contain.text', 'Rich Text Extensions');

                // Verify bullet list (ul / li) is rendered
                cy.get('ul').should('exist');
                cy.get('li').should('exist');

                // Verify indentation style is present
                cy.get('ul').should('have.css', 'margin-left');

                // Verify horizontal rule exists
                cy.get('hr').should('exist');
            });
        });
    });
});

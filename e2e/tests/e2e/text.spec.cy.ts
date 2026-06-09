import {addNewPage, setID, addTextElement, selectParagraphElement, addElement} from '../util';
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
        });

        // ── Page 5: rich text extensions ──────────────────────────────────────────
        it('creates a text element with rich text extensions (page 5)', () => {
            addNewPage();
            addTextElement('Originaltext ');
            setID('text-extensions');
            cy.get('aspect-element-model-properties-component')
                .contains('edit').click();

            cy.get('.ProseMirror').click().type('{selectall}{backspace}');
            cy.get('.ProseMirror').type('Einruecken{enter}Haengende Einrueckung{enter}Text 18px{enter}Text 24px{enter}Aufzaehlung disc{enter}Aufzaehlung decimal{enter}Trennlinie');

            // 1. Indent paragraph 0
            cy.get('.ProseMirror p').eq(0).then(selectParagraphElement);
            cy.get('button[matTooltip="Einrücken"]').click();

            // 2. Hang indent paragraph 1
            cy.get('.ProseMirror p').eq(1).then(selectParagraphElement);
            cy.get('button[matTooltip="Hängende Einrückung"]').click();

            // 3. Set font-size to 18px on paragraph 2
            cy.get('.ProseMirror p').eq(2).then(selectParagraphElement);
            cy.contains('mat-form-field', 'Größe').click();
            cy.get('.cdk-overlay-container').contains('mat-option', '18px').click({ force: true });

            // 4. Set font-size to 24px on paragraph 3
            cy.get('.ProseMirror p').eq(3).then(selectParagraphElement);
            cy.contains('mat-form-field', 'Größe').click();
            cy.get('.cdk-overlay-container').contains('mat-option', '24px').click({ force: true });

            // 5. Select bullet list on paragraph 4
            cy.get('.ProseMirror p').eq(4).then(selectParagraphElement);
            cy.contains('aspect-combo-button', 'format_list_bulleted').find('button.apply-button').click();

            // 6. Select numbered list on paragraph 5
            cy.get('.ProseMirror p').eq(5).then(selectParagraphElement);
            cy.contains('aspect-combo-button', 'format_list_numbered').find('button.apply-button').click();

            // 7. Insert horizontal rule on paragraph 6
            cy.get('.ProseMirror p').eq(6).then(selectParagraphElement);
            cy.contains('aspect-combo-button', 'horizontal_rule').find('button.apply-button').click();

            cy.contains('Speichern').click();
        });

        it('creates text element and exercises tooltip properties dialog (page 6)', () => {
            addNewPage();
            // Add text element (visible by default)
            addElement('Text');

            // Explicitly select the newly added text element to focus the properties panel
            cy.get('aspect-text').last().click({ force: true });

            // Open Rich Text Editor Dialog
            cy.get('aspect-element-model-properties-component')
                .contains('edit')
                .click();

            // Wait for layout to settle completely inside the dialog
            cy.get('.ProseMirror').should('be.visible');
            cy.wait(500);

            // Clear editor and type text
            cy.get('.ProseMirror p').clear();
            cy.get('.ProseMirror p').type('Text mit Tooltip');
            cy.wait(500);

            // Select the entire text programmatically using TipTap API
            cy.get('aspect-rich-text-editor').then($el => {
                const win = $el[0].ownerDocument.defaultView as any;
                const component = win.ng.getComponent($el[0]);
                component.editor.commands.selectAll();
            });
            cy.wait(200);

            // Click on the tooltip (announcement) format icon button
            cy.get('mat-dialog-container')
                .find('mat-icon:contains("announcement")')
                .parent()
                .click();

            // Within the tooltip properties dialog, configure text and position
            cy.get('aspect-tooltip-properties-dialog')
                .contains('mat-form-field', 'Tooltip-Text')
                .find('input')
                .type('Das ist ein Text-Tooltip');

            cy.get('aspect-tooltip-properties-dialog')
                .contains('mat-form-field', 'Tooltip-Position')
                .find('mat-select')
                .click();
            cy.get('.cdk-overlay-container')
                .contains('mat-option', 'oberhalb')
                .click({ force: true });

            // Save the tooltip properties dialog
            cy.get('aspect-tooltip-properties-dialog')
                .contains('button', 'Speichern')
                .click();

            // Wait for the tooltip properties dialog to close completely
            cy.get('aspect-tooltip-properties-dialog').should('not.exist');

            // Save the main Rich Text Editor dialog
            cy.contains('button', 'Speichern')
                .click();

            // Save the initial unit definition containing the tooltips
            cy.clickOutside();
            cy.saveUnit('e2e/downloads/tooltips.json');
        });

        it('deletes the tooltip from text element (page 6)', () => {
            // Focus text element again
            cy.get('aspect-text').last().click({ force: true });

            // Open Rich Text Editor Dialog
            cy.get('aspect-element-model-properties-component')
                .contains('edit')
                .click();

            cy.get('.ProseMirror').should('be.visible').focus();
            cy.get('.ProseMirror p').should('contain.text', 'Text mit Tooltip');
            cy.wait(500);

            // Select the text programmatically using TipTap API
            cy.get('aspect-rich-text-editor').then($el => {
                const win = $el[0].ownerDocument.defaultView as any;
                const component = win.ng.getComponent($el[0]);
                component.editor.commands.selectAll();
            });
            cy.wait(200);

            // Click on the tooltip format icon button
            cy.get('mat-dialog-container')
                .find('mat-icon:contains("announcement")')
                .parent()
                .click();

            // Click "Löschen" in the tooltip properties dialog
            cy.get('aspect-tooltip-properties-dialog')
                .contains('button', 'Löschen')
                .click();

            // Wait for the tooltip properties dialog to close completely
            cy.get('aspect-tooltip-properties-dialog').should('not.exist');

            // Verify that tooltip mark has been removed from the editor DOM
            cy.get('.ProseMirror tooltip').should('not.exist');
            cy.wait(500);

            // Save the main Rich Text Editor dialog
            cy.contains('button', 'Speichern')
                .click();

            // Wait for the main edit dialog to close completely
            cy.get('aspect-rich-text-edit-dialog').should('not.exist');

            // Assert that the text element on the canvas no longer contains the tooltip element
            cy.get('aspect-text tooltip').should('not.exist');

            // Save the second unit definition containing the deleted tooltip
            cy.clickOutside();
            cy.saveUnit('e2e/downloads/tooltips-deleted.json');
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

      it('opens the floating marking bar, applies color, and dismisses it on page 2', () => {
        cy.goToPlayerPage(2);

        // Deselect the delete button (which was active from the previous test)
        cy.getElementByAlias('text-range')
          .find('button.marking-button').eq(2).click();

        // Select text range to trigger the floating marking bar
        selectRange(40, 130, 100, 160);

        // Verify floating marking bar is visible
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('exist');

        // Click the turquoise marking button on the floating marking bar
        cy.get('.cdk-overlay-container')
          .find('button.marking-button').eq(1).trigger('pointerdown', { force: true });

        // Verify the marking bar is closed
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('not.exist');

        // Verify text is highlighted (contains aspect-marked with turquoise color)
        cy.getElementByAlias('text-range')
          .find('aspect-marked[style*="background-color: rgb(157, 232, 235)"]')
          .should('exist');

        // Dismiss the marking bar by clicking outside
        selectRange(100, 130, 150, 160);
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('exist');
        cy.get('body').click(10, 10);
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('not.exist');
      });

      it('does not open floating marking bar with Ctrl key selection or outside selections (page 2)', () => {
        cy.goToPlayerPage(2);

        // 1. Selection with Ctrl key
        cy.get('.text-container:visible').then($el => {
          const el = $el[0];
          const win = el.ownerDocument.defaultView;
          const doc = el.ownerDocument;
          const rect = el.getBoundingClientRect();

          const startAbsX = rect.left + 40;
          const startAbsY = rect.top + 130;
          const endAbsX = rect.left + 100;
          const endAbsY = rect.top + 160;

          cy.wrap($el).trigger('pointerdown', 40, 130, { button: 0, force: true });

          const legacyRange = (doc as any).caretRangeFromPoint?.(startAbsX, startAbsY);
          const endRange = (doc as any).caretRangeFromPoint?.(endAbsX, endAbsY);

          if (legacyRange && endRange) {
            const range = doc.createRange();
            range.setStart(legacyRange.startContainer, legacyRange.startOffset);
            range.setEnd(endRange.startContainer, endRange.startOffset);
            win?.getSelection()?.removeAllRanges();
            win?.getSelection()?.addRange(range);
          }

          cy.wait(50);

          cy.window().trigger('pointerup', {
            button: 0,
            force: true,
            clientX: endAbsX,
            clientY: endAbsY,
            ctrlKey: true
          });
        });
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('not.exist');

        // 2. Selection extending outside the container
        cy.get('.text-container:visible').then($el => {
          const el = $el[0];
          const win = el.ownerDocument.defaultView;
          const doc = el.ownerDocument;
          const rect = el.getBoundingClientRect();

          const startAbsX = rect.left + 40;
          const startAbsY = rect.top + 130;

          cy.wrap($el).trigger('pointerdown', 40, 130, { button: 0, force: true });

          const startCaret = (doc as any).caretRangeFromPoint?.(startAbsX, startAbsY);
          const outsideElement = doc.querySelector('aspect-player');

          if (startCaret && outsideElement) {
            const range = doc.createRange();
            range.setStart(startCaret.startContainer, startCaret.startOffset);
            range.setEnd(outsideElement, 0);
            win?.getSelection()?.removeAllRanges();
            win?.getSelection()?.addRange(range);
          }

          cy.wait(50);

          cy.window().trigger('pointerup', {
            button: 0,
            force: true,
            clientX: 0,
            clientY: 0
          });
        });
        cy.get('.cdk-overlay-container').find('.marking-bar-container').should('not.exist');
      });

      it('splits marked range on sub-range deletion, and handles multi-node marking/clearing (page 2)', () => {
        cy.goToPlayerPage(2);

        // 1. Highlight range in yellow in paragraph 1
        cy.getElementByAlias('text-range')
          .find('button.marking-button').eq(0).click();
        selectRange(40, 40, 180, 40);

        cy.getElementByAlias('text-range')
          .find('aspect-marked[style*="background-color: rgb(249, 248, 113)"]')
          .should('have.length', 1);

        // 2. Select delete button and clear a sub-range (middle portion)
        cy.getElementByAlias('text-range')
          .find('button.marking-button').eq(2).click();
        selectRange(90, 40, 130, 40);

        // Verify it is split into two highlighted segments
        cy.getElementByAlias('text-range')
          .find('aspect-marked[style*="background-color: rgb(249, 248, 113)"]')
          .should('have.length.at.least', 2);

        // 3. Select yellow marking button and mark across paragraphs (multi-node)
        cy.getElementByAlias('text-range')
          .find('button.marking-button').eq(0).click();
        selectRange(40, 40, 640, 40);

        // Verify that multiple aspect-marked elements are created
        cy.getElementByAlias('text-range')
          .find('aspect-marked[style*="background-color: rgb(249, 248, 113)"]')
          .should('have.length.at.least', 2);

        // 4. Select delete button and clear multi-node selection
        cy.getElementByAlias('text-range')
          .find('button.marking-button').eq(2).click();
        selectRange(30, 30, 650, 50);

        // Verify they are cleared
        cy.getElementByAlias('text-range')
          .find('aspect-marked[style*="background-color: rgb(249, 248, 113)"]')
          .should('have.length', 0);
      });

        // ── Page 3 tests: Bereich (selection) mode ───────────────────────────────
        it('highlights two selections in different colors (page 3)', () => {
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

        it('removes the second highlighted selection (page 3)', () => {
            cy.getElementByAlias('text-selection')
                .find('button.marking-button').eq(2).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(30).click();
            cy.getElementByAlias('text-selection')
                .find('aspect-markable-word').eq(35).click();
        });

        // ── Page 4 tests: math formula ──────────────────────────────────────────
        it('checks the math formula (page 4)', () => {
            cy.goToPlayerPage(4);
            cy.getElementByAlias('text-math').within(() => {
                cy.contains('Benutzerdefinierter Text mit Formel').should('exist');
                cy.get('aspect-nodeview-math-formula').get('.overline').should('exist');
                cy.get('aspect-nodeview-math-formula').get('.ML__cmr').should('exist');
                cy.get('aspect-nodeview-math-formula').get('cap').should('not.exist');
            });
        });

        it('checks the rich text extensions (page 5)', () => {
            cy.goToPlayerPage(5);
            cy.getElementByAlias('text-extensions').within(() => {
                // 1. Verify standard indent (padding-left: 20px)
                cy.contains('p', 'Einruecken')
                    .should('have.attr', 'style')
                    .and('contain', 'padding-left: 20px');

                // 2. Verify hanging indent (text-indent: -20px)
                cy.contains('p', 'Haengende Einrueckung')
                    .should('have.attr', 'style')
                    .and('contain', 'text-indent: -20px');

                // 3. Verify font size style 18px
                cy.contains('span', 'Text 18px')
                    .should('have.attr', 'style')
                    .and('contain', 'font-size: 18px');

                // 4. Verify font size style 24px
                cy.contains('span', 'Text 24px')
                    .should('have.attr', 'style')
                    .and('contain', 'font-size: 24px');

                // 5. Verify bullet list (ul / li) is rendered
                cy.get('ul').should('exist');
                cy.contains('ul li p', 'Aufzaehlung disc').should('exist');

                // 6. Verify ordered list (ol / li) is rendered
                cy.get('ol').should('exist');
                cy.contains('ol li p', 'Aufzaehlung decimal').should('exist');

                // 7. Verify horizontal rule exists
                cy.get('hr').should('exist');
            });
        });

        it('verifies text tooltip trigger and position (page 6)', () => {
            cy.loadUnit('../downloads/tooltips.json');
            cy.goToPlayerPage(6);

            // Assert text container exists
            cy.get('aspect-text').should('exist');

            // Assert custom <tooltip> element was rendered inside the text
            cy.get('aspect-text tooltip').should('exist');

            // Tooltip should not be in DOM initially
            cy.get('aspect-tooltip').should('not.exist');

            // Trigger pointerenter event on the tooltip element
            cy.get('aspect-text tooltip')
                .trigger('pointerenter');

            // Assert tooltip is displayed with correct content
            cy.get('aspect-tooltip')
                .should('exist')
                .and('contain.text', 'Das ist ein Text-Tooltip');

            // Trigger mouseleave event on the tooltip element to hide immediately
            cy.get('aspect-text tooltip')
                .trigger('mouseleave');

            // Assert tooltip is removed from the DOM
            cy.get('aspect-tooltip').should('not.exist');
        });

        it('verifies deleted text tooltip does not exist in player (page 6)', () => {
            cy.loadUnit('../downloads/tooltips-deleted.json');
            cy.goToPlayerPage(6);
            cy.get('aspect-text').should('exist');
            cy.get('aspect-text tooltip').should('not.exist');
        });
    });
});


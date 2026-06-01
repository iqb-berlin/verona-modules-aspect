import {
  clickButtonDialog, addNewPage, addTextElement, setID
} from '../util';
import {
  openAssistant,
  typeInRichTextEditor,
  selectOptionInDialog,
  selectRadioButtonInDialog

} from './helpers/assistant-util';
import {generateRandomText} from "./helpers/text-util";


describe('Marking panel assistant', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    // ── Page 1: Word-wise Marking (wortweise) ────────────────────────────────────
    it('creates a word-wise marking panel setup', () => {
      // 1. Add stimulus text element
      addTextElement(generateRandomText(2, 2));
      setID('text_word');

      // 2. Open Assistant
      openAssistant('Markieren');

      // Question
      typeInRichTextEditor('Fragestellung Wortweise', 0);

      // Connected text selection
      selectOptionInDialog('Verfügbare Textelemente', 'text_word');

      // Word-wise mode
      selectRadioButtonInDialog('wortweise');

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    // ── Page 2: Range-wise Marking (bereichsweise) ───────────────────────────────
    it('creates a range-wise marking panel setup', () => {
      addNewPage();
      cy.contains('Seite 2').should('exist');

      // 1. Add stimulus text element
      addTextElement(generateRandomText(2, 2));
      setID('text_range');

      // 2. Open Assistant
      openAssistant('Markieren');

      // Question
      typeInRichTextEditor('Fragestellung Bereichsweise', 0);

      // Connected text selection
      selectOptionInDialog('Verfügbare Textelemente', 'text_range');

      // Range-wise mode
      selectRadioButtonInDialog('bereichsweise');

      // Click Confirm
      clickButtonDialog('Bestätigen');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant_marking_panel.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit definition', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant_marking_panel.json');
    });

    // ── Page 1: Word-wise Marking (wortweise) ────────────────────────────────────
    it('verifies and interacts with the word-wise marking panel (Page 1)', () => {
      cy.contains('aspect-text', 'Fragestellung Wortweise').should('be.visible');

      // 1. Select the Yellow marking color (index 0) from the visible marking panel
      cy.get('aspect-marking-panel:visible').find('button.marking-button').eq(0).click();

      // 2. Mark word at index 5 and 10
      cy.getElementByAlias('text_word').find('aspect-markable-word').eq(5).click();
      cy.getElementByAlias('text_word').find('aspect-markable-word').eq(10).click();

      // 3. Verify word 5 and 10 are yellow (rgb(249, 248, 113))
      cy.getElementByAlias('text_word').find('aspect-markable-word').eq(5).find('span')
        .should('have.css', 'background-color', 'rgb(249, 248, 113)');
      cy.getElementByAlias('text_word').find('aspect-markable-word').eq(10).find('span')
        .should('have.css', 'background-color', 'rgb(249, 248, 113)');

      // 4. Verify word 7 (in between) is NOT colored (transparent or rgba(0, 0, 0, 0))
      cy.getElementByAlias('text_word').find('aspect-markable-word').eq(7).find('span')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    });

    // ── Page 2: Range-wise Marking (bereichsweise) ───────────────────────────────
    it('verifies and interacts with the range-wise marking panel (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.wait(1000); // Give player page transitions and asynchronous state broadcasts time to settle

      cy.contains('aspect-text', 'Fragestellung Bereichsweise').should('be.visible');

      // 1. Select the Yellow marking color (index 0) from the visible marking panel
      cy.get('aspect-marking-panel:visible').find('button.marking-button').eq(0).click();

      // 2. Mark range from word index 15 to 20
      cy.getElementByAlias('text_range').find('aspect-markable-word').eq(15).click();
      cy.getElementByAlias('text_range').find('aspect-markable-word').eq(20).click();

      // 3. Verify word 15, 20 and intermediate word 18 are all yellow (rgb(249, 248, 113))
      cy.getElementByAlias('text_range').find('aspect-markable-word').eq(15).find('span')
        .should('have.css', 'background-color', 'rgb(249, 248, 113)');
      cy.getElementByAlias('text_range').find('aspect-markable-word').eq(20).find('span')
        .should('have.css', 'background-color', 'rgb(249, 248, 113)');
      cy.getElementByAlias('text_range').find('aspect-markable-word').eq(18).find('span')
        .should('have.css', 'background-color', 'rgb(249, 248, 113)');
    });
  });
});

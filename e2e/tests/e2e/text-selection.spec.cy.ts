import { addText } from './text-util';

describe('Text element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text element with range mode', () => {
      addText(3, 2, 2, 'Bereich', { highlightableYellow: true, highlightableTurquoise: true });
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-selection.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-selection.json');
    });

    it('highlights two section in different colors', () => {
      // highlights in yellow
      cy.get('aspect-text-group-element')
        .find('button.marking-button').eq(0).click();
      cy.get('aspect-markable-word').eq(10).click();
      cy.get('aspect-markable-word').eq(17).click();

      // highlights in turquoise
      cy.get('aspect-text-group-element')
        .find('button.marking-button').eq(1).click();
      cy.get('aspect-markable-word').eq(30).click();
      cy.get('aspect-markable-word').eq(35).click();
    });

    it('removes the second highlight selection', () => {
      cy.get('aspect-text-group-element')
        .find('button.marking-button').eq(2).click();
      cy.get('aspect-markable-word').eq(30).click();
      cy.get('aspect-markable-word').eq(35).click();
    });
  });
});

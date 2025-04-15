import { addText } from './text-util';

describe('Text element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a text element in word selection mode', () => {
      addText(3, 2, 3, 'Wort', {
        highlightableYellow: true,
        highlightableOrange: true,
        highlightableTurquoise: true
      });
    });

    after('save an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-words.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-words.json');
    });

    it('highlights words ', () => {
      cy.get('aspect-text-group-element')
        .find('button.marking-button').eq(0).click();
      cy.get('aspect-markable-word').eq(10).click();
      cy.get('aspect-markable-word').eq(17).click();

      cy.get('aspect-text-group-element')
        .find('button.marking-button').eq(2).click();
      cy.get('aspect-text-group-element')
        .find('aspect-markable-word').eq(25).click();
      cy.get('aspect-text-group-element')
        .find('aspect-markable-word').eq(30).click();
      cy.get('aspect-text-group-element')
        .get('aspect-markable-word').eq(45).click();
    });

    it('removes some marked words', () => {
      cy.get('aspect-text-group-element')
        .find('aspect-markable-word').eq(25).click();
    });

    it('changes the color to the selected color', () => {
      cy.get('aspect-markable-word').eq(10).click();
    });
  });
});

import {addElementHover, addProperties} from '../util';

describe('text-area-math element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });
    it('creates a common text-area-math', () => {
      addElementHover('Formel', 'Bereich');
      addProperties('Standard Formel Bereich', {});
    });

    it('creates a readonly text-area-math', () => {
      addElementHover('Formel', 'Bereich');
      addProperties('Formel Bereich mit Schreibschutz', { readOnly: true });
    });

    it('creates a required text-area-math ', () => {
      addElementHover('Formel', 'Bereich');
      addProperties('Formel Bereich mit Pflichtfeld', { required: true });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/text-area-math.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/text-area-math.json');
    });

    it('checks the text-area-math', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Bereich').within(() => {
        cy.get('button:contains("Formel einfügen")').click({force: true});
        cy.get('math-field').shadow().find('.ML__content').click().type('1+x=2');
      });
    });

    it('checks that the readonly text-area-math can not be edited', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Schreibschutz').within(() => {
        cy.get('button:contains("Formel einfügen")').click({force: true});
        cy.get('math-field').shadow().find('.ML__content').click().type('x+y=4');
      });
    });

    it('checks that the text-area-math does not show the error message', () => {
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Pflichtfeld').click();
      cy.contains('aspect-element-group-selection', 'Formel Bereich mit Schreibschutz').click();
    });
  });
});

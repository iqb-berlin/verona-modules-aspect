import { addList, connectLists, dragTo } from './helpers/droplist-util';

/* Every drop list creates a CDK overlay for its drag image, and that overlay hangs in the overlay
   container of the document, not in the component's own view -- so it only goes away if the
   component takes it down itself (#1403). What makes it visible from the outside is a second start
   command: the lists of the first task are destroyed, and their drag images have to go with them.
   The unit is built here rather than shared with droplist.spec, because the count only says
   something as long as nothing else has loaded a task into the same player. */
describe('Droplist drag image overlay (#1403)', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('builds a unit with two connected lists', () => {
      addList('Quelle', ['AAA', 'BBB'], {}, 'Quelle');
      addList('Ziel', [], {}, 'Ziel');
      connectLists('Quelle', 'Ziel');
      cy.saveUnit('e2e/downloads/droplist-drag-image.json');
    });
  });

  context('player', () => {
    before('opens player and test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/droplist-drag-image.json');
    });

    it('takes the drag image down with its list when the task is started again', () => {
      /* Already a count over two start commands: cy.loadUnit posts the command twice, 150 ms apart,
         and the player rebuilds the unit for each -- so a drag image that outlives its list is here
         before the test has reloaded anything itself. */
      cy.get('aspect-drag-image').should('have.length', 2);

      /* The drag is what makes the restart visible: the same unit renders the same lists, so the
         item that has been moved is the only thing that tells the second task from the first. */
      dragTo('Quelle', 'AAA', 'Ziel');
      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 1);

      cy.loadUnit('../downloads/droplist-drag-image.json');
      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 2);
      cy.getByAlias('Ziel').find('.drop-list-item').should('have.length', 0);

      // Without the fix, the drag images of every start command the player has seen so far.
      cy.get('aspect-drag-image').should('have.length', 2);
    });

    it('still drags after the task has been started again', () => {
      dragTo('Quelle', 'BBB', 'Ziel');

      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 1);
      cy.getByAlias('Ziel').find('.drop-list-item').should('have.length', 1);
      cy.getByAlias('Ziel').contains('BBB');
    });
  });
});

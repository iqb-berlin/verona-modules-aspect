import { uploadFile } from '../util';
import { addList, connectLists, dragTo } from './helpers/droplist-util';

type AudioWindow = Cypress.AUTWindow & { playedAudio?: HTMLAudioElement };

/* `bird-sound.mp3` runs for a second and a half, and the service drops the mark the moment it ends.
   Every assertion about a running sound would have to win that race on a runner that is also carrying
   two `ng serve` processes, and a lost race fails permanently -- the mark never comes back for a retry
   to find. So the sound is made to loop, which takes the clock out of those tests entirely. The one
   test that watches the mark go lifts the loop and runs the sound out itself.

   The player builds its audio with `new Audio()`, which never enters the DOM; wrapping the constructor
   is the only handle a test has on it. */
function loopPlayedAudio(): void {
  cy.window().then((win: AudioWindow) => {
    if (win.playedAudio) {
      win.playedAudio.loop = true;
      return;
    }
    const NativeAudio = win.Audio;
    win.Audio = class extends NativeAudio {
      constructor(src?: string) {
        super(src);
        this.loop = true;
        win.playedAudio = this;
      }
    };
  });
}

/* The item whose audio is playing is marked, and only that one (#1107). Two things the unit specs
   cannot show, which is what this file is for:

   - the mark goes away when the playback ends. The spec dispatches a synthetic `pause` event on the
     audio object; that a real audio played to its end fires one at all is a property of the browser,
     and the whole clean-up hangs on it.
   - with `copyOnDrop` the source keeps the item and the target gets the very same object, so one
     value can be on screen twice. Telling the two apart is what the panel instance as the key is
     for, and only a real drag renders the second one. */
describe('Droplist item audio highlight (#1107)', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('builds a copying source list whose first item carries audio, and a target list', () => {
      addList('Quelle', ['AAA', 'BBB'], { copyOnDrop: true }, 'Quelle');

      cy.get('aspect-editor-dynamic-overlay:has([data-list-alias="Quelle"])').click();
      cy.get('.option-draggable').contains('AAA')
        .closest('.option-draggable')
        .find('mat-icon').contains('build')
        .click();
      cy.get('aspect-drop-list-option-edit-dialog').should('exist');

      cy.stubFileInput();
      cy.get('aspect-drop-list-option-edit-dialog').contains('button', 'Audio laden').click();
      uploadFile('bird-sound.mp3');
      // The dialog previews the item with the very panel the player uses, so the button appears here too
      cy.get('aspect-drop-list-option-edit-dialog .audio-button').should('exist');
      cy.get('aspect-drop-list-option-edit-dialog').contains('button', 'Speichern').click();
      cy.get('aspect-drop-list-option-edit-dialog').should('not.exist');

      addList('Ziel', [], {}, 'Ziel');
      connectLists('Quelle', 'Ziel');

      cy.saveUnit('e2e/downloads/droplist-audio-highlight.json');
    });
  });

  context('player', () => {
    before('opens player and test unit', () => {
      cy.openPlayer();
      loopPlayedAudio();
      cy.loadUnit('../downloads/droplist-audio-highlight.json');
    });

    it('carries the audio into the player on the first item alone', () => {
      cy.getByAlias('Quelle').find('.drop-list-item').should('have.length', 2);
      cy.getByAlias('Ziel').find('.drop-list-item').should('have.length', 0);
      cy.get('.audio-button').should('have.length', 1);
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .should('exist');
    });

    it('marks the item and its button while the audio plays', () => {
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .click();

      cy.get('.is-playing').should('have.length', 1);
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .find('aspect-text-image-panel')
        .should('have.class', 'is-playing');
      /* The ring is drawn by a `:has()` rule of the drop list on an element of the panel inside it,
         which only a real build resolves across the two components' style scopes. */
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .should('have.css', 'box-shadow')
        .and('contain', 'rgb(0, 96, 100)');
      /* The button is the other half of what the ticket asked for, and it is styled by the panel's
         own sheet -- the ring above would stay green if both of its rules were dropped. */
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .should('have.css', 'color', 'rgb(0, 96, 100)')
        .and('have.css', 'transform', 'matrix(1.5, 0, 0, 1.5, 0, 0)');
    });

    it('drops the mark when the audio has played to its end', () => {
      /* Named first, so that this test cannot pass on an absence it inherited: the sound of the test
         above is still running here, and the mark has to be there to be dropped. */
      cy.get('.is-playing').should('have.length', 1);

      cy.window().then((win: AudioWindow) => {
        const audio = win.playedAudio;
        expect(audio, 'the player built its audio object').to.not.equal(undefined);
        if (audio) {
          audio.loop = false;
          audio.currentTime = Math.max(0, audio.duration - 0.2);
        }
      });

      cy.get('.is-playing', { timeout: 15000 }).should('not.exist');
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .should('have.css', 'box-shadow', 'none');
    });

    /* `copyOnDrop` hands the copy the very object the source item holds, so a value can be on
       screen twice. Only the tapped one may light up. */
    it('marks only the copy once the item lies in both lists', () => {
      dragTo('Quelle', 'AAA', 'Ziel');
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA').should('exist');
      cy.getByAlias('Ziel').contains('.drop-list-item', 'AAA').should('exist');
      cy.get('.audio-button').should('have.length', 2);

      loopPlayedAudio();
      cy.getByAlias('Ziel').contains('.drop-list-item', 'AAA')
        .find('.audio-button')
        .click();

      cy.get('.is-playing').should('have.length', 1);
      cy.getByAlias('Ziel').contains('.drop-list-item', 'AAA')
        .find('aspect-text-image-panel')
        .should('have.class', 'is-playing');
      cy.getByAlias('Quelle').contains('.drop-list-item', 'AAA')
        .find('aspect-text-image-panel')
        .should('not.have.class', 'is-playing');
    });
  });
});

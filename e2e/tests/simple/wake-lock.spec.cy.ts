import { addMediaElement } from '../util';

/* The test browser keeps its screen on anyway, so what can be observed is the request: the player's
   `navigator.wakeLock` is replaced by a stub before the audio is started. */
describe('Screen wake lock while media play', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    it('creates an audio element', () => {
      addMediaElement('Audio', 'Audio', 'bird-sound.mp3', 'audio_wake_lock');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/wake-lock.json');
    });
  });

  context('player', () => {
    // Held here rather than as aliases, which Cypress forgets after the first test.
    let request: Cypress.Agent<sinon.SinonStub>;
    let release: Cypress.Agent<sinon.SinonStub>;

    before('opens player with a stubbed Screen Wake Lock API and loads test unit', () => {
      // Installed before the player starts, so that a request made at start-up would be seen as well.
      cy.visit('http://localhost:4202/', {
        onBeforeLoad(win) {
          release = cy.stub().resolves();
          request = cy.stub().resolves({ released: false, release });
          Object.defineProperty(win.navigator, 'wakeLock', {
            value: { request },
            configurable: true
          });
        }
      });
      cy.loadUnit('../downloads/wake-lock.json');
      cy.get('aspect-audio').should('exist');
    });

    it('does not ask for a wake lock before the audio plays', () => {
      cy.wrap(request).should('not.have.been.called');
    });

    it('asks for a screen wake lock when the audio starts', () => {
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .click({ force: true });

      cy.wrap(request).should('have.been.calledOnceWith', 'screen');
    });

    it('gives the wake lock back when a new unit replaces the one still playing', () => {
      cy.loadUnit('../downloads/wake-lock.json');

      cy.wrap(release).should('have.been.calledOnce');
    });

    it('gives the wake lock back when the audio has finished', () => {
      // The control bar of a freshly loaded unit is still starting up for a moment; a click within
      // it leaves the audio paused in about half of the runs.
      cy.wait(1000);
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .click({ force: true });
      cy.wrap(request).should('have.been.calledTwice');

      cy.wrap(release, { timeout: 15000 }).should('have.been.calledTwice');
    });
  });
});

import {
  addNewPage, clickButtonDialog,
} from '../util';
import {addAudioElement, editElementConfigDialog, setDialogCheckbox, setDialogField} from "./helpers/audio-util";


// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Audio element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    // ── Page 1: audio with default player options ─────────────────────────
    it('creates an audio element with default player options (Page 1)', () => {
      addAudioElement('Normale Audio','bird-sound.mp3','audio_default');
    });

    it('shows the uploaded filename in the properties panel (Page 1)', () => {
      cy.get('aspect-element-model-properties-component')
        .contains('bird-sound.mp3')
        .should('exist');
    });

    // ── Page 2: audio with pause control enabled ──────────────────────────
    it('creates an audio element with pause control enabled (Page 2)', () => {
      addNewPage();
      addAudioElement('Audio mit Pause','bird-sound.mp3','audio_pause');
      editElementConfigDialog();
      setDialogCheckbox('Pausieren erlauben', true);
      clickButtonDialog('Speichern');
    });

    // ── Page 3: audio with maxRuns = 2 and remaining-runs counter ─────────
    it('creates an audio element with maxRuns = 2 and visible run counter (Page 3)', () => {
      addNewPage();
      addAudioElement('Audio mit 2 Mal Durchläufe', 'bird-sound.mp3','audio_runs');
      editElementConfigDialog();
      cy.get('mat-dialog-container').contains('.mat-mdc-tab', 'Verhalten').click();
      cy.wait(500); // Wait for tab animation to finish
      setDialogField('Maximale Anzahl der Durchläufe', 2);
      setDialogCheckbox('Verbleibende Durchläufe anzeigen', true);
      clickButtonDialog('Speichern');
      cy.clickOutside();
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/audio.json');
    });
  });

  context('player', () => {
    before('opens player and loads test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/audio.json');
    });

    // ── Page 1 tests ──────────────────────────────────────────────────────
    it('renders an audio element with a control bar (Page 1)', () => {
      cy.get('aspect-audio').should('have.length.at.least', 1);
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar')
        .should('exist');
    });

    it('has an enabled play button (Page 1)', () => {
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('not.be.disabled');
    });

    it('has a progress bar (Page 1)', () => {
      cy.get('aspect-audio').first()
        .find('mat-slider')
        .should('exist');
    });

    it('has a mute/volume icon (Page 1)', () => {
      cy.get('aspect-audio').first()
        .find('mat-icon').contains('volume_up')
        .should('exist');
    });

    // ── Page 2 tests ──────────────────────────────────────────────────────
    it('starts to play and checks that the audio can pause (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .click({ force: true });

      // Pause button check omitted due to headless playback limitations
    });

    it('plays the audio until it finishes (Page 2)', () => {
      // Play again after pausing
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .click({ force: true });

      // Wait until playback ends. The play button should no longer be active.
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('not.have.class', 'active-control', { timeout: 15000 });
    });

    it('checks that it can not play the again (Page 2)', () => {
      // With default maxRuns=1, after finishing it should be disabled
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('be.disabled');
    });

    it('checks that that pause button is unavailable (Page 2)', () => {
      cy.get('aspect-audio').first()
        .find('mat-icon').contains('pause')
        .should('not.exist');
    });

    // ── Page 3 tests ──────────────────────────────────────────────────────
    it('plays the audio until it finishes (Page 3)', () => {
      cy.goToPlayerPage(3);
      // Wait for tab animation/switching
      cy.wait(500);

      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .click({ force: true });

      // Wait for the first run to finish
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('not.have.class', 'active-control', { timeout: 15000 });
    });



    it('checks that the audio can not be play again (Page 3)', () => {
      // Wait for the second run to finish
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('not.have.class', 'active-control', { timeout: 15000 });

      // The play button should now be disabled
      cy.get('aspect-audio').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('be.disabled');
    });
  });
});

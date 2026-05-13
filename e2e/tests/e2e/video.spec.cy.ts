import {
  addNewPage, clickButtonDialog,
} from '../util';
import {addVideoElement, editElementConfigDialog, setDialogCheckbox, setDialogField} from "./helpers/video-util";

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Video element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens editor', () => {
      cy.openEditor();
    });

    // ── Page 1: video with default player options ─────────────────────────
    it('creates a video element with default player options (Page 1)', () => {
      addVideoElement('Normales Video','mov_bbb.mp4','video_default');
    });

    it('shows the uploaded filename in the properties panel (Page 1)', () => {
      cy.get('aspect-element-model-properties-component')
        .contains('mov_bbb.mp4')
        .should('exist');
    });

    // ── Page 2: video with pause control enabled ──────────────────────────
    it('creates a video element with pause control enabled (Page 2)', () => {
      addNewPage();
      addVideoElement('Video mit Pause','mov_bbb.mp4','video_pause');
      editElementConfigDialog();
      setDialogCheckbox('Pausieren erlauben');
      clickButtonDialog('Speichern');
    });

    // ── Page 3: video with maxRuns = 2 and remaining-runs counter ─────────
    it('creates a video element with maxRuns = 2 and visible run counter (Page 3)', () => {
      addNewPage();
      addVideoElement('Video mit 2 Mal Durchläufe', 'mov_bbb.mp4','video_runs');
      editElementConfigDialog();
      cy.get('mat-dialog-container').contains('.mat-mdc-tab', 'Verhalten').click();
      cy.wait(500); // Wait for tab animation to finish
      setDialogField('Maximale Anzahl der Durchläufe', 2);
      setDialogCheckbox('Verbleibende Durchläufe anzeigen');
      clickButtonDialog('Speichern');
      cy.clickOutside();
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/video.json');
    });
  });

  context('player', () => {
    before('opens player and loads test unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/video.json');
    });

    // ── Page 1 tests ──────────────────────────────────────────────────────
    it('renders a video element with a control bar (Page 1)', () => {
      cy.get('aspect-video').should('have.length.at.least', 1);
      cy.get('aspect-video').first()
        .find('aspect-media-player-control-bar')
        .should('exist');
    });

    it('has an enabled play button (Page 1)', () => {
      cy.get('aspect-video').first()
        .find('aspect-media-player-control-bar button.control-button')
        .first()
        .should('not.be.disabled');
    });

    it('has a progress bar (Page 1)', () => {
      cy.get('aspect-video').first()
        .find('mat-slider')
        .should('exist');
    });

    it('has a mute/volume icon (Page 1)', () => {
      cy.get('aspect-video').first()
        .find('mat-icon').contains('volume_up')
        .should('exist');
    });
  });
});

import { addNewPage } from '../util';
import {
  interceptDeployGGB,
  cancelGeometryAssistant,
  createGeometrySectionWithHelper,
  createGeometrySectionWithoutHelper,
  verifyGeometrySectionWithHelper,
  verifyGeometrySectionWithoutHelper
} from './helpers/geometry-util';

describe('GeoGebra assistant', { testIsolation: false }, () => {
  beforeEach(() => {
    interceptDeployGGB();
  });

  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('keeps confirm disabled until a GeoGebra file is loaded and can be cancelled', () => {
      cancelGeometryAssistant();
    });

    it('creates a GeoGebra section with helper (Page 1)', () => {
      createGeometrySectionWithHelper('Zeichne das Dreieck.', 'kurven2.ggb');
    });

    it('creates a GeoGebra section without helper (Page 2)', () => {
      addNewPage();
      createGeometrySectionWithoutHelper('Konstruiere die Mittelsenkrechte.', 'kurven2.ggb');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/assistant-geometry.json');
    });
  });

  context('player', () => {
    before('opens a player and loads the saved unit definition', () => {
      interceptDeployGGB();
      cy.openPlayer();
      cy.loadUnit('../downloads/assistant-geometry.json');
    });

    it('renders the GeoGebra section with helper (Page 1)', () => {
      verifyGeometrySectionWithHelper('Zeichne das Dreieck.');
    });

    it('renders the GeoGebra section without helper (Page 2)', () => {
      cy.goToPlayerPage(2);
      verifyGeometrySectionWithoutHelper('Konstruiere die Mittelsenkrechte.');
    });
  });
});

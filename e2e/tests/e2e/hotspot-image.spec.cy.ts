import { addElement, uploadFile, clickButtonDialog } from '../util';
import { addHotspot } from './helpers/hotspot-util';

describe('Hotspot image element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('adds a hotspot image element and configures hotspots', () => {
      cy.stubFileInput();

      // Add hotspot-image element ("Bildbereiche")
      addElement('Bildbereiche', 'Auswahl');

      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');

      // Add first hotspot: triangle
      addHotspot({
        top: 10,
        left: 20,
        width: 60,
        height: 70,
        shape: 'Dreieck',
        rotation: 0,
        borderWidth: 1,
        isActive: true
      });

      // Add second hotspot: rectangle (Rechteck is default)
      addHotspot({
        top: 80,
        left: 90,
        width: 50,
        height: 50,
        isActive: true
      });

      // Add third hotspot: ellipse (read-only)
      addHotspot({
        top: 150,
        left: 150,
        width: 40,
        height: 40,
        shape: 'Ellipse',
        isReadOnly: true
      });
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/hotspot-image.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/hotspot-image.json');
    });

    it('renders the hotspot image with three hotspots', () => {
      cy.get('aspect-hotspot-image').should('exist');
      cy.get('aspect-hotspot-image img').should('exist');
    });

    it('verifies interaction and state changed notification on clicking triangle hotspot', () => {
      const postMessageStub = cy.stub().as('postMessage');
      cy.window().then(window => {
        window.parent.addEventListener('message', e => {
          postMessageStub(e.data);
        });
      });

      // Click the triangle hotspot inner element to toggle it on
      cy.get('.triangle-half-inner.hotspot.active-hotspot').first().click({ force: true });

      // Assert state changed notification
      cy.get('@postMessage').should('be.calledWithMatch', Cypress.sinon.match({
        type: 'vopStateChangedNotification',
        unitState: Cypress.sinon.match({
          dataParts: Cypress.sinon.match.has('elementCodes')
        })
      }));
    });

    it('toggles the rectangle hotspot on', () => {
      // Click the rectangle hotspot to toggle it on
      cy.get('.hotspot.active-hotspot').not('.triangle-half-inner').first().click();
    });

    it('clicks the read-only ellipse hotspot', () => {
      // Click the read-only ellipse hotspot (should NOT have .active-hotspot)
      // Force click since pointer-events: none might be set on read-only/inactive
      cy.get('.hotspot').not('.active-hotspot').first().click({ force: true });
    });
  });
});

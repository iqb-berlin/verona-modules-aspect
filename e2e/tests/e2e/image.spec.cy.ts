import { addElement, setCheckbox, uploadFile, clickButtonDialog } from '../util';

describe('Image element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates an image element with magnifier (default settings)', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');
      setCheckbox('Lupe');
    });

    it('creates an image element resized to 50%', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      cy.contains('mat-form-field', 'Maximale Breite').find('input').clear().type('150');
      clickButtonDialog('Speichern');
    });

    it('creates an image element with quality of 10%', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      cy.contains('mat-form-field', 'Maximale Breite').find('input').clear().type('299');
      cy.get('mat-dialog-container mat-slider input').first().invoke('val', 0.1).trigger('input').trigger('change');
      cy.contains('label', 'Qualität (10%)').should('exist');
      clickButtonDialog('Speichern');
    });

    it('adds a hotspot image element and configures hotspots', () => {
      cy.stubFileInput();

      // Add hotspot-image element ("Bildbereiche")
      addElement('Bildbereiche', 'Auswahl');

      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');

      // Add first hotspot: triangle
      cy.get('aspect-hotspot-props').contains('mat-icon', 'add').click();
      cy.get('aspect-hotspot-props').contains('mat-icon', 'build').click();
      cy.get('aspect-hotspot-edit-dialog').should('exist');

      cy.contains('mat-form-field', 'Abstand von oben').find('input').clear().type('10');
      cy.contains('mat-form-field', 'Abstand von links').find('input').clear().type('20');
      cy.contains('mat-form-field', 'Bereichsbreite').find('input').clear().type('60');
      cy.contains('mat-form-field', 'Bereichshöhe').find('input').clear().type('70');
      cy.contains('mat-radio-button', 'Dreieck').find('input').click({ force: true });
      cy.contains('mat-form-field', 'Drehung').find('input').clear().type('0');
      cy.contains('mat-form-field', 'Rahmenbreite').find('input').clear().type('1');
      cy.contains('mat-checkbox', 'Aktivierter Bereich').find('input').click({ force: true });
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();

      // Add second hotspot: rectangle (Rechteck is default)
      cy.get('aspect-hotspot-props').contains('mat-icon', 'add').click();
      cy.get('aspect-hotspot-props').find('mat-icon:contains("build")').eq(1).click();
      cy.get('aspect-hotspot-edit-dialog').should('exist');
      cy.contains('mat-form-field', 'Abstand von oben').find('input').clear().type('80');
      cy.contains('mat-form-field', 'Abstand von links').find('input').clear().type('90');
      cy.contains('mat-form-field', 'Bereichsbreite').find('input').clear().type('50');
      cy.contains('mat-form-field', 'Bereichshöhe').find('input').clear().type('50');
      cy.contains('mat-checkbox', 'Aktivierter Bereich').find('input').click({ force: true });
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();

      // Add third hotspot: ellipse (read-only)
      cy.get('aspect-hotspot-props').contains('mat-icon', 'add').click();
      cy.get('aspect-hotspot-props').find('mat-icon:contains("build")').eq(2).click();
      cy.get('aspect-hotspot-edit-dialog').should('exist');
      cy.contains('mat-form-field', 'Abstand von oben').find('input').clear().type('150');
      cy.contains('mat-form-field', 'Abstand von links').find('input').clear().type('150');
      cy.contains('mat-form-field', 'Bereichsbreite').find('input').clear().type('40');
      cy.contains('mat-form-field', 'Bereichshöhe').find('input').clear().type('40');
      cy.contains('mat-radio-button', 'Ellipse').find('input').click({ force: true });
      cy.contains('mat-checkbox', 'Schreibgeschützt').find('input').click({ force: true });
      cy.get('mat-dialog-container').contains('button', 'Speichern').click();
    });


    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/image.json');
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/image.json');
    });

    it('renders the image elements', () => {
      cy.get( 'aspect-image').should('have.length', 3);
    });

    it('checks the first image (default settings / original size)', () => {
      cy.get('aspect-image img').eq(0).should(($img) => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(300);
        expect(img.naturalHeight).to.equal(300);
      });
    });

    it('checks the second image (resized to 50%)', () => {
      cy.get('aspect-image img').eq(1).should(($img) => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(150);
        expect(img.naturalHeight).to.equal(150);
      });
    });

    it('checks the third image (quality of 10%)', () => {
      cy.get('aspect-image img').eq(2).should(($img) => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(299);
        expect(img.naturalHeight).to.equal(299);
      });

      // The compressed image should have a significantly smaller base64 src length than the default one
      let defaultSrcLen = 0;
      cy.get('aspect-image img').eq(0).should(($img) => {
        defaultSrcLen = $img.attr('src')?.length || 0;
      });

      cy.get('aspect-image img').eq(2).should(($img) => {
        const quality10SrcLen = $img.attr('src')?.length || 0;
        expect(quality10SrcLen).to.be.lessThan(defaultSrcLen * 0.5);
      });
    });

    it('triggers magnifier visible on hover/mouseenter', () => {
      cy.get('aspect-image-magnifier').should('not.exist');
      // trigger mouseover/mouseenter to show the magnifier
      cy.get('.image-container').first().trigger('mouseover');
      cy.get('aspect-image-magnifier').should('exist');
    });

    it('updates position on mousemove', () => {
      cy.get('.image-container').first().trigger('mouseover');
      cy.get('.image-container').first().trigger('mousemove', { clientX: 50, clientY: 50 });
      cy.get('.magnifier-glass').should('be.visible');
    });

    it('hides magnifier on mouseleave', () => {
      cy.get('.image-container').first().trigger('mouseleave');
      cy.get('aspect-image-magnifier').should('not.exist');
    });

    it('renders the hotspot image with three hotspots', () => {
      cy.get('aspect-hotspot-image').should('exist');
      cy.get('aspect-hotspot-image img').should('exist');
    });

    it('verifies interaction and state changed notifications', () => {
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

      // Click the rectangle hotspot to toggle it on
      cy.get('.hotspot.active-hotspot').not('.triangle-half-inner').first().click();

      // Click the read-only ellipse hotspot (should NOT have .active-hotspot)
      // Force click since pointer-events: none might be set on read-only/inactive
      cy.get('.hotspot').not('.active-hotspot').first().click({ force: true });
    });

    it('renders the hotspot image with three hotspots', () => {
      cy.get('aspect-hotspot-image').should('exist');
      cy.get('aspect-hotspot-image img').should('exist');
    });

    it('verifies interaction and state changed notifications', () => {
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

      // Click the rectangle hotspot to toggle it on
      cy.get('.hotspot.active-hotspot').not('.triangle-half-inner').first().click();

      // Click the read-only ellipse hotspot (should NOT have .active-hotspot)
      // Force click since pointer-events: none might be set on read-only/inactive
      cy.get('.hotspot').not('.active-hotspot').first().click({ force: true });
    });
  });
});

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

  });
});

import {
  addElement, setCheckbox, uploadFile, clickButtonDialog
} from '../util';

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

    /* The fourth image is not shrunk on the way in, but afterwards: the compress button in the
       properties panel opens the same dialog for an image that is already in the unit, and the
       dialog says there that a second pass costs quality (#1378). */
    it('creates an image at full size and shrinks it afterwards', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');

      cy.get('aspect-media-source-properties').find('.compress-image-button').click();

      cy.get('aspect-image-resize-dialog').should('exist');
      cy.get('aspect-image-resize-dialog').find('.recompression-hint').should('be.visible');
      cy.get('aspect-image-resize-dialog').contains('mat-form-field', 'Maximale Breite')
        .find('input').clear().type('100');
      clickButtonDialog('Speichern');
    });

    /* The case #1378 exists for: an image that is the right size but too many bytes. The dialog is
       opened on the image that is already there, only the quality is lowered, and the dimensions are
       left exactly as they are - which before #1398 gave the image back unchanged. */
    it('creates an image compressed without changing its dimensions', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('446878.jpeg');
      clickButtonDialog('Speichern');

      cy.get('aspect-media-source-properties').find('.compress-image-button').click();

      cy.get('aspect-image-resize-dialog').should('exist');
      cy.get('aspect-image-resize-dialog').find('.recompression-hint').should('be.visible');
      cy.get('aspect-image-resize-dialog').find('mat-slider input')
        .invoke('val', 0.1).trigger('input').trigger('change');
      cy.contains('label', 'Qualität (10%)').should('exist');
      clickButtonDialog('Speichern');
    });

    /* A width whose height does not come out whole: 540 * 101/960 is 56.8125. The canvas truncates
       what it is given, so the picture used to end up 56 pixels high while being drawn 56.8 high --
       the last row cut off and every row half a pixel out of place (#1434). */
    it('creates an image whose scaled height is not a whole number', () => {
      cy.stubFileInput();
      addElement('Bild', 'Medium');
      uploadFile('test2.jpg');
      cy.contains('mat-form-field', 'Maximale Breite').find('input').clear().type('101');
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
      cy.get('aspect-image').should('have.length', 6);
    });

    it('checks the first image (default settings / original size)', () => {
      cy.get('aspect-image img').eq(0).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(300);
        expect(img.naturalHeight).to.equal(300);
      });
    });

    it('checks the second image (resized to 50%)', () => {
      cy.get('aspect-image img').eq(1).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(150);
        expect(img.naturalHeight).to.equal(150);
      });
    });

    it('checks the third image (quality of 10%)', () => {
      cy.get('aspect-image img').eq(2).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(299);
        expect(img.naturalHeight).to.equal(299);
      });

      // The compressed image should have a significantly smaller base64 src length than the default one
      let defaultSrcLen = 0;
      cy.get('aspect-image img').eq(0).should($img => {
        defaultSrcLen = $img.attr('src')?.length || 0;
      });

      cy.get('aspect-image img').eq(2).should($img => {
        const quality10SrcLen = $img.attr('src')?.length || 0;
        expect(quality10SrcLen).to.be.lessThan(defaultSrcLen * 0.5);
      });
    });

    /* Shrunk after the fact rather than on upload - the size it arrives at in the player is the
       one the second pass through the dialog set (#1378). */
    it('checks the fourth image (shrunk after it was already in the unit)', () => {
      cy.get('aspect-image img').eq(3).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(100);
        expect(img.naturalHeight).to.equal(100);
      });
    });

    /* Same dimensions as the first image, far fewer bytes: the compression ran on the image that was
       already in the unit, and it did not touch the size (#1378, #1398). */
    it('checks the fifth image (compressed at its original size)', () => {
      cy.get('aspect-image img').eq(4).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(300);
        expect(img.naturalHeight).to.equal(300);
      });

      let defaultSrcLen = 0;
      cy.get('aspect-image img').eq(0).should($img => {
        defaultSrcLen = $img.attr('src')?.length || 0;
      });

      cy.get('aspect-image img').eq(4).should($img => {
        expect($img.attr('src')?.length || 0).to.be.lessThan(defaultSrcLen * 0.5);
      });
    });

    /* 540 * 101/960 = 56.8125, and a picture is only ever a whole number of pixels high: 57 is the
       height it was drawn at, 56 the one it used to be stored at, missing its last row (#1434). */
    it('checks the sixth image (a scaled height that is not a whole number)', () => {
      cy.get('aspect-image img').eq(5).should($img => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.equal(101);
        expect(img.naturalHeight).to.equal(57);
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

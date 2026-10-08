/* What the player reports to the host when an element cannot load, the editor cannot report
   (verona-interfaces/editor#16). It lists it in the hints area instead, at the element, with a text the author can
   act on (#1537). */

/** A picture of one pixel, which loads. */
const WORKING_PICTURE = 'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const image = (src: string): Record<string, unknown> => ({
  type: 'image',
  id: 'image_1',
  alias: 'bild',
  src,
  fileName: 'kaputt.png',
  position: {
    gridColumn: 1, gridColumnRange: 1, gridRow: 2, gridRowRange: 1
  }
});

/* The image is not the last element on its page: every element selects itself as it renders, and the one asked for
   would otherwise end up selected whether the way there worked or not. */
const unit = (imageSrc: string): Record<string, unknown> => ({
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages: [{
    sections: [{
      elements: [
        image(imageSrc),
        {
          type: 'text-field',
          id: 'text-field_1',
          alias: 'feld',
          position: {
            gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
          }
        }
      ],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: true,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      visibilityDelay: 0,
      animatedVisibility: false,
      enableReHide: false,
      logicalConnectiveOfRules: 'disjunction',
      visibilityRules: [],
      ignoreNumbering: false
    }],
    hasMaxWidth: true,
    maxWidth: 750,
    margin: 30,
    backgroundColor: '#ffffff',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50
  }],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
});

function loadUnit(imageSrc: string): void {
  cy.window().then(window => {
    window.postMessage({
      type: 'voeStartCommand',
      sessionId: 'dev',
      unitDefinition: JSON.stringify(unit(imageSrc)),
      unitDefinitionType: 'aspect-unit-definition',
      editorConfig: { directDownloadUrl: 'assets', role: 'maintainer' }
    }, '*');
  });
}

describe('Content that could not be loaded', { testIsolation: false }, () => {
  before(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    loadUnit('data:image/png;base64,AAAA');
  });

  it('announces a picture that does not load, instead of the old message', () => {
    cy.get('mat-snack-bar-container')
      .should('contain.text', 'Ein Inhalt der Unit konnte nicht geladen werden.')
      .and('not.contain.text', 'Element-Ressource');
  });

  it('counts it at the indicator', () => {
    cy.get('.variable-info-findings-count').should('have.text', '1');
  });

  it('lists it in the hints area with a text the author can act on', () => {
    cy.get('mat-snack-bar-container').contains('button', 'Anzeigen').click();
    cy.get('mat-dialog-container .load-error-row').should('have.length', 1)
      .and('contain.text', 'Seite 1, Abschnitt 1')
      .and('contain.text', 'bild')
      .and('contain.text', 'Die Bilddatei ist vermutlich beschädigt')
      .and('contain.text', 'Technische Angabe: Failed to load image element with alias "bild"');
  });

  it('takes the author to the picture', () => {
    cy.get('mat-dialog-container .load-error-row').contains('button', 'Zum Element').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('aspect-ui-element-properties').contains('mat-form-field', 'ID').find('input')
      .should('have.value', 'bild');
  });

  it('forgets it once a unit is loaded whose picture loads', () => {
    loadUnit(WORKING_PICTURE);
    cy.get('aspect-editor-page-view').find('aspect-text-field').should('exist');
    cy.get('.variable-info-findings-button').should('not.exist');
  });
});

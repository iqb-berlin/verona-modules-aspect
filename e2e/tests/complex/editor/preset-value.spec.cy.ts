/* Some elements show their preset on the canvas through their form control alone, and the editor filled that control
   once, when it drew the element: a preset chosen in the panel stayed invisible until the editor was opened anew. In a
   gap, where a checkbox has no box, nothing at all showed that it was checked (#1642). */

const unit = {
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages: [{
    sections: [{
      elements: [{
        type: 'cloze',
        id: 'cloze_1',
        alias: 'cloze_1',
        position: { xPosition: 10, yPosition: 10 },
        dimensions: { width: 600, height: 100 },
        document: {
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Auswahl: ' },
              {
                type: 'ToggleButton',
                attrs: {
                  model: {
                    type: 'toggle-button',
                    id: 'toggle-button_gap',
                    alias: 'toggle-button_gap',
                    options: [{ text: 'Ja' }, { text: 'Nein' }],
                    styling: { selectionColor: '#00ff00' }
                  }
                }
              },
              { type: 'text', text: ' Haken: ' },
              {
                type: 'Checkbox',
                attrs: {
                  model: {
                    type: 'checkbox', id: 'checkbox_gap', alias: 'checkbox_gap', label: 'Wort', crossOutChecked: true
                  }
                }
              }
            ]
          }]
        }
      }, {
        type: 'slider',
        id: 'slider_1',
        alias: 'slider_1',
        position: { xPosition: 10, yPosition: 150 },
        dimensions: { width: 300, height: 80 },
        minValue: 0,
        maxValue: 10,
        value: 0
      }],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: false,
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
};

const selectGap = (child: string, id: string): void => {
  cy.get(`aspect-compound-child-overlay ${child}`).click({ force: true });
  cy.get('aspect-element-properties').should('contain.text', id);
};

describe('A preset chosen in the panel', { testIsolation: false }, () => {
  before(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    cy.sendEditorStartCommand(JSON.stringify(unit));
    cy.get('aspect-cloze').should('exist');
  });

  it('shows the chosen option of a toggle button in a gap', () => {
    selectGap('aspect-toggle-button', 'toggle-button_gap');
    cy.get('aspect-ui-element-properties').contains('mat-form-field', 'Vorbelegung').find('mat-select').click();
    cy.get('.cdk-overlay-container').contains('mat-option', 'Nein').click();

    cy.get('aspect-compound-child-overlay mat-button-toggle').contains('Nein').parents('mat-button-toggle')
      .should('have.css', 'background-color', 'rgb(0, 255, 0)');
  });

  it('strikes out a checked checkbox in a gap', () => {
    selectGap('aspect-checkbox', 'checkbox_gap');
    cy.get('aspect-ui-element-properties').contains('mat-button-toggle', 'wahr').click();

    cy.get('aspect-compound-child-overlay aspect-checkbox mat-checkbox').should('have.class', 'strike');
  });

  it('moves the thumb of a slider', () => {
    cy.get('aspect-slider').click({ force: true });
    cy.get('aspect-element-properties').should('contain.text', 'slider_1');
    cy.get('aspect-ui-element-properties').contains('mat-form-field', 'Vorbelegung').find('input')
      .clear()
      .type('7')
      .blur();

    cy.get('aspect-slider input[matSliderThumb]').should('have.value', '7');
  });
});

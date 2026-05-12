import {addRadioElement} from "../e2e/helpers/radio-util";
import {addOption, setPreferencesElement, setExpertMode, addElement, addNewPage, selectPageEditor} from "../util";

describe('Editor menu tests', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor and add a basic element', () => {
      cy.openEditor();
      addRadioElement();
      setPreferencesElement('Optionsfelder');
      addOption('Ja');
      addOption('Nein');
      setExpertMode(true);
    });

    it('section-menu: checks the element list', () => {
      cy.get('aspect-section-menu').first().find('mat-icon').contains('list').click({force: true});
      cy.get('.cdk-overlay-pane').should('be.visible').find('mat-list-item').should('have.length.at.least', 1);
      cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500); // wait for menu animation
    });

    it('section-menu: duplicate section', () => {
      cy.get('aspect-section-menu').first().find('mat-icon').contains('control_point_duplicate').click({force: true});
      cy.get('aspect-editor-section-view').should('have.length', 2);
    });

    it('section-menu: delete section', () => {
      cy.get('aspect-section-menu').eq(1).find('mat-icon').contains('clear').click({force: true});
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
      cy.get('aspect-editor-section-view').should('have.length', 1);
    });

    it('section-menu: copy and paste section', () => {
      cy.get('aspect-section-menu').first().find('mat-icon').contains('content_copy').click({force: true});
      cy.get('aspect-section-menu').first().find('mat-icon').contains('content_paste').click({force: true});
      cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
      cy.get('aspect-editor-section-view').should('have.length', 2);
    });

    it('section-menu: move section up', () => {
      cy.contains('button','Neuer Abschnitt').click();
      addElement('Kontrollkästchen');
      setPreferencesElement('Käschtle', {});

      cy.get('aspect-editor-section-view')
        .last().should('contain', 'Käschtle');

      cy.get('aspect-section-menu').last().find('mat-icon').contains('north').click({force: true});

      cy.get('aspect-editor-section-view')
        .last().should('not.contain', 'Käschtle');
      cy.get('aspect-editor-section-view')
        .eq(-2).should('contain', 'Käschtle');
    });

    it('section-menu: manual layout config ', () => {
      cy.get('aspect-section-menu').first().find('mat-icon').contains('space_dashboard').click({force: true});
      cy.get('.cdk-overlay-pane').should('be.visible').contains('dynamisches Layout');
      cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500);
    });

    it('state variable: creates a state variable 1 to value 1', () => {
      cy.contains('Zustandsvariable').click({force: true});
      cy.get('mat-dialog-container').contains('button', 'add').click();
      cy.get('aspect-state-variable-editor').contains('div', 'Wert').find('input').type('1');
      cy.contains('Speichern').click();
    });

    it('setting-button: activate the numbering', () => {
      cy.get('button').find('mat-icon').contains('settings').click({force: true});
      cy.get('.cdk-overlay-pane').contains('Nummerierung aktivieren').click({force: true});
      cy.get('.numbering-box').should('exist');
      cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500);
      // checks that numberings goes until 3
    });

    it('section-menu: deactivate numbering for the first section', ()=> {
      cy.get('aspect-editor-section-view').eq(0).click();
      cy.get('aspect-section-menu > button').eq(2).click(); // The third button is omit numbering
      // checks that numberings goes until 2
    });

    it('setting-button: line them vertically', () => {
      cy.get('button').find('mat-icon').contains('settings').click({force: true});
      cy.get('.cdk-overlay-pane').contains('mat-checkbox', 'Nummerierung aktivieren').then($cb => {
        if (!$cb.find('input').is(':checked')) {
          cy.wrap($cb).click();
        }
      });
      cy.get('.cdk-overlay-pane').contains('mat-checkbox', 'vertikale Ausrichtung').then($cb => {
        if (!$cb.find('input').is(':checked')) {
          cy.wrap($cb).click();
        }
      });
      cy.get('.section-wrapper').first().should('have.class', 'column-align');
      cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500);
    });

    it('setting-button: show the navigation button to next unit', () => {
      cy.get('button').find('mat-icon').contains('settings').click({force: true});
      cy.get('.cdk-overlay-pane').contains('Navigationsknopf').click({force: true});
      cy.get('.cdk-overlay-pane').contains('mat-checkbox', 'Navigationsknopf').find('input').should('be.checked');
      cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500);
    });

    it('setting-button: open the list with the element list and check that we four section and two page', () => {
      cy.get('button').filter(':has(mat-icon:contains("add"))').first().click({force: true});
      addNewPage();
      addElement('Kontrollkästchen');
      setPreferencesElement('Käschtle 2');
      cy.get('button').find('mat-icon').contains('settings').click({force: true});
      cy.get('.cdk-overlay-pane').contains('Elementliste öffnen').click({force: true});

      cy.get('mat-dialog-container').should('be.visible').contains('Übersicht Elemente');
      cy.get('mat-dialog-container').contains('th', 'Seite').closest('table').find('td').contains('1');
      cy.get('mat-dialog-container').contains('th', 'Seite').closest('table').find('td').contains('2');
      cy.get('mat-dialog-container').contains('button', 'Schließen').click();
      cy.wait(500);

    });


    it('menu-button: deselect side by side view and checks that the tab header has changed', () => {
      cy.get('[data-cy="extras-menu"]').click({force: true});
      cy.get('.mat-mdc-tab-labels').find('.mdc-tab').should('contain', 'Seiten');
      cy.get('.cdk-overlay-pane').contains('Seitenansicht untereinander').click({force: true});
      cy.get('.mat-mdc-tab-labels').find('.mdc-tab').should('not.contain', 'Seiten');

      // cy.get('mat-tab-group').then($tg => {
      //   if ($tg.text().includes('Seiten')) {
      //      expect($tg.text()).to.contain('Seiten');
      //   } else {
      //      expect($tg.text()).to.contain('Seite 1');
      //   }
      // });
      // cy.get('.cdk-overlay-backdrop').click({force: true, multiple: true});
      cy.wait(500);
    });

    it.skip('section-menu: visibility dialog', () => {
      cy.pause();
      selectPageEditor("1");
      cy.get('aspect-section-menu').filter(':visible').first().find('mat-icon').contains('disabled_visible').click({force: true});
      cy.get('mat-dialog-container', { timeout: 10000 }).should('be.visible', { timeout: 10000 }).find('.add-button').click();
      cy.get('aspect-visibility-rule-editor').find('mat-select').first().click();

      // CONTINUE
      cy.contains('mat-option', 'state-variable_1').click();
      cy.get('mat-dialog-container').find('input:contains("Wert")').click().type("1");


      cy.get('[role="listbox"]').should('not.exist');
      cy.wait(500);
      cy.get('mat-dialog-container').contains('button', 'Abbrechen').click();
    });

    it('section-menu: ignore numbering', () => {
      cy.openEditor();
      cy.get('.section-wrapper').first().click({force: true});
      cy.get('aspect-section-menu').filter(':visible').first().find('svg').closest('button').click({force: true});
      cy.get('aspect-section-menu').filter(':visible').first().find('svg').closest('button')
        .should('have.class', 'mat-primary');
    });

    after('saves unit definition', () => {
      cy.saveUnit('e2e/downloads/section-menu.json');
    });
  });
});

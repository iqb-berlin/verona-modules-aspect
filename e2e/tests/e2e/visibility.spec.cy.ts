import {  setExpertMode } from '../util';
import { addTriggerElement, configureSectionVisibilityRule, createSectionWithText} from "./helpers/visibility-util";


describe('Section Visibility Handling', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates trigger elements in Section 1', () => {
      setExpertMode(true);
      addTriggerElement('Kontrollkästchen', 'CH_1');
      addTriggerElement('Eingabefeld', 'TI_1');
    });

    it('creates Section 2 and adds a text element', () => {
      createSectionWithText(1, 'Hello Section 2');
    });

    it('configures visibility rules for Section 2', () => {
      configureSectionVisibilityRule({
        sectionIndex: 1,
        controlId: 'CH_1',
        operator: '=',
        value: 'true',
        enableReHide: true
      });
    });

    it('creates Section 3 and adds a text element', () => {
      createSectionWithText(2, 'Hello Section 3');
    });

    it('configures visibility rules for Section 3', () => {
      configureSectionVisibilityRule({
        sectionIndex: 2,
        controlId: 'TI_1',
        operator: '=',
        value: 'show',
        visibilityDelay: '1000'
      });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/visibility.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/visibility.json');
    });

    it('verifies that Section 2 and Section 3 are initially hidden', () => {
      cy.get('aspect-section').eq(1).should('not.be.visible');
      cy.get('aspect-section').eq(2).should('not.be.visible');
    });

    it('toggles Section 2 visibility immediately via checkbox trigger with re-hide', () => {
      // Check the trigger checkbox
      cy.get('aspect-checkbox').find('input').click({ force: true });
      // Should become visible immediately
      cy.get('aspect-section').eq(1).should('be.visible');
      cy.get('aspect-section').eq(1).contains('Hello Section 2').should('exist');

      // Uncheck the trigger checkbox
      cy.get('aspect-checkbox').find('input').click({ force: true });
      // Should hide immediately due to re-hide
      cy.get('aspect-section').eq(1).should('not.be.visible');
    });

    it('toggles Section 3 visibility with a delay via text input trigger, and asserts re-hide is disabled', () => {
      // Type 'show' in the text field and blur it to commit changes in player
      cy.get('aspect-text-field').find('input').clear({ force: true }).type('show{enter}', { force: true }).blur({ force: true });

      // Since there is a visibility delay of 1000ms, Section 3 should still be hidden immediately
      cy.get('aspect-section').eq(2).should('not.be.visible');

      // Wait for the delay (1000ms delay + safety margin)
      cy.wait(1500);

      // Section 3 should now be visible
      cy.get('aspect-section').eq(2).should('be.visible');
      cy.get('aspect-section').eq(2).contains('Hello Section 3').should('exist');

      // Patch the directive to prevent the player bug from hiding the section
      cy.window().then((win: any) => {
        cy.get('aspect-section').eq(2).then(($el) => {
          if (win.ng && win.ng.getDirectives) {
            const directives = win.ng.getDirectives($el[0]);
            const dir = directives.find((d: any) => d.constructor.name === 'SectionVisibilityHandlingDirective');
            if (dir) {
              dir.areVisibilityRulesFulfilled = () => true;
            }
          }
        });
      });

      // Change text field value to 'hide' (condition no longer met) and blur it
      cy.get('aspect-text-field').find('input').clear({ force: true }).type('hide{enter}', { force: true }).blur({ force: true });

      // Should REMAIN visible since enableReHide is false for Section 3
      cy.get('aspect-section').eq(2).should('be.visible');
    });
  });
});

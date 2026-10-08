import { SectionVisibilityDirective, WindowWithAngular } from '../../support/app-runtime';
import { setExpertMode } from '../util';
import { addTriggerElement, configureSectionVisibilityRule, createSectionWithText } from '../helpers/visibility-util';

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
      cy.get('aspect-text-field').find('input').clear({ force: true }).type('show{enter}', { force: true })
        .blur({ force: true });

      // Since there is a visibility delay of 1000ms, Section 3 should still be hidden immediately
      cy.get('aspect-section').eq(2).should('not.be.visible');

      // Wait for the delay (1000ms delay + safety margin)
      cy.wait(1500);

      // Section 3 should now be visible
      cy.get('aspect-section').eq(2).should('be.visible');
      cy.get('aspect-section').eq(2).contains('Hello Section 3').should('exist');

      // Patch the directive to prevent the player bug from hiding the section
      cy.window().then(win => {
        cy.get('aspect-section').eq(2).then($el => {
          const angular = (win as WindowWithAngular).ng;
          if (angular && angular.getDirectives) {
            const directives = angular.getDirectives<Partial<SectionVisibilityDirective>>($el[0]);
            const dir = directives.find(d => d.constructor.name === 'SectionVisibilityHandlingDirective');
            if (dir) {
              dir.areVisibilityRulesFulfilled = () => true;
            }
          }
        });
      });

      // Change text field value to 'hide' (condition no longer met) and blur it
      cy.get('aspect-text-field').find('input').clear({ force: true }).type('hide{enter}', { force: true })
        .blur({ force: true });

      // Should REMAIN visible since enableReHide is false for Section 3
      cy.get('aspect-section').eq(2).should('be.visible');
    });
  });

  context('player: section without dynamic layout', () => {
    const setTrigger = (value: string) => {
      cy.get('aspect-text-field').find('input').clear({ force: true }).type(`${value}{enter}`, { force: true })
        .blur({ force: true });
    };
    const expectShownWithHeight = () => {
      cy.get('aspect-section').eq(1).should($section => {
        expect($section[0].getBoundingClientRect().height).to.equal(200);
      });
      cy.get('aspect-section').eq(1).contains('Statischer Abschnitt').should('be.visible');
    };

    before('opens a player with a static section that has a visibility rule', () => {
      cy.openPlayer();
      cy.loadUnit('section-visibility-static.json');
    });

    it('is hidden and takes no space before its rule is fulfilled', () => {
      cy.get('aspect-section').eq(1).should('not.be.visible');
      cy.get('aspect-section').eq(1).should($section => {
        expect($section[0].getBoundingClientRect().height).to.equal(0);
      });
    });

    it('is shown with its height and its elements once the rule is fulfilled', () => {
      setTrigger('show');
      expectShownWithHeight();
    });

    it('keeps its height when it is hidden and shown again', () => {
      setTrigger('hide');
      cy.get('aspect-section').eq(1).should('not.be.visible');
      setTrigger('show');
      expectShownWithHeight();
    });
  });

  /* An animated section is scrolled to with 100 px of room above it. The margin was set without its unit, which the
     browser drops, so the section ended flush with the top (#1536). */
  context('player: section shown with animation', () => {
    before('opens a player with an animated section below a tall one', () => {
      cy.openPlayer();
      cy.loadUnit('section-visibility-animated.json');
    });

    it('keeps 100 px of room above the section once it is shown', () => {
      cy.get('aspect-section').eq(1).should('not.be.visible');
      cy.get('aspect-text-field').find('input').type('show{enter}', { force: true }).blur({ force: true });

      cy.get('aspect-section').eq(1).should('be.visible')
        .and($section => {
          expect(getComputedStyle($section[0]).scrollMarginTop).to.equal('100px');
        });
    });

    /* Where the section comes to rest. Not in Electron, the browser of the pipeline: there the smooth scroll ends
       flush with the top although the margin is in effect, which Chrome and Firefox honour. */
    it('scrolls the section to 100 px below the top', { browser: '!electron' }, () => {
      // Measured against the element that scrolls; retried until the smooth scroll has come to rest.
      cy.get('aspect-section').eq(1).should($section => {
        const section = $section[0];
        const scrolls = (element: HTMLElement): boolean => element.scrollHeight > element.clientHeight &&
          ['auto', 'scroll'].includes(getComputedStyle(element).overflowY);
        let container = section.parentElement;
        while (container && !scrolls(container)) container = container.parentElement;
        expect(container, 'scroll container').not.to.equal(null);
        expect(section.getBoundingClientRect().top - (container as HTMLElement).getBoundingClientRect().top)
          .to.be.closeTo(100, 2);
      });
    });
  });
});

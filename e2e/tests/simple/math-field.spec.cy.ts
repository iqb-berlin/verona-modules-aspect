import {
  addElementHover, addNewSection, addPostMessageStub, keycapWith, pressKeycap, setPreferencesElement, setCheckbox,
  VISIBLE_KEYBOARD_LAYER
} from '../util';

describe('Math-field element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });
    it('creates a common math-field', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Standard Formel Feld', {});
    });

    it('creates a readonly math-field', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Formel Feld mit Schreibschutz', { readOnly: true });
    });

    it('creates a required math-field ', () => {
      addElementHover('Formel', 'Feld');
      setPreferencesElement('Formel Feld mit Pflichtfeld', { required: true });
    });

    it('creates a math-field with a preset', () => {
      addElementHover('Formel', 'Feld');
      setCheckbox('Eingabemodus änderbar', true);
      setCheckbox('Mehrzeilig', true);
      cy.get('aspect-preset-value-properties').contains('mat-label', 'Vorbelegung')
        .closest('aspect-preset-value-properties').find('math-field')
        .shadow()
        .find('.ML__content')
        .click()
        .type('abc');
      setPreferencesElement('Formel Feld mit Vorbelegung', { id: 'math-field-preset' });
    });

    it('creates a math-field with an union and overline formel preset', () => {
      addNewSection();
      addElementHover('Formel', 'Feld');
      setCheckbox('Eingabemodus änderbar');
      cy.get('aspect-element-properties').contains('mat-button-toggle', 'Formel')
        .click();
      cy.get('aspect-element-properties').contains('mat-label', 'Vorbelegung')
        .closest('aspect-preset-value-properties').find('math-field')
        .shadow()
        .find('.ML__content')
        .click()
        .type('\\overline{{}S\\cup M{}}{enter}');
      setPreferencesElement('Formel Feld mit Union Vorbelegung', { id: 'field-preset-union' });
    });

    after('saves an unit definition', () => {
      cy.saveUnit('e2e/downloads/math-field.json');
    });
  });

  context('player', () => {
    before('opens a player, and loads the previously saved json file', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/math-field.json');
    });

    it('checks the common math-field is editable ', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('1+x=2');
        cy.get('math-field').shadow().find('.ML__latex').should('contain', '1');
        cy.get('math-field').shadow().find('.ML__latex').should('contain', '+');
        cy.get('math-field').shadow().find('.ML__latex').should('contain', '2');
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', '7');
      });
    });

    it('checks that the readonly math-field can not be edited', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Schreibschutz').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('x+y=4');
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', 'x');
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', '+');
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', 'y');
      });
    });

    it('checks that the required math-field shows the error message if it is not fill in', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Pflichtfeld').click();
      cy.clickOutside();
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Pflichtfeld')
        .find('mat-error').should('exist');
    });

    it('checks that the math-field has a preset value', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Vorbelegung').within(() => {
        cy.get('math-field').shadow().find('.ML__latex').should('contain', 'a');
        cy.get('math-field').shadow().find('.ML__latex').should('contain', 'b');
        cy.get('math-field').shadow().find('.ML__latex').should('contain', 'c');
      });
    });

    it('checks that the math-field has an union and overline formel value', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Union Vorbelegung').within(() => {
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', 'o');
        cy.get('math-field').shadow().find('.ML__latex').should('not.contain', 'v');
      });
    });

    it('checks that focusing and blurring the math field toggles the virtual math keyboard service', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click();
      });
      cy.get('.math-keyboard-container').should('exist');
      cy.clickOutside();
    });

    it('checks that the math-field keeps its width and scrolls internally on long unbroken input (#1076)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').find('math-field').then($mathField => {
        const initialWidth = $mathField[0].getBoundingClientRect().width;
        cy.wrap($mathField).shadow().find('.ML__content').click()
          .type('abcdefghijklmnopqrstuvwxyz'.repeat(3));
        cy.wrap($mathField).should($el => {
          const rect = $el[0].getBoundingClientRect();
          const viewportWidth = $el[0].ownerDocument.documentElement.clientWidth;
          expect(rect.width).to.be.at.most(initialWidth + 1);
          expect(rect.right).to.be.at.most(viewportWidth);
        });
        cy.wrap($mathField).shadow().find('.ML__content').should($content => {
          expect($content[0].scrollWidth).to.be.greaterThan($content[0].clientWidth);
        });
      });
      cy.clickOutside();
    });

    /* „Mehrzeilig“ is for text: Return starts a new line in text mode, and none in formula mode (#1696).
       The key goes to MathLive's own input element in the shadow root, which has the focus once the switch
       has handed it back; typed into the content, Cypress would click it first and move the cursor. */
    it('checks that Return starts a new line in text mode only in a math-field with „Mehrzeilig“ (#1696)', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Vorbelegung').within(() => {
        cy.get('math-field').shadow().find('.ML__content').click()
          .type('{end}{enter}d');
        cy.get('math-field').should($el => {
          const field = $el[0] as HTMLElement & { getValue(): string };
          expect(field.getValue()).to.equal('abcd');
        });
        cy.contains('mat-button-toggle', 'Text').find('button').click({ force: true });
        cy.get('math-field').shadow().find('[part=keyboard-sink]').type('{enter}e', { force: true });
        cy.get('math-field').should($el => {
          const field = $el[0] as HTMLElement & { getValue(): string };
          expect(field.getValue()).to.equal('\\displaylines{abcd\\\\ \\text{e}}');
        });
      });
      cy.clickOutside();
    });

    // Every math field was multi-line with #1648; only those with the option are (#1696).
    it('checks that Enter starts no new line in a math-field without „Mehrzeilig“ (#1696)', () => {
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Pflichtfeld').find('math-field')
        .then($mathField => {
          cy.wrap($mathField).shadow().find('.ML__content').click()
            .type('a{enter}b');
          cy.wrap($mathField).should($el => {
            const field = $el[0] as HTMLElement & { getValue(): string };
            expect(field.getValue()).to.equal('ab');
          });
        });
      cy.clickOutside();
    });

    /* Emptied, the root used to lose its box and to drop by about 5px, as MathLive lays out an empty part
       lower than one with a box in it (#760). */
    it('keeps the root sign where it was when the content of the root is deleted (#760)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').find('math-field')
        .then($mathField => {
          const field = $mathField[0] as HTMLElement & { getValue(): string; setValue(value: string): void };
          field.setValue('');
          cy.wrap($mathField).shadow().find('.ML__content').click();
          pressKeycap(keycapWith('the root key', definition => definition.latex === '\\sqrt{#0}'));
          // From the top of the field, so that a scroll of the page between the readings does not count
          const signFromFieldTop = (fieldElement: HTMLElement): number => {
            const sign = fieldElement.shadowRoot?.querySelector('.ML__sqrt-sign') as HTMLElement;
            return sign.getBoundingClientRect().top - fieldElement.getBoundingClientRect().top;
          };
          cy.wrap($mathField).shadow().find('.ML__sqrt-sign').then(() => {
            const freshTop = signFromFieldTop($mathField[0]);
            pressKeycap(keycapWith('the key 2', definition => definition.latex === '2'));
            cy.wrap($mathField).should($el => {
              expect(($el[0] as typeof field).getValue()).to.equal('\\sqrt2');
            });
            pressKeycap(keycapWith('the backspace key', ({ command }) => String(command).includes('deleteBackward')));
            cy.wrap($mathField).should($el => {
              expect(($el[0] as typeof field).getValue()).to.equal('\\sqrt{\\placeholder{}}');
              expect(signFromFieldTop($el[0]), 'top of the root sign').to.be.closeTo(freshTop, 0.5);
            });
          });
        });
      cy.clickOutside();
    });

    it('keeps letters and signs typed on a physical keyboard as they were typed (#760)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').find('math-field')
        .then($mathField => {
          const field = $mathField[0] as HTMLElement & { getValue(): string; setValue(value: string): void };
          field.setValue('');
          cy.wrap($mathField).shadow().find('.ML__content').click()
            .type('nn5mm<=3*4');
          cy.wrap($mathField).should($el => {
            expect(($el[0] as typeof field).getValue()).to.equal('nn5mm<=3\\cdot4');
          });
        });
      cy.clickOutside();
    });

    /* The regular font draws + and − with thinner strokes than the digits, so on a screen of normal pixel
       density the two keys looked grey and blurred beside the black digit keys. × and ÷ came in the system
       font, far smaller than + and − (#760). */
    it('draws +, −, × and ÷ on the formula keys from the bold font and the digits from the regular one (#760)', () => {
      cy.contains('aspect-element-group-selection', 'Standard Formel Feld').find('math-field')
        .shadow().find('.ML__content').click();
      // Both weights loaded, so that a canvas measures a character in the font it names
      cy.document().then(doc => Promise.all(['400', '700']
        .map(weight => doc.fonts.load(`${weight} 20px KaTeX_Main`, '+−×÷1'))));
      cy.get<HTMLElement>(`${VISIBLE_KEYBOARD_LAYER} .MLK__keycap .ML__cmr`).should($glyphs => {
        const doc = $glyphs[0].ownerDocument;
        const glyph = (character: string): HTMLElement => Array.from($glyphs)
          .find(span => span.textContent === character) as HTMLElement;
        const context = doc.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        // The width of a character in KaTeX_Main of the given weight, at the size the key draws it
        const advance = (character: string, weight: string): number => {
          const size = (doc.defaultView as Window).getComputedStyle(glyph(character)).fontSize;
          context.font = `${weight} ${size} KaTeX_Main`;
          return context.measureText(character).width;
        };
        ['+', '−', '×', '÷'].forEach(sign => {
          expect(glyph(sign), `${sign} typeset like the digits`).to.not.equal(undefined);
          expect(glyph(sign).getBoundingClientRect().width, sign).to.be.closeTo(advance(sign, '700'), 0.1);
        });
        expect(glyph('1').getBoundingClientRect().width, '1').to.be.closeTo(advance('1', '400'), 0.1);
      });
      cy.clickOutside();
    });
  });

  /* In the paging mode concat-scroll a page is part of the document already when its fields are set up,
     and MathLive announced the preset as input: the player reported the untouched field as changed
     (#1734). VALUE_CHANGED is final, so the first assertion fails on its own, the second names the cause. */
  context('player in the paging mode concat-scroll', () => {
    before('opens a player, and loads the saved unit scrolled together', () => {
      cy.openPlayer();
      addPostMessageStub();
      cy.loadUnitWithOptions('../downloads/math-field.json', { pagingMode: 'concat-scroll' });
    });

    it('reports the untouched math-field with a preset as displayed, not as changed (#1734)', () => {
      const presetCode = (status: string) => Cypress.sinon.match.has(
        'unitState',
        Cypress.sinon.match.has(
          'dataParts',
          Cypress.sinon.match.has('elementCodes', Cypress.sinon.match(`"status":"${status}","value":"abc"`))
        )
      );
      cy.contains('aspect-element-group-selection', 'Formel Feld mit Vorbelegung').scrollIntoView();
      cy.get('@postMessage').should('be.calledWithMatch', presetCode('DISPLAYED'));
      cy.get('@postMessage').should('not.be.calledWithMatch', presetCode('VALUE_CHANGED'));
    });
  });
});

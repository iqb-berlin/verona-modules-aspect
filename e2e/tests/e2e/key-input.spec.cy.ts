import {addNewPage, addTextField, setCheckbox} from '../util';
import {setInputAssistance, setKeyStyle} from './helpers/text-field-util';


describe('Key-input: keyboards, keypads, configs & layouts', { testIsolation: false }, () => {

  // ══════════════════════════════════════════════════════════════════════════
  // EDITOR
  // ══════════════════════════════════════════════════════════════════════════
  context('editor', () => {
    before('opens an editor', () => {
      cy.viewport(1600, 900);
      cy.openEditor();
    });

    // ── Page 1: numbers & decimals ────────────────────────────────────────
    it('creates a text field with "numbers" keypad (Page 1)', () => {
      addTextField('Ziffern');
      setInputAssistance('Ziffern', 'schwebend');
      setKeyStyle('eckig');
    });

    it('creates a text field with "decimals" keypad (Page 1)', () => {
      addTextField('Ziffern & Komma');
      setInputAssistance('Ziffern & Komma', 'schwebend');
      setKeyStyle('eckig');
    });

    // ── Page 2: comparisonOperators & french ──────────────────────────────
    it('creates a text field with "comparisonOperators" keypad (Page 2)', () => {
      addNewPage();
      addTextField('Vergleichsoperatoren');
      setInputAssistance('Vergleichsoperatoren', 'rechts');
      setKeyStyle('rund');
    });

    it('creates a text field with "french" keypad (Page 2)', () => {
      addTextField('Französische Sonderzeichen');
      setInputAssistance('Französische Sonderzeichen', 'schwebend');
      setKeyStyle('rund');
    });

    // ── Page 3: chemicalEquation & numbersAndOperators ────────────────────
    it('creates a text field with "chemicalEquation" keypad (Page 3)', () => {
      addNewPage();
      addTextField('Reaktionsgleichung Chemie');
      setInputAssistance('Reaktionsgleichung Chemie', 'rechts');
      setKeyStyle('eckig');
    });

    it('creates a text field with "numbersAndOperators" keypad (Page 3)', () => {
      addTextField('Ziffern & Operatoren & \'=\'');
      setInputAssistance('Ziffern & Operatoren & \'=\'', 'schwebend');
      setKeyStyle('eckig');
    });

    // ── Page 4: squareDashDot & placeValue ───────────────────────────────
    it('creates a text field with "squareDashDot" keypad (Page 4)', () => {
      addNewPage();
      addTextField('Quadrat Strich Punkt');
      setInputAssistance('Quadrat Strich Punkt', 'schwebend');
      setKeyStyle('eckig');
    });

    it('creates a text field with "placeValue" keypad (Page 4)', () => {
      addTextField('Stellenwert');
      setInputAssistance('Stellenwert', 'schwebend');
      setKeyStyle('eckig');
    });

    // ── Page 5: custom (restricted + backspace) & numbers with arrow keys ─
    it('creates a custom keypad with restricted chars and backspace (Page 5)', () => {
      addNewPage();
      addTextField('Eigene Zeichen ABC');
      setInputAssistance('Eigene Zeichen', 'schwebend', 'ABC', {
        disableOtherCharacters: true,
        addArrowButtons: false
      });
      setKeyStyle('eckig');
      // Enable backspace for custom via the checkbox (already included in layout by setInputAssistance default)
      setCheckbox('Löschtaste hinzufügen');
    });

    it('creates a numbers keypad with arrow keys (Page 5)', () => {
      addTextField('Ziffern mit Pfeiltasten');
      setInputAssistance('Ziffern', 'rechts', undefined, { addArrowButtons: true });
      setKeyStyle('rund');
    });

    // ── Page 6: software keyboard ─────────────────────────────────────────
    it('creates a text field with software keyboard (Page 6)', () => {
      addNewPage();
      addTextField('Tastatur einblenden');
      setCheckbox('Tastatur einblenden');
    });

    it('creates a text field with software keyboard + numbers input assistance (Page 6)', () => {
      addTextField('Tastatur & Eingabehilfe');
      setCheckbox('Tastatur einblenden');
      setInputAssistance('Ziffern', 'schwebend');
      setCheckbox('Tastatur mit Eingabehilfe erweitern');
    });

    after('saves the unit definition', () => {
      cy.saveUnit('e2e/downloads/key-input.json');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PLAYER
  // ══════════════════════════════════════════════════════════════════════════
  context('player', () => {
    before('opens a player and loads the saved json file', () => {
      // What it does: It defines a dummy ontouchstart property/event handler on the global window object.
      /* Why it's needed: A very common legacy and modern way to detect touch capability in JavaScript is checking
      if the 'ontouchstart' in window condition is true. By assigning an empty function to win.ontouchstart,
       the application's touch-detection logic will successfully evaluate this check as true.
       */
      cy.visit('http://localhost:4202/', {
        onBeforeLoad: (win) => {
          Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
          (win as any).ontouchstart = () => {};
        }
      });
      cy.loadUnit('../downloads/key-input.json');
    });

    // ── Page 1: numbers & decimals ────────────────────────────────────────
    it('numbers keypad appears on focus and shows correct keys (Page 1)', () => {
      cy.goToPlayerPage(1);
      cy.get('aspect-keypad').should('not.exist');
      cy.contains('mat-form-field', 'Ziffern').click();
      cy.get('aspect-keypad').should('be.visible');
      // Digits 0–9 present
      ['0', '1', '7', '9'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
      // No comma for plain numbers
      cy.get('aspect-keypad').contains('button', ',').should('not.exist');
    });

    it('types via numbers keypad into the field (Page 1)', () => {
      cy.contains('mat-form-field', 'Ziffern').click();
      cy.get('aspect-keypad').contains('button', '4').click();
      cy.get('aspect-keypad').contains('button', '2').click();
      cy.contains('mat-form-field', 'Ziffern').find('input').should('have.value', '42');
    });

    it('decimals keypad shows comma key (Page 1)', () => {
      cy.contains('mat-form-field', 'Ziffern & Komma').click();
      cy.get('aspect-keypad').should('be.visible');
      cy.get('aspect-keypad').contains('button', ',').should('exist');
      cy.get('aspect-keypad').contains('button', '5').click();
      cy.get('aspect-keypad').contains('button', ',').click();
      cy.get('aspect-keypad').contains('button', '3').click();
      cy.contains('mat-form-field', 'Ziffern & Komma').find('input').should('have.value', '5,3');
    });

    // ── Page 2: comparison operators & french ──────────────────────────────
    it('comparison operators keypad shows <, =, > keys (Page 2)', () => {
      cy.goToPlayerPage(2);
      cy.contains('mat-form-field', 'Vergleichsoperatoren').click();
      cy.get('aspect-keypad').should('be.visible');
      ['<', '=', '>'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
    });

    it('types via comparison operators keypad (Page 2)', () => {
      cy.contains('mat-form-field', 'Vergleichsoperatoren').click();
      cy.get('aspect-keypad').contains('button', '<').click();
      cy.contains('mat-form-field', 'Vergleichsoperatoren').find('input').should('have.value', '<');
    });

    it('french keypad shows accented characters (Page 2)', () => {
      cy.contains('mat-form-field', 'Französische Sonderzeichen').click();
      cy.get('aspect-keypad').should('be.visible');
      ['â', 'à', 'é', 'ç'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
    });

    it('french keypad shift layer shows uppercase accented characters (Page 2)', () => {
      cy.contains('mat-form-field', 'Französische Sonderzeichen').click();
      cy.get('aspect-keypad').should('be.visible');
      // Click Shift to toggle uppercase layer
      cy.get('aspect-keypad').find('button').contains('keyboard_arrow_up').parent().click();
      cy.get('aspect-keypad').contains('button', 'Â').should('exist');
      cy.get('aspect-keypad').contains('button', 'Ç').should('exist');
    });

    // ── Page 3: chemicalEquation & numbersAndOperators ────────────────────
    it('chemicalEquation keypad shows subscript/superscript and reaction arrow keys (Page 3)', () => {
      cy.goToPlayerPage(3);
      cy.contains('mat-form-field', 'Reaktionsgleichung Chemie').click();
      cy.get('aspect-keypad').should('be.visible');
      // subscripts
      ['₀', '₁', '₂'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
      // reaction symbols
      ['→', '↔', '+'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
    });

    it('types via chemical equation keypad (Page 3)', () => {
      cy.contains('mat-form-field', 'Reaktionsgleichung Chemie').click();
      cy.get('aspect-keypad').contains('button', 'H').should('not.exist'); // no letters
      cy.get('aspect-keypad').contains('button', '→').click();
      cy.contains('mat-form-field', 'Reaktionsgleichung Chemie').find('input').should('have.value', '→');
    });

    it('numbersAndOperators keypad shows digits and operator keys including "=" (Page 3)', () => {
      cy.contains('mat-form-field', 'Ziffern & Operatoren & \'=\'').click();
      cy.get('aspect-keypad').should('be.visible');
      ['7', '0', '+', '-', '='].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
    });

    // ── Page 4: squareDashDot & placeValue ───────────────────────────────
    it('squareDashDot keypad shows ⬜, ❘, ∙ keys (Page 4)', () => {
      cy.goToPlayerPage(4);
      cy.contains('mat-form-field', 'Quadrat Strich Punkt').click();
      cy.get('aspect-keypad').should('be.visible');
      ['⬜', '❘', '∙'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
    });

    it('types via squareDashDot keypad (Page 4)', () => {
      cy.contains('mat-form-field', 'Quadrat Strich Punkt').click();
      cy.get('aspect-keypad').contains('button', '⬜').click();
      cy.contains('mat-form-field', 'Quadrat Strich Punkt').find('input').should('have.value', '⬜');
    });

    it('placeValue keypad shows • key (Page 4)', () => {
      cy.contains('mat-form-field', 'Stellenwert').click();
      cy.get('aspect-keypad').should('be.visible');
      cy.get('aspect-keypad').contains('button', '•').should('exist');
    });

    it('types via placeValue keypad (Page 4)', () => {
      cy.contains('mat-form-field', 'Stellenwert').click();
      cy.get('aspect-keypad').contains('button', '•').click();
      cy.contains('mat-form-field', 'Stellenwert').find('input').should('have.value', '•');
    });

    // ── Page 5: custom (restricted + backspace) & arrow keys ─────────────
    it('custom keypad shows only A, B, C and a backspace key (Page 5)', () => {
      cy.goToPlayerPage(5);
      cy.contains('mat-form-field', 'Eigene Zeichen ABC').click();
      cy.get('aspect-keypad').should('be.visible');
      ['A', 'B', 'C'].forEach(key => {
        cy.get('aspect-keypad').contains('button', key).should('exist');
      });
      // backspace icon should exist (enabled in editor)
      cy.get('aspect-keypad').find('button mat-icon').contains('backspace').should('exist');
      // no digits should appear
      cy.get('aspect-keypad').contains('button', '1').should('not.exist');
    });

    it('custom keypad restriction prevents typing non-allowed characters (Page 5)', () => {
      cy.contains('mat-form-field', 'Eigene Zeichen ABC').find('input').as('restrictedInput');
      cy.get('@restrictedInput').clear().type('XYZ');
      // The input should be empty because characters are restricted
      cy.get('@restrictedInput').should('have.value', '');
    });

    it('custom keypad allows typing A, B, C and backspace (Page 5)', () => {
      cy.contains('mat-form-field', 'Eigene Zeichen ABC').click();
      cy.get('aspect-keypad').contains('button', 'A').click();
      cy.get('aspect-keypad').contains('button', 'B').click();
      cy.get('aspect-keypad').contains('button', 'C').click();
      cy.contains('mat-form-field', 'Eigene Zeichen ABC').find('input').should('have.value', 'ABC');
      // backspace removes last char
      cy.get('aspect-keypad').find('button mat-icon').contains('backspace').click();
      cy.contains('mat-form-field', 'Eigene Zeichen ABC').find('input').should('have.value', 'AB');
    });

    it('numbers keypad with arrow keys shows arrow buttons (Page 5)', () => {
      cy.contains('mat-form-field', 'Ziffern mit Pfeiltasten').click();
      cy.get('aspect-keypad').should('be.visible');
      // Arrow keys rendered as mat-icons
      ['arrow_back', 'arrow_forward'].forEach(icon => {
        cy.get('aspect-keypad').find('mat-icon').contains(icon).should('exist');
      });
    });

    // ── Page 6: software keyboard ─────────────────────────────────────────
    it('software keyboard appears when field is focused (Page 6)', () => {
      cy.goToPlayerPage(6);
      cy.get('aspect-keyboard').should('not.exist');
      cy.contains('mat-form-field', 'Tastatur einblenden').find('input').click();
      cy.get('aspect-keyboard').should('be.visible');
    });

    it('software keyboard contains letters, digits and special keys (Page 6)', () => {
      cy.contains('mat-form-field', 'Tastatur einblenden').find('input').click();
      cy.get('aspect-keyboard').should('be.visible');
      // default row characters
      ['q', 'w', 'e', 'r', 'a', 's', '1', '2', 'ü', 'ö', 'ä'].forEach(key => {
        cy.get('aspect-keyboard').contains('button', key).should('exist');
      });
    });

    it('software keyboard shift layer shows uppercase and special chars (Page 6)', () => {
      cy.contains('mat-form-field', 'Tastatur einblenden').find('input').click();
      cy.get('aspect-keyboard').should('be.visible');
      // Click Shift
      cy.get('aspect-keyboard').find('button').contains('keyboard_arrow_up').first().click();
      ['Q', 'W', 'E', 'R', 'A', 'S', 'Ü', 'Ö', 'Ä'].forEach(key => {
        cy.get('aspect-keyboard').contains('button', key).should('exist');
      });
    });

    it('software keyboard with input assistance shows extra keypad row (Page 6)', () => {
      cy.contains('mat-form-field', 'Tastatur & Eingabehilfe').find('input').click();
      cy.get('aspect-keyboard').should('be.visible');
      // The input assistance (numbers) should appear as an additional row in the keyboard
      ['0', '1', '7'].forEach(key => {
        cy.get('aspect-keyboard').contains('button', key).should('exist');
      });
    });

    it('typing via software keyboard populates the field (Page 6)', () => {
      cy.contains('mat-form-field', 'Tastatur einblenden').find('input').click();
      cy.wait(150);
      cy.get('aspect-keyboard').should('be.visible');
      // Type 'hi' via keyboard keys
      cy.get('aspect-keyboard').contains('button', 'h').click();
      cy.get('aspect-keyboard').contains('button', 'i').click();
      cy.contains('mat-form-field', 'Tastatur einblenden').find('input').should('have.value', 'hi');
    });
  });
});

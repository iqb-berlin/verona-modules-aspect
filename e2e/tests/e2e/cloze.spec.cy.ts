import { createCloze } from './helpers/cloze-util';
import { connectLists, dragTo } from './helpers/droplist-util';
import {
  setID, setCheckbox, addOption, addElement, selectParagraphElement
} from '../util';

const STYLED_CLOZE_TEXT = 'gestylter Lückentext';
const STYLED_HEADINGS: Record<number, string> = {
  1: 'gestylte Ueberschrift H1',
  2: 'gestylte Ueberschrift H2',
  3: 'gestylte Ueberschrift H3',
  4: 'gestylte Ueberschrift H4'
};
const RICH_CLOZE_TEXT = 'Aufzaehlung';
const UNIT_PATH = 'e2e/downloads/cloze.json';

/** The element carrying this cloze's own text, not any `p` or heading that happens to sit inside it. */
function clozeText(tag: string, text: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('aspect-cloze', text).contains(tag, text);
}

function styleCheckbox(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('aspect-element-style-properties')
    .contains('mat-checkbox', label)
    .find('[type="checkbox"]');
}

/**
 * Material draws a fake box and hides the input, so a click on `mat-checkbox` often misses the
 * control. Same re-query as `setCheckbox`: the panel rebuilds on every write.
 */
function setStyleCheckbox(label: string, checked: boolean): void {
  styleCheckbox(label).then($box => {
    if ($box.is(':checked') !== checked) {
      styleCheckbox(label).click({ force: true });
    }
  });
  styleCheckbox(label).should(checked ? 'be.checked' : 'not.be.checked');
}

/**
 * The five font bindings of `cloze.component.html`, which the template repeats on the paragraph and
 * on every heading level. Asserted from the `style` attribute rather than the computed value for
 * the three switches, because the template writes the keyword and the browser reports `700` for
 * `bold` and `none` for a decoration that was never set.
 */
function expectStyledFont(tag: string, text: string): void {
  clozeText(tag, text)
    .should('have.css', 'font-size', '28px')
    .should('have.css', 'color', 'rgb(0, 96, 100)')
    .should('have.attr', 'style')
    .and('contain', 'line-height: 135%')
    .and('contain', 'font-weight: bold')
    .and('contain', 'font-style: italic')
    .and('contain', 'text-decoration: underline');
}

function expectDefaultFont(tag: string, text: string): void {
  clozeText(tag, text)
    .should('have.css', 'font-size', '20px')
    .should('have.css', 'color', 'rgb(0, 0, 0)')
    .should('have.attr', 'style')
    .and('contain', 'line-height: 180%')
    .and('not.contain', 'font-weight: bold')
    .and('not.contain', 'font-style: italic')
    .and('not.contain', 'text-decoration: underline');
}

/** Writes the font of `expectStyledFont` into the style tab of the selected element. */
function applyElementFont(): void {
  cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'palette')
    .click({ force: true });
  cy.get('aspect-element-style-properties')
    .contains('mat-form-field', 'Schriftgröße')
    .find('input')
    .clear()
    .type('28{enter}');
  cy.get('aspect-element-style-properties')
    .contains('mat-form-field', 'Zeilenhöhe')
    .find('input')
    .clear()
    .type('135{enter}');
  cy.get('aspect-element-style-properties')
    .contains('mat-form-field', 'Schriftfarbe')
    .find('input')
    .clear()
    .type('#006064{enter}');
  setStyleCheckbox('Fett', true);
  setStyleCheckbox('Kursiv', true);
  setStyleCheckbox('Unterstrichen', true);
  cy.get('aspect-element-properties .mat-mdc-tab').contains('mat-icon', 'build')
    .click({ force: true });
}

function openClozeEditor(id: string): void {
  addElement('Lückentext', 'Verbund', id);
  cy.get('aspect-ui-element-properties')
    .contains('mat-form-field', 'ID').find('input').should('have.value', id);
  cy.get('aspect-ui-element-properties').contains('button', 'edit').click();
  cy.get('mat-dialog-container .ProseMirror').should('be.visible');
}

function saveClozeEditor(): void {
  cy.contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
}

function selectClozeBlock(text: string): void {
  cy.get('mat-dialog-container .ProseMirror').contains(text).then(selectParagraphElement);
}

function setClozeHeading(text: string, level: number): void {
  selectClozeBlock(text);
  cy.get('mat-dialog-container').contains('mat-form-field', 'Typ').find('mat-select').click();
  cy.get('.cdk-overlay-container').contains('mat-option', `H${level}`).click();
  cy.get(`mat-dialog-container .ProseMirror h${level}`).should('contain.text', text);
}

function insertClozeImage(kind: 'inline' | 'block'): void {
  const icon = kind === 'inline' ? 'burst_mode' : 'image';
  cy.get('mat-dialog-container').contains('legend', 'Bild').parent()
    .find('mat-icon').contains(icon).parent('button').click();
  cy.get('mat-dialog-container').find('input[type=file]')
    .selectFile('example_data/media/446878.jpeg', { action: 'select', force: true });
  cy.get('aspect-image-resize-dialog').contains('button', 'Speichern').click();
  cy.get('aspect-image-resize-dialog').should('not.exist');
}

/**
 * The `Typ` dropdown of the text editor offers H1 to H4, so those four go through the dialog.
 * `createCloze` cannot do this itself: the level is set inside the dialog it closes.
 */
function createHeadingCloze(id: string): void {
  openClozeEditor(id);
  cy.get('mat-dialog-container .ProseMirror p').clear();
  cy.get('mat-dialog-container .ProseMirror p')
    .type(`${STYLED_HEADINGS[1]}{enter}${STYLED_HEADINGS[2]}{enter}${STYLED_HEADINGS[3]}{enter}${STYLED_HEADINGS[4]}`);
  [1, 2, 3, 4].forEach(level => setClozeHeading(STYLED_HEADINGS[level], level));
  saveClozeEditor();
}

describe('Cloze element', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      cy.openEditor();
    });

    it('creates a default cloze with Lorem Ipsum text', () => {
      createCloze('Lückentext', 'normaler Lückentext');
    });

    it('creates a cloze and inserts a text-field inside it', () => {
      createCloze('Lückentext2', 'Lückentext mit Eingabefeld', 'Eingabefeld');
    });

    it('creates a cloze and inserts a drop-list inside it', () => {
      createCloze('Lückentext3', 'Lückentext mit Ablegeliste', 'Ablegeliste', ['AAA', 'BBB', 'CCC'], {}, 'droplist1');
    });

    it('creates a cloze and inserts a toggle-button inside it', () => {
      createCloze('Lückentext4', 'Lückentext mit Optionsfeld', 'Optionsfeld');
    });

    it('creates a cloze and inserts a button inside it', () => {
      createCloze('Lückentext5', 'Lückentext mit Knopf', 'Knopf');
    });

    it('creates a cloze and inserts a checkbox inside it', () => {
      createCloze('Lückentext6', 'Lückentext mit Kontrollkästchen', 'Kontrollkästchen');
    });

    it('creates a second cloze with drop-list inside it', () => {
      createCloze('Lückentext7', 'Lückentext mit Ablegeliste 2', 'Ablegeliste', [], {}, 'droplist2');
    });

    it('creates a cloze and inserts a dropdown inside it', () => {
      createCloze('Lückentext8', 'Lückentext mit Klappliste', 'Klappliste');

      // Select the child dropdown overlay in the 8th Cloze in editor canvas
      cy.get('aspect-cloze').eq(7).find('aspect-compound-child-overlay').first().click();

      // Add options to it
      addOption('AAA');
      addOption('BBB');
    });

    it('creates a cloze with a required text-field child', () => {
      createCloze('Lückentext9', 'Lückentext für Validierung', 'Eingabefeld');

      // Select the child simple text-field overlay in editor canvas
      cy.get('aspect-cloze').last().find('aspect-compound-child-overlay').first().click();

      // Set its ID to cloze-child-text-field
      setID('cloze-child-text-field');

      // Mark the child text-field as required (Pflichtfeld)
      setCheckbox('Pflichtfeld');
    });

    it('creates a cloze and paints it with its own font', () => {
      createCloze('Lückentext10', STYLED_CLOZE_TEXT);

      cy.get('aspect-ui-element-properties')
        .contains('mat-form-field', 'ID').find('input').should('have.value', 'Lückentext10');
      applyElementFont();

      expectStyledFont('p', STYLED_CLOZE_TEXT);
    });

    it('creates a cloze whose headings wear the element font too', () => {
      createHeadingCloze('Lückentext11');
      applyElementFont();

      [1, 2, 3, 4].forEach(level => {
        expectStyledFont(`h${level}`, STYLED_HEADINGS[level]);
        clozeText(`h${level}`, STYLED_HEADINGS[level]).should('have.css', 'display', 'inline');
      });
    });

    it('creates a cloze that uses every document node the template knows', () => {
      openClozeEditor('Lückentext12');
      cy.get('mat-dialog-container .ProseMirror p').clear();
      cy.get('mat-dialog-container .ProseMirror p').type(
        `${RICH_CLOZE_TEXT}{enter}Nummerierung{enter}Zitat{enter}` +
        'eingerueckt{enter}haengend{enter}' +
        'hoch{enter}tief{enter}durchgestrichen{enter}Formelabsatz{enter}' +
        'Ueberschrift eins{enter}Ueberschrift zwei{enter}Ueberschrift drei{enter}Ueberschrift vier'
      );

      selectClozeBlock(RICH_CLOZE_TEXT);
      cy.get('mat-dialog-container')
        .contains('aspect-combo-button', 'format_list_bulleted').find('button.apply-button').click();
      selectClozeBlock('Nummerierung');
      cy.get('mat-dialog-container')
        .contains('aspect-combo-button', 'format_list_numbered').find('button.apply-button').click();
      selectClozeBlock('Zitat');
      cy.get('mat-dialog-container').find('mat-icon').contains('format_quote').parent('button').click();

      selectClozeBlock('eingerueckt');
      cy.get('mat-dialog-container').find('mat-icon').contains('format_indent_increase').parent('button').click();
      cy.get('mat-dialog-container').contains('mat-form-field', 'Abstand').find('mat-select').click();
      cy.get('.cdk-overlay-container').contains('mat-option', '10px').click();

      selectClozeBlock('haengend');
      cy.get('mat-dialog-container').find('mat-icon').contains('segment').parent('button').click();

      selectClozeBlock('hoch');
      cy.get('mat-dialog-container').find('mat-icon').contains('superscript').parent('button').click();
      selectClozeBlock('tief');
      cy.get('mat-dialog-container').find('mat-icon').contains('subscript').parent('button').click();
      selectClozeBlock('durchgestrichen');
      cy.get('mat-dialog-container').find('mat-icon').contains('strikethrough_s').parent('button').click();

      selectClozeBlock('Formelabsatz');
      cy.get('mat-dialog-container').find('mat-icon').contains('functions').parent('button').click();
      cy.get('mat-dialog-container').find('aspect-nodeview-math-formula').click();
      cy.get('mat-dialog-container').find('aspect-nodeview-math-formula [contenteditable="true"]')
        .type(' \\overline{{}BC{}}{enter}');

      setClozeHeading('Ueberschrift eins', 1);
      setClozeHeading('Ueberschrift zwei', 2);
      setClozeHeading('Ueberschrift drei', 3);
      setClozeHeading('Ueberschrift vier', 4);

      cy.get('mat-dialog-container .ProseMirror').click().type('{end}{enter}');
      insertClozeImage('inline');
      cy.get('mat-dialog-container .ProseMirror').click().type('{end}{enter}');
      insertClozeImage('block');

      saveClozeEditor();
    });

    it('connects the droplists, and add two options for the first droplist inside cloze', () => {
      connectLists('droplist1', 'droplist2');
      connectLists('droplist2', 'droplist1');
    });

    after('saves unit definition', () => {
      cy.saveUnit(UNIT_PATH);
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      cy.openPlayer();
      cy.loadUnit('../downloads/cloze.json');
    });

    it('renders all cloze elements', () => {
      cy.get('aspect-cloze').should('have.length', 12);
    });

    it('first cloze renders the default Lorem Ipsum text', () => {
      cy.get('aspect-cloze').eq(0)
        .should('contain.text', 'normaler Lückentext');
    });

    it('first cloze keeps the default font', () => {
      expectDefaultFont('p', 'normaler Lückentext');
    });

    it('second cloze contains a text-field-simple', () => {
      cy.get('aspect-cloze').eq(1)
        .should('contain.text', 'Eingabefeld')
        .find('aspect-text-field-simple').should('have.length', 1);
    });

    it('leaves a text-field-simple without its own colour transparent', () => {
      // The gap is built in the editor above and nobody sets a colour on it, so this is the default
      // reaching the page. Before #1429 it was #f1f1f1, which covered the section behind it; the
      // border keeps the gap visible either way. Asserted on the rendered input because the guards
      // in the unit tests read the model, not the paint.
      cy.get('aspect-cloze').eq(1)
        .find('aspect-text-field-simple input')
        .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    });

    it('types into the text-field-simple inside the cloze', () => {
      cy.get('aspect-cloze').eq(1)
        .find('aspect-text-field-simple')
        .find('input')
        .type('Antwort');
      cy.get('aspect-cloze').eq(1)
        .find('aspect-text-field-simple')
        .find('input')
        .should('have.value', 'Antwort');
    });

    it('third cloze contains a drop-list', () => {
      cy.get('aspect-cloze').eq(2)
        .should('contain.text', 'Ablegeliste')
        .find('aspect-drop-list').should('have.length', 1);
    });

    it('fourth cloze contains a toggle-button and selects Option A', () => {
      cy.get('aspect-cloze').eq(3)
        .should('contain.text', 'Optionsfeld')
        .find('aspect-toggle-button').should('have.length', 1);
      cy.get('mat-button-toggle').find('button:contains("Option A")').click();
    });

    it('fifth cloze contains a button', () => {
      cy.get('aspect-cloze').eq(4)
        .should('contain.text', 'Knopf')
        .find('aspect-button').should('have.length', 1);
    });

    it('sixth cloze contains a checkbox and strikes through it', () => {
      cy.get('aspect-cloze').eq(5)
        .should('contain.text', 'Kontrollkästchen')
        .find('aspect-checkbox').should('have.length', 1);
      cy.get('aspect-checkbox').click();
    });

    it('drags AAA from droplist1 to droplist2', () => {
      dragTo('droplist1', 'AAA', 'droplist2');
    });

    it('seventh cloze contains a dropdown', () => {
      cy.get('aspect-cloze').eq(7)
        .should('contain.text', 'Klappliste')
        .find('aspect-dropdown').should('have.length', 1);
    });

    it('hangs the dropdown in the line by its text, not by its box', () => {
      // The gap wears the font of the element since #1435, so its text has to meet the text beside
      // it. `middle` centres the box in the line instead, which left the glyphs 1.6px low at the
      // 20px default and the box 1.6px below the box of a text-field gap in the same line. Asserted
      // on the computed value because the binding in the cloze template is not the only way to lose
      // it -- a rule in any stylesheet reaching this overlay would do.
      cy.get('aspect-cloze').eq(7)
        .find('aspect-compound-child-overlay')
        .should('have.css', 'vertical-align', 'baseline');
    });

    it('selects an option from dropdown inside cloze', () => {
      cy.get('aspect-cloze').eq(7)
        .find('aspect-dropdown mat-select')
        .click();
      cy.get('.cdk-overlay-container').contains('BBB').click();

      cy.get('aspect-cloze').eq(7)
        .find('aspect-dropdown mat-select-trigger')
        .contains('BBB');
    });

    it('9th cloze displays error message for required text-field inside cloze when touched', () => {
      // The message belongs under its own gap. It used to be placed against the section instead, which
      // put every message of a section on the same line whatever line its gap was in (#1052) -- and the
      // assertion here pinned that: it asked for the `top: 35px` the old placement computed. Comparing
      // the two boxes says what is meant and does not have to be rewritten when a gap changes size.
      // Initially, error should not exist
      cy.get('aspect-cloze-child-error-message').should('not.exist');

      // Click / Focus simple text field input inside 9th cloze
      cy.get('aspect-cloze').eq(8)
        .find('aspect-text-field-simple input')
        .click();

      // Blur the input by clicking elsewhere (e.g. another cloze element)
      cy.get('aspect-cloze').eq(0).click();

      // Check that requiredField warning class and message are rendered
      cy.get('aspect-cloze').eq(8)
        .find('aspect-text-field-simple input')
        .should('have.class', 'errors');

      cy.get('aspect-cloze-child-error-message')
        .should('be.visible')
        .and('contain.text', 'Eingabe erforderlich');

      cy.get('aspect-cloze').eq(8)
        .find('aspect-compound-child-overlay')
        .then($gap => {
          const gap = $gap[0].getBoundingClientRect();
          cy.get('aspect-cloze-child-error-message').should($message => {
            const message = $message[0].getBoundingClientRect();
            expect(message.top).to.be.closeTo(gap.bottom, 1);
            expect(message.left).to.be.closeTo(gap.left, 1);
          });
        });
    });

    it('shows the styled cloze in the font that was set', () => {
      expectStyledFont('p', STYLED_CLOZE_TEXT);
    });

    it('shows the styled headings in the font that was set', () => {
      [1, 2, 3, 4].forEach(level => {
        expectStyledFont(`h${level}`, STYLED_HEADINGS[level]);
        clozeText(`h${level}`, STYLED_HEADINGS[level]).should('have.css', 'display', 'inline');
      });
    });

    it('renders lists, a quote, marks, a formula and images from the document', () => {
      cy.contains('aspect-cloze', RICH_CLOZE_TEXT).within(() => {
        cy.get('ul').should('contain.text', RICH_CLOZE_TEXT);
        cy.get('ol').should('contain.text', 'Nummerierung');
        cy.get('blockquote').should('contain.text', 'Zitat');
        cy.get('sup').should('contain.text', 'hoch');
        cy.get('sub').should('contain.text', 'tief');
        cy.get('s').should('contain.text', 'durchgestrichen');
        cy.get('.ML__latex').should('exist');
        cy.get('img').should('have.length.at.least', 2);
      });
    });

    it('indents a paragraph from the left and hangs the next one', () => {
      clozeText('p', 'eingerueckt')
        .should('have.css', 'margin-left', '20px')
        .should('have.css', 'margin-bottom', '10px');
      clozeText('p', 'haengend')
        .should('have.attr', 'style')
        .and('contain', 'text-indent');
    });

    it('keeps the rich cloze headings on the default font', () => {
      expectDefaultFont('h1', 'Ueberschrift eins');
      expectDefaultFont('h2', 'Ueberschrift zwei');
      expectDefaultFont('h3', 'Ueberschrift drei');
      expectDefaultFont('h4', 'Ueberschrift vier');
    });
  });
});

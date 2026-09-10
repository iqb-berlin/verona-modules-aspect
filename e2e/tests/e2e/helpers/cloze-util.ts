import {
  addElement, addOption, setCheckbox, setID, selectParagraphElement
} from '../../util';
import { setConfigDroplist } from './droplist-util';

export const STYLED_CLOZE_TEXT = 'gestylter Lückentext';
export const STYLED_HEADINGS: Record<number, string> = {
  1: 'gestylte Ueberschrift H1',
  2: 'gestylte Ueberschrift H2',
  3: 'gestylte Ueberschrift H3',
  4: 'gestylte Ueberschrift H4'
};
export const RICH_CLOZE_TEXT = 'Aufzaehlung';

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

function clickClozeEditorIcon(icon: string): void {
  cy.get('mat-dialog-container').find('mat-icon').contains(icon).parent('button').click();
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

export function createCloze(id: string, text: string, contentType?: string, options?:string[],
                            settings?: Record<string, boolean>, secondId?: string): void {
  openClozeEditor(id);
  cy.get('.ProseMirror p').clear();
  cy.get('.ProseMirror p').type(text);
  cy.get('.ProseMirror p').type('\t');
  if (contentType !== undefined) {
    cy.get('mat-dialog-content').find('button').contains(contentType).click();
  }
  saveClozeEditor();
  if (contentType === 'Ablegeliste') {
    cy.get('aspect-drop-list').last().click({ force: true });
    if (secondId !== undefined) {
      setID(secondId);
    }
    setConfigDroplist(options, settings);
  }
}

/** The element carrying this cloze's own text, not any `p` or heading that happens to sit inside it. */
export function clozeText(tag: string, text: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('aspect-cloze', text).contains(tag, text);
}

/**
 * The five font bindings of `cloze.component.html`, which the template repeats on the paragraph and
 * on every heading level. Asserted from the `style` attribute rather than the computed value for
 * the three switches, because the template writes the keyword and the browser reports `700` for
 * `bold` and `none` for a decoration that was never set.
 */
export function expectStyledFont(tag: string, text: string): void {
  clozeText(tag, text)
    .should('have.css', 'font-size', '28px')
    .should('have.css', 'color', 'rgb(0, 96, 100)')
    .should('have.attr', 'style')
    .and('contain', 'line-height: 135%')
    .and('contain', 'font-weight: bold')
    .and('contain', 'font-style: italic')
    .and('contain', 'text-decoration: underline');
}

export function expectDefaultFont(tag: string, text: string): void {
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
export function applyElementFont(): void {
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

/**
 * The `Typ` dropdown of the text editor offers H1 to H4, so those four go through the dialog.
 * `createCloze` cannot do this itself: the level is set inside the dialog it closes.
 */
export function createHeadingCloze(id: string): void {
  openClozeEditor(id);
  cy.get('mat-dialog-container .ProseMirror p').clear();
  cy.get('mat-dialog-container .ProseMirror p')
    .type(`${STYLED_HEADINGS[1]}{enter}${STYLED_HEADINGS[2]}{enter}${STYLED_HEADINGS[3]}{enter}${STYLED_HEADINGS[4]}`);
  [1, 2, 3, 4].forEach(level => setClozeHeading(STYLED_HEADINGS[level], level));
  saveClozeEditor();
}

export function createRichCloze(id: string): void {
  openClozeEditor(id);
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
  clickClozeEditorIcon('format_quote');

  selectClozeBlock('eingerueckt');
  clickClozeEditorIcon('format_indent_increase');
  cy.get('mat-dialog-container').contains('mat-form-field', 'Abstand').find('mat-select').click();
  cy.get('.cdk-overlay-container').contains('mat-option', '10px').click();

  selectClozeBlock('haengend');
  clickClozeEditorIcon('segment');

  selectClozeBlock('hoch');
  clickClozeEditorIcon('superscript');
  selectClozeBlock('tief');
  clickClozeEditorIcon('subscript');
  selectClozeBlock('durchgestrichen');
  clickClozeEditorIcon('strikethrough_s');

  selectClozeBlock('Formelabsatz');
  clickClozeEditorIcon('functions');
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
}

export function addClozeChildOptions(clozeIndex: number, ...options: string[]): void {
  cy.get('aspect-cloze').eq(clozeIndex).find('aspect-compound-child-overlay').first().click();
  options.forEach(option => addOption(option));
}

export function markLastClozeChildRequired(id: string): void {
  cy.get('aspect-cloze').last().find('aspect-compound-child-overlay').first().click();
  setID(id);
  setCheckbox('Pflichtfeld');
}

export function expectStyledHeadings(): void {
  [1, 2, 3, 4].forEach(level => {
    expectStyledFont(`h${level}`, STYLED_HEADINGS[level]);
    clozeText(`h${level}`, STYLED_HEADINGS[level]).should('have.css', 'display', 'inline');
  });
}

export function expectRichClozeDocument(): void {
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
}

export function expectRichClozeIndent(): void {
  clozeText('p', 'eingerueckt')
    .should('have.css', 'margin-left', '20px')
    .should('have.css', 'margin-bottom', '10px');
  clozeText('p', 'haengend')
    .should('have.attr', 'style')
    .and('contain', 'text-indent');
}

export function expectRichClozeDefaultHeadings(): void {
  expectDefaultFont('h1', 'Ueberschrift eins');
  expectDefaultFont('h2', 'Ueberschrift zwei');
  expectDefaultFont('h3', 'Ueberschrift drei');
  expectDefaultFont('h4', 'Ueberschrift vier');
}

export function addPage() {
  cy.contains('add').click();
}

export function addNewPage() {
  cy.contains('button', 'Neue Seite').click();
}

export function navigateToPage(pageIndex: number) {
  cy.contains(`Seite ${pageIndex}`).click();
}

export function addElement(element: string, expansionPanel?: string, id?: string): void {
  // Check if expansion panel is already open; this is important for non-isolated tests
  if (expansionPanel) {
    cy.contains('mat-expansion-panel', expansionPanel).then(expansionPanelElement => {
      if (!expansionPanelElement.hasClass('mat-expanded')) {
        cy.contains(expansionPanel).click();
      }
    });
  }
  cy.contains('button', element).click();
  if (id !== undefined) {
    setID(id);
  }
}

export function addTextField(label: string): void {
  addElement('Eingabefeld');
  setPreferencesElement(label);
}

export function addTextElement(text: string): void {
  addElement('Text');
  cy.get('aspect-element-model-properties-component')
    .contains('edit').click();
  cy.get('.ProseMirror p').clear();
  cy.get('.ProseMirror p').type(text);
  cy.contains('Speichern').click();
}

export function setID(id: string): void {
  cy.get('aspect-element-model-properties-component')
    .contains('mat-form-field', 'ID').find('input')
    .clear()
    .type(id);
}

export function addOption(optionName: string): void {
  cy.contains('fieldset', 'Optionen')
    .contains('mat-form-field', 'Neue Option')
    .find('textarea')
    .clear()
    .type(`${optionName}{enter}`);
}

export function setLabelText(labelText: string): void {
  cy.contains('fieldset', 'Eingabeelement')
    .contains('div', 'Beschriftung').find('textarea')
    .clear()
    .type(labelText);
}

export function setCheckbox(labelText: string): void {
  cy.get('aspect-element-model-properties-component')
    .contains('mat-checkbox', labelText)
    .find('[type="checkbox"]')
    .click();
}

export function selectFromDropdown(dropdownName: string, optionName: string, closeOverlay: boolean = false) {
  cy.get('aspect-element-model-properties-component')
    .contains('mat-form-field', dropdownName).find('mat-select').click();
  cy.get('.cdk-overlay-container').contains('mat-option', new RegExp(`^ ${optionName} $`)).click({ force: true });
  if (closeOverlay) cy.get('body').click();
}

export function addPostMessageStub() {
  const postMessageStub = cy.stub().as('postMessage');
  cy.window().then(window => {
    window.parent.addEventListener('message', e => {
      postMessageStub(e.data);
    });
  });
}

export function assertValueChanged(id: string, value: any): void {
  const regex = new RegExp(
    `\\{"id":"${id}","status":"VALUE_CHANGED","value":${value}\\}`
  );

  cy.get('@postMessage')
    .should('be.calledWithMatch',
      Cypress.sinon.match.has('unitState',
        Cypress.sinon.match.has(
          'dataParts', Cypress.sinon.match.has('elementCodes',
            Cypress.sinon.match(regex))
        )));

}
// alternative without 'has'
// -------------------------
// cy.get('@postMessage')
//   .should('be.calledWithMatch',
//     Cypress.sinon.match({
//       type: 'vopStateChangedNotification',
//       unitState: Cypress.sinon.match({
//         dataParts: Cypress.sinon.match({
//           elementCodes: Cypress.sinon.match('{"id":"dropdown_2","value":2,"status":"VALUE_CHANGED"}')
//         })
//       })
//     }));

export function setPreferencesElement(label: string, settings?: { readOnly?: boolean, required?: boolean, id?: string }): void {
  cy.contains('mat-form-field', 'Beschriftung')
    .find('textarea')
    .clear()
    .type(label);
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
  if (settings?.id) setID(settings.id);
}

export function addElementHover(element: string, option: string) {
  cy.get('aspect-ui-element-toolbox').within(() => {
    cy.get('button').then($buttons => {
      const optionButton = $buttons.filter((i, btn) => btn.innerText.trim() === option && (btn as HTMLElement).offsetParent !== null);
      if (optionButton.length > 0) {
        cy.wrap(optionButton).click();
      } else {
        cy.contains('button', element).trigger('mouseover');
        cy.contains('button', option).click();
      }
    });
  });
  cy.get('aspect-ui-element-toolbox').trigger('mouseleave');
}

export function setPageConfig(pageNumber: number, settings?: Record<string, boolean>) {
  cy.get('button:contains("more_vert")').eq(pageNumber - 1).click();
  if (settings?.alwaysVisible) {
    cy.contains('label', 'Seite dauerhaft sichtbar').click();
  }

  if (settings?.appareancePartial)
    cy.contains('mat-checkbox', 'Seitenbreite begrenzen').click({ force: true });
}

export function clickTabAssistant(){
  cy.contains('mat-icon', 'bookmarks').click();
}

export function submitDialog(){
  cy.get('mat-dialog-container').contains('button', 'Bestätigen').click();
}

export function clickButtonDialog(buttonName: string){
  cy.get('mat-dialog-container').contains('button', buttonName).click();
  cy.get('mat-dialog-container').should('not.exist');
}

export function editText(newText: string) {
  cy.get('mat-dialog-container').find('.input1 .ProseMirror p').first().type(`{selectall}{backspace}${newText}`);
  clickButtonDialog('Bestätigen');
}

export function selectRadioOption(option: string) {
  cy.contains('mat-radio-button', option).find('input').click();
}

export function addNewSection() {
  cy.contains('button', 'Neuer Abschnitt').click();
}

export function setExpertMode(enable: boolean) {
  cy.get('[data-cy="extras-menu"]').click();
  cy.get('.cdk-overlay-container').should('be.visible');
  cy.contains('mat-checkbox', 'Erweiterter Modus').then($checkbox => {
    const isChecked = $checkbox.hasClass('mat-mdc-checkbox-checked') ||
                      $checkbox.hasClass('mat-checkbox-checked') ||
                      $checkbox.find('input').is(':checked');
    if (isChecked !== enable) {
      cy.wrap($checkbox).click();
    }
  });
  cy.get('body').type('{esc}');
  cy.get('.cdk-overlay-backdrop').should('not.exist');
}

export function setSectionDynamicLayout(enable: boolean) {
  cy.get('aspect-editor-section-view').first().scrollIntoView().click({ force: true });
  cy.get('aspect-editor-section-view').first()
    .find('mat-icon').contains('space_dashboard')
    .click({ force: true });

  cy.get('.cdk-overlay-container').should('be.visible');
  cy.wait(500);
  cy.contains('mat-checkbox', 'dynamisches Layout').then($checkbox => {
    const isChecked = $checkbox.hasClass('mat-mdc-checkbox-checked') ||
                      $checkbox.hasClass('mat-checkbox-checked') ||
                      $checkbox.find('input').is(':checked');
    if (isChecked !== enable) {
      cy.log(`Toggling dynamic layout to ${enable}`);
      cy.wrap($checkbox).find('input').click({ force: true });
    }
  });
  cy.get('body').type('{esc}');
  cy.wait(500);
  cy.get('.cdk-overlay-backdrop').should('not.exist');
}

export function switchToElementTab() {
  cy.get('.mat-mdc-tab').contains('mat-icon', 'bookmark').click({ force: true });
}

export function switchToPositionTab() {
  cy.get('.mat-mdc-tab').contains('mat-icon', 'format_shapes').click({ force: true });
}

export function setDimensionValue(label: string, value: number | string) {
  cy.contains('mat-form-field', label).find('input').clear().type(`${value}{enter}`);
}

export function selectElement(text: string) {
  cy.get('aspect-editor-page-view').contains(text).click({ force: true });
}

export function uploadFile(fileName: string){
  // Use .last() because each stubFileInput call and click might append a new input to the body
  cy.get('input[type=file]', { timeout: 5000 }).last()
    .selectFile(`example_data/media/${fileName}`, {
      action: 'select',
      force: true
    });
}

export function selectPageEditor(page: string){
  cy.get('mat-tab-group').contains("Seite " + page).click({ force: true });
}

export function selectParagraphElement($p: JQuery<HTMLElement>): void {
  const el = $p[0];
  const doc = el.ownerDocument;
  const win = doc.defaultView!;
  const rect = el.getBoundingClientRect();

  const startX = rect.left + 1;
  const startY = rect.top + rect.height / 2;
  const endX = rect.right - 1;
  const endY = rect.top + rect.height / 2;

  const eventOpts = (x: number, y: number) => ({
    bubbles: true, cancelable: true, view: win,
    clientX: x, clientY: y, buttons: 1,
  });

  el.dispatchEvent(new PointerEvent('pointerdown', eventOpts(startX, startY)));
  el.dispatchEvent(new MouseEvent('mousedown', eventOpts(startX, startY)));

  const range = doc.createRange();
  range.selectNodeContents(el);
  const sel = win.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);

  el.dispatchEvent(new PointerEvent('pointermove', eventOpts(endX, endY)));
  el.dispatchEvent(new MouseEvent('mousemove', eventOpts(endX, endY)));
  el.dispatchEvent(new PointerEvent('pointerup', eventOpts(endX, endY)));
  el.dispatchEvent(new MouseEvent('mouseup', eventOpts(endX, endY)));
}

export function editElementConfigDialog(): void {
  cy.get('aspect-element-model-properties-component')
    .contains('button', 'Medienoptionen anpassen')
    .click();
  cy.get('mat-dialog-container').should('be.visible');
}

export function setDialogField(label: string, value: number): void {
  cy.get('mat-dialog-container')
    .contains('mat-form-field', label)
    .find('input')
    .clear()
    .type(`${value}{enter}`)
    .blur();
}

export function setDialogCheckbox(label: string, checked?: boolean): void {
  cy.get('mat-dialog-container')
    .contains('mat-checkbox', label)
    .then(($matCheckbox) => {
      const isChecked = $matCheckbox.hasClass('mat-mdc-checkbox-checked') ||
                        $matCheckbox.hasClass('mat-checkbox-checked') ||
                        $matCheckbox.find('input').is(':checked');
      if (checked === undefined || isChecked !== checked) {
        cy.wrap($matCheckbox).find('input').click({ force: true });
      }
    });
}

export function addTriggerElement(elementType: string, elementId: string): void {
  addElement(elementType);
  setID(elementId);
  cy.get('aspect-element-model-properties-component')
    .contains('mat-form-field', 'ID').find('input')
    .type('{enter}').blur();
  cy.wait(300);
}

export function createSectionWithText(sectionIndex: number, text: string): void {
  // Click canvas background to blur and clear element selection
  cy.get('.canvasBackground').first().click({ force: true });
  cy.wait(200);

  addNewSection();
  cy.get('aspect-editor-section-view').should('have.length', sectionIndex + 1);

  // Click Section to select it
  cy.get('aspect-editor-section-view').eq(sectionIndex).click({ force: true });
  addElement('Text');

  // Set the text content
  cy.get('aspect-element-model-properties-component')
    .contains('edit').click();
  cy.get('.ProseMirror p').clear();
  cy.get('.ProseMirror p').type(text);
  cy.contains('Speichern').click();
}

export function configureSectionVisibilityRule(options: {
  sectionIndex: number;
  controlId: string;
  operator: string;
  value: string;
  enableReHide?: boolean;
  visibilityDelay?: string;
}): void {
  // Click on the Section to select it and ensure the section menu is visible
  cy.get('aspect-editor-section-view').eq(options.sectionIndex).click({ force: true });

  // Ensure section menu is not hidden and click the visibility rules dialog button
  cy.get('aspect-section-menu').eq(options.sectionIndex).should('not.have.class', 'hidden');
  cy.get('aspect-section-menu').eq(options.sectionIndex).find('mat-icon').contains('disabled_visible').click({ force: true });
  cy.get('mat-dialog-container').should('be.visible');

  // Click the add button to add a rule
  cy.get('mat-dialog-container').find('button.add-button').click();

  // Select Control ID
  cy.get('aspect-visibility-rule-editor').find('mat-select').eq(0).click();
  cy.get('.cdk-overlay-container').contains('mat-option', options.controlId).click();

  // Select Operator
  cy.get('aspect-visibility-rule-editor').find('mat-select').eq(1).click();
  cy.get('.cdk-overlay-container').contains('mat-option', options.operator).click();

  // Enter Value
  cy.get('aspect-visibility-rule-editor').find('input').type(options.value);

  // Enable re-hide if requested
  if (options.enableReHide) {
    cy.get('mat-dialog-container')
      .contains('mat-checkbox', 'Erneutes Ausblenden erlauben')
      .find('input')
      .click({ force: true });
  }

  // Enter visibility delay if requested
  if (options.visibilityDelay) {
    cy.get('mat-dialog-container')
      .find('mat-form-field.visibility-delay')
      .find('input')
      .clear()
      .type(options.visibilityDelay);
  }

  // Click Save ("Speichern")
  cy.contains('button', 'Speichern').click();
  cy.get('mat-dialog-container').should('not.exist');
}

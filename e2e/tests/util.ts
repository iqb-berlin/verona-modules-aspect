export function addPage() {
  cy.contains('add').click();
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
  cy.contains(element).click();
  if (id !== undefined) {
    setID(id);
  }
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
  cy.get('.cdk-overlay-container').contains('span', new RegExp(`^ ${optionName} $`)).click({ force: true });
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

export function addProperties(description: string, settings?: Record<string, boolean>): void {
  cy.contains('mat-form-field', 'Beschriftung')
    .find('textarea')
    .clear()
    .type(description);
  if (settings?.readOnly) setCheckbox('Schreibschutz');
  if (settings?.required) setCheckbox('Pflichtfeld');
}

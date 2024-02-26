export function addPage() {
  cy.contains('add').click();
}

export function navigateToPage(pageIndex: number) {
  cy.contains(`Seite ${pageIndex}`).click();
}

export function selectFromDropdown(dropdownName: string, optionName: string) {
  cy.contains('div', dropdownName).find('mat-select').click();
  cy.get('.cdk-overlay-container').contains(optionName).click();
}

export function addButton() {
  // Check if expansion panel is already open; this is important for non-isolated tests
  cy.get('mat-expansion-panel').contains('Sonstige').then(expansionPanel => {
    if (!expansionPanel.hasClass('mat-expanded')) {
      cy.contains('Sonstige').click();
    }
  });
  cy.contains('Knopf').click();
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
  cy.get('@postMessage')
    .should('be.calledWithMatch',
      Cypress.sinon.match.has('unitState',
        Cypress.sinon.match.has(
          'dataParts', Cypress.sinon.match.has('elementCodes',
            Cypress.sinon.match(
              `{"id":"${id}","value":${value},"status":"VALUE_CHANGED"}`))
        )));

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
}

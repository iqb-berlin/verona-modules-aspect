/** Presses a key of the player's on-screen keyboard, found by what its button shows. */
function pressKey(label: string): void {
  cy.get('aspect-keyboard button')
    .filter((_, button) => button.textContent?.trim() === label)
    .click({ scrollBehavior: false });
}

/* The keyboard stays open from one field to the next and passed its keys to the field before until it had
   opened again for the next one, 100 ms later. A key typed right after moving on went into the field the
   focus had left (#1710). */
describe('On-screen keyboard, key right after moving to the next field (#1710)', () => {
  it('types into the field that has just taken the focus', () => {
    cy.visit('http://localhost:4202/', {
      onBeforeLoad: win => {
        Object.defineProperty(win.navigator, 'maxTouchPoints', { value: 2 });
      }
    });
    cy.loadUnit('text-fields-keyboard.json');
    cy.get('[data-element-id="text-field_first"] input').click();
    cy.get('aspect-keyboard').should('be.visible');
    pressKey('a');

    cy.get('[data-element-id="text-field_second"] input').click();
    pressKey('b');

    cy.get('[data-element-id="text-field_first"] input').should('have.value', 'a');
    cy.get('[data-element-id="text-field_second"] input').should('have.value', 'b');
  });
});

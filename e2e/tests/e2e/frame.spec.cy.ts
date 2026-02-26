import { addElement, addTextElement, setCheckbox } from '../util';

describe('Frame element', { testIsolation: false }, () => {
    context('editor', () => {
        before('opens an editor', () => {
            cy.openEditor();
        });

        it('creates a frame with all four borders and inserts a text element', () => {
            addTextElement('Rahmen mit vier Kanten');
            addElement('Rahmen', 'Sonstige');
            cy.getElement('aspect-text', 'Rahmen mit vier Kanten').click({ force: true });
            cy.contains('mat-icon', 'format_shapes').click();
            cy.contains('mat-form-field', 'Zeile').find('input').clear().type('2');
        });

        it('creates a frame with no borders and inserts a text element', () => {
            cy.contains('button', 'Neuer Abschnitt').click();
            addTextElement('Rahmen ohne Kanten');
            addElement('Rahmen', 'Sonstige');
            setCheckbox('Kante oben');
            setCheckbox('Kante unten');
            setCheckbox('Kante links');
            setCheckbox('Kante rechts');
            cy.getElement('aspect-text', 'Rahmen ohne Kanten').click({ force: true });
            cy.contains('mat-icon', 'format_shapes').click();
            cy.contains('mat-form-field', 'Zeile').find('input').clear().type('2');
        });

        it('creates a frame with only top and bottom borders and inserts a text element', () => {
            cy.contains('button', 'Neuer Abschnitt').click();
            addTextElement('Rahmen mit oben und unten Kanten');
            addElement('Rahmen', 'Sonstige');
            setCheckbox('Kante links');
            setCheckbox('Kante rechts');
            cy.getElement('aspect-text', 'Rahmen mit oben und unten Kanten').click({ force: true });
            cy.contains('mat-icon', 'format_shapes').click();
            cy.contains('mat-form-field', 'Zeile').find('input').clear().type('2');
        });

        after('saves unit definition', () => {
            cy.saveUnit('e2e/downloads/frame.json');
        });
    });

    context('player', () => {
        before('opens player and loads unit', () => {
            cy.openPlayer();
            cy.loadUnit('../downloads/frame.json');
        });

        it('renders all three frame elements', () => {
            cy.get('aspect-frame').should('have.length', 3);
        });

        it('renders a text element describing each frame', () => {
            cy.contains('aspect-text', 'Rahmen mit vier Kanten').should('exist');
            cy.contains('aspect-text', 'Rahmen ohne Kanten').should('exist');
            cy.contains('aspect-text', 'Rahmen mit oben und unten Kanten').should('exist');
        });

        it('default frame has all four borders', () => {
            cy.get('aspect-frame').eq(0)
                .find('div')
                .should('have.css', 'border-top-style', 'solid')
                .and('have.css', 'border-bottom-style', 'solid')
                .and('have.css', 'border-left-style', 'solid')
                .and('have.css', 'border-right-style', 'solid');
        });

        it('second frame has no borders at all', () => {
            cy.get('aspect-frame').eq(1)
                .find('div')
                .should('have.css', 'border-top-style', 'none')
                .and('have.css', 'border-bottom-style', 'none')
                .and('have.css', 'border-left-style', 'none')
                .and('have.css', 'border-right-style', 'none');
        });

        it('third frame has no left or right border', () => {
            cy.get('aspect-frame').eq(2)
                .find('div')
                .should('have.css', 'border-top-style', 'solid')
                .and('have.css', 'border-bottom-style', 'solid')
                .and('have.css', 'border-left-style', 'none')
                .and('have.css', 'border-right-style', 'none');
        });
    });
});

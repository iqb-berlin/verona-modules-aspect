/* "Elementinteraktion erlauben" lets an element be tried out in the editor. A drop list held its model's own value
   array there, and a drag rearranged it: trying a list out changed its preset in the unit (#1635). */

const item = (text: string, index: number) => ({
  text,
  id: `item_${text}`,
  alias: `item_${text}`,
  originListID: 'drop-list_1',
  originListIndex: index,
  imgSrc: null,
  imgFileName: '',
  imgPosition: 'above',
  audioSrc: null,
  audioFileName: ''
});

const unit = {
  type: 'aspect-unit-definition',
  version: '4.13.0',
  stateVariables: [],
  pages: [{
    sections: [{
      elements: [{
        type: 'drop-list',
        id: 'drop-list_1',
        alias: 'drop-list_1',
        isSortList: true,
        value: [item('A', 0), item('B', 1), item('C', 2)],
        position: {
          gridColumn: 1, gridColumnRange: 1, gridRow: 1, gridRowRange: 1
        }
      }],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: true,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      visibilityDelay: 0,
      animatedVisibility: false,
      enableReHide: false,
      logicalConnectiveOfRules: 'disjunction',
      visibilityRules: [],
      ignoreNumbering: false
    }],
    hasMaxWidth: true,
    maxWidth: 750,
    margin: 30,
    backgroundColor: '#ffffff',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50
  }],
  enableSectionNumbering: false,
  sectionNumberingPosition: 'left',
  showUnitNavNext: false
};

const shownItems = () => cy.get('aspect-drop-list .drop-list-item');

/* The drag the drop list reacts to: a press on the item, a move, entering the list and the item to land on, and the
   release -- the last three on whatever element the drop list listens to. */
const dragItemOnto = (sourceIndex: number, targetIndex: number): void => {
  shownItems().eq(sourceIndex).trigger('mousedown', { button: 0, force: true });
  cy.document().trigger('mousemove', { clientX: 10, clientY: 10 });
  shownItems().eq(targetIndex).parents('aspect-drop-list').find('.list-item-wrapper').first().parent()
    .trigger('mouseenter', { force: true });
  shownItems().eq(targetIndex).trigger('mouseenter', { force: true });
  cy.document().trigger('mouseup');
};

const toggleInteraction = (): void => {
  cy.contains('mat-checkbox', 'Elementinteraktion erlauben').find('input').click({ force: true });
};

describe('Trying out a drop list in the editor', () => {
  beforeEach(() => {
    cy.viewport(1300, 900);
    cy.openEditor();
    cy.sendEditorStartCommand(JSON.stringify(unit));
    cy.get('aspect-drop-list').click({ force: true });
    cy.get('aspect-element-properties').should('contain.text', 'drop-list_1');
  });

  it('leaves the preset of the list as it was', () => {
    toggleInteraction();
    dragItemOnto(2, 0);
    shownItems().then(items => expect([...items].map(i => i.innerText.trim())).to.deep.equal(['C', 'A', 'B']));

    toggleInteraction();
    shownItems().then(items => expect([...items].map(i => i.innerText.trim())).to.deep.equal(['A', 'B', 'C']));
  });
});

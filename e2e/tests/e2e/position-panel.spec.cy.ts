import {
  setDimensionValue,
  setSectionDynamicLayout,
  switchToPositionTab
} from '../util';
import {
  openPositionPanelEditor,
  savePositionPanelUnit,
  openPositionPanelPlayer,
  insertElementAndOpenPositionTab,
  prepareNewSection,
  deleteLastSection,
  setDimensionValueForced,
  setMarginValue,
  setMarginUnit,
  tickCheckbox,
  staticAbsoluteBox,
  staticDimensionBox,
  lastSectionStaticBox,
  dynamicButtonOverlay,
  buttonDimensionBox,
  clickAlignIcon,
  addPositionedText,
  selectStaticText,
  selectLastSectionText,
  multiSelectLastSectionTexts,
  clearElementSelection,
  playerGroup,
  playerBox,
  POSITION,
  px,
  marginTopStylePattern,
  marginSidesStylePattern
} from './helpers/position-panel-util';

describe('Position Panel', { testIsolation: false }, () => {
  context('editor', () => {
    before('opens an editor', () => {
      openPositionPanelEditor();
    });

    it('should position an element statically', () => {
      setSectionDynamicLayout(false);

      insertElementAndOpenPositionTab('Text', 'aspect-text', 'Medium', POSITION.static.alias);

      setDimensionValue('X Position', POSITION.static.x);
      setDimensionValue('Y Position', POSITION.static.y);
      setDimensionValue('Breite', POSITION.static.width);
      setDimensionValue('Höhe', POSITION.static.height);

      staticAbsoluteBox()
        .should('have.css', 'left', px(POSITION.static.x))
        .should('have.css', 'top', px(POSITION.static.y));

      staticDimensionBox()
        .should('have.css', 'width', px(POSITION.static.width))
        .should('have.css', 'height', px(POSITION.static.height));
    });

    it('should apply a z-index in static layout', () => {
      selectStaticText();
      switchToPositionTab();

      cy.contains('Stapelung').should('be.visible');
      setDimensionValue('Z-Index', POSITION.static.zIndex);

      staticAbsoluteBox().should('have.css', 'z-index', `${POSITION.static.zIndex}`);
    });

    it('should hide z-index and dimensions for a trigger', () => {
      prepareNewSection(false);
      insertElementAndOpenPositionTab('Auslöser', 'aspect-trigger', 'Sonstige');

      cy.contains('Z-Index').should('not.exist');
      cy.get('aspect-dimension-field-set').should('not.exist');
      cy.get('aspect-position-field-set').should('exist');

      deleteLastSection();
    });

    it('should align multiple selected elements', () => {
      prepareNewSection(false);
      addPositionedText(POSITION.alignA);
      addPositionedText(POSITION.alignB);
      multiSelectLastSectionTexts();

      cy.contains('Ausrichtung').should('be.visible');

      /* Horizontal buttons both set CSS left (there is no CSS right).
         Left → alignA.x, right → alignB.x. Vertical both set CSS top: top → alignA.y, bottom → alignB.y. */
      clickAlignIcon('align_horizontal_left');
      lastSectionStaticBox(0).should('have.css', 'left', px(POSITION.alignA.x));
      lastSectionStaticBox(1).should('have.css', 'left', px(POSITION.alignA.x));

      clickAlignIcon('align_vertical_top');
      lastSectionStaticBox(0).should('have.css', 'top', px(POSITION.alignA.y));
      lastSectionStaticBox(1).should('have.css', 'top', px(POSITION.alignA.y));

      /* Clicking an already selected element does not narrow the selection, so the canvas has to
         clear it before the positions can be set again for right/bottom. */
      clearElementSelection();
      selectLastSectionText(0);
      switchToPositionTab();
      setDimensionValue('X Position', POSITION.alignA.x);
      setDimensionValue('Y Position', POSITION.alignA.y);
      selectLastSectionText(1);
      setDimensionValue('X Position', POSITION.alignB.x);
      setDimensionValue('Y Position', POSITION.alignB.y);
      multiSelectLastSectionTexts();

      /* The click is the toolbar button, not BOX B. BOX B already sits at alignB.x, so it
         stays. BOX A moves from alignA.x to that same left edge. */
      clickAlignIcon('align_horizontal_right');
      lastSectionStaticBox(0).should('have.css', 'left', px(POSITION.alignB.x));
      lastSectionStaticBox(1).should('have.css', 'left', px(POSITION.alignB.x));

      clickAlignIcon('align_vertical_bottom');
      lastSectionStaticBox(0).should('have.css', 'top', px(POSITION.alignB.y));
      lastSectionStaticBox(1).should('have.css', 'top', px(POSITION.alignB.y));
    });

    it('should position an element dynamically (grid)', () => {
      prepareNewSection(true);

      insertElementAndOpenPositionTab('Knopf', 'aspect-button', 'Sonstige', POSITION.grid.alias);

      cy.contains('Raster').should('be.visible');
      setDimensionValue('Zeile', POSITION.grid.row);
      setDimensionValue('Zeilenspanne', POSITION.grid.rowSpan);
      setDimensionValue('Spalte', POSITION.grid.column);
      setDimensionValue('Spaltenspanne', POSITION.grid.columnSpan);

      dynamicButtonOverlay()
        .should('have.css', 'grid-row-start', `${POSITION.grid.row}`)
        .should('have.css', 'grid-row-end', `${POSITION.grid.row + POSITION.grid.rowSpan}`)
        .should('have.css', 'grid-column-start', `${POSITION.grid.column}`)
        .should('have.css', 'grid-column-end', `${POSITION.grid.column + POSITION.grid.columnSpan}`);
    });

    it('should apply margin values in dynamic layout', () => {
      prepareNewSection(true);

      insertElementAndOpenPositionTab('Knopf', 'aspect-button', 'Sonstige', POSITION.margin.alias);

      cy.contains('Abstand').should('be.visible');

      /* oben / links / rechts use %; unten stays on the default px unit. */
      setMarginValue('oben', POSITION.margin.top);
      setMarginUnit('oben', 'Prozent');
      setMarginValue('unten', POSITION.margin.bottom);
      setMarginValue('links', POSITION.margin.left);
      setMarginUnit('links', 'Prozent');
      setMarginValue('rechts', POSITION.margin.right);
      setMarginUnit('rechts', 'Prozent');

      dynamicButtonOverlay()
        .should('have.css', 'margin-bottom', px(POSITION.margin.bottom))
        .should('have.attr', 'style')
        .and('match', marginTopStylePattern())
        .and('match', marginSidesStylePattern());
    });

    it('should apply fixed width and height in dynamic layout', () => {
      prepareNewSection(true);

      insertElementAndOpenPositionTab('Knopf', 'aspect-button', 'Sonstige', POSITION.fixed.alias);

      cy.get('aspect-dimension-field-set').should('exist');
      cy.contains('mat-form-field', 'Breite').scrollIntoView();
      cy.contains('mat-form-field', 'Breite').find('input').should('be.disabled');

      tickCheckbox('Feste Breite');
      cy.contains('mat-form-field', 'Breite').scrollIntoView().find('input').should('not.be.disabled');
      setDimensionValueForced('Breite', POSITION.fixed.width);

      tickCheckbox('Feste Höhe');
      setDimensionValueForced('Höhe', POSITION.fixed.height);

      buttonDimensionBox()
        .should('have.css', 'width', px(POSITION.fixed.width))
        .should('have.css', 'height', px(POSITION.fixed.height));
    });

    it('should apply min/max dimensions limits', () => {
      prepareNewSection(true);

      insertElementAndOpenPositionTab('Knopf', 'aspect-button', 'Sonstige', POSITION.limits.alias);
      cy.get('aspect-dimension-field-set').scrollIntoView().should('be.visible');

      tickCheckbox('Mindestbreite setzen');
      setDimensionValueForced('Mindestbreite', POSITION.limits.minWidth);

      tickCheckbox('Maximalbreite setzen');
      setDimensionValueForced('Maximalbreite', POSITION.limits.maxWidth);

      tickCheckbox('Mindesthöhe setzen');
      setDimensionValueForced('Mindesthöhe', POSITION.limits.minHeight);

      tickCheckbox('Maximalhöhe setzen');
      setDimensionValueForced('Maximalhöhe', POSITION.limits.maxHeight);

      buttonDimensionBox()
        .should('have.css', 'min-width', px(POSITION.limits.minWidth))
        .should('have.css', 'max-width', px(POSITION.limits.maxWidth))
        .should('have.css', 'min-height', px(POSITION.limits.minHeight))
        .should('have.css', 'max-height', px(POSITION.limits.maxHeight));
    });

    after(() => {
      savePositionPanelUnit();
    });
  });

  context('player', () => {
    before('opens player and loads unit', () => {
      openPositionPanelPlayer();
    });

    it('should keep the static position and size', () => {
      playerGroup(POSITION.static.alias)
        .should('have.css', 'left', px(POSITION.static.x))
        .should('have.css', 'top', px(POSITION.static.y))
        .should('have.css', 'width', px(POSITION.static.width))
        .should('have.css', 'height', px(POSITION.static.height))
        .should('have.css', 'z-index', `${POSITION.static.zIndex}`);
    });

    it('should keep the aligned positions', () => {
      playerGroup(POSITION.alignA.alias)
        .should('have.css', 'left', px(POSITION.alignB.x))
        .should('have.css', 'top', px(POSITION.alignB.y));
      playerGroup(POSITION.alignB.alias)
        .should('have.css', 'left', px(POSITION.alignB.x))
        .should('have.css', 'top', px(POSITION.alignB.y));
    });

    it('should keep the grid placement', () => {
      playerGroup(POSITION.grid.alias)
        .should('have.css', 'grid-row-start', `${POSITION.grid.row}`)
        .should('have.css', 'grid-row-end', `${POSITION.grid.row + POSITION.grid.rowSpan}`)
        .should('have.css', 'grid-column-start', `${POSITION.grid.column}`)
        .should('have.css', 'grid-column-end', `${POSITION.grid.column + POSITION.grid.columnSpan}`);
    });

    it('should keep the margins', () => {
      playerGroup(POSITION.margin.alias)
        .should('have.css', 'margin-bottom', px(POSITION.margin.bottom))
        .should('have.attr', 'style')
        .and('match', marginTopStylePattern())
        .and('match', marginSidesStylePattern());
    });

    it('should keep the fixed width and height', () => {
      playerBox(POSITION.fixed.alias)
        .should('have.css', 'width', px(POSITION.fixed.width))
        .should('have.css', 'height', px(POSITION.fixed.height));
    });

    it('should keep the min/max dimension limits', () => {
      playerBox(POSITION.limits.alias)
        .should('have.css', 'min-width', px(POSITION.limits.minWidth))
        .should('have.css', 'max-width', px(POSITION.limits.maxWidth))
        .should('have.css', 'min-height', px(POSITION.limits.minHeight))
        .should('have.css', 'max-height', px(POSITION.limits.maxHeight));
    });
  });
});

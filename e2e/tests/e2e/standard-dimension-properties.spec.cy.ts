import { addElement, setExpertMode, setID } from '../util';
import { addGeometryElement, interceptDeployGGB } from './helpers/geometry-util';
import {
  addAnotherGeometry,
  dimensionInput,
  dimensionMarker,
  expectPlayerPx,
  openEditorInExpertMode,
  openStandardDimensionPlayer,
  saveStandardDimensionUnit,
  selectOnPage,
  setDimension,
  setStandardCheckbox,
  SIZE,
  standardCheckbox,
  standardDimensions
} from './helpers/standard-dimension-properties-util';

/**
 * The standard-mode size block. It is rendered only while expert mode is off; the position-panel
 * spec ticks the same German labels on the expert-mode size tab, which is a different template.
 */

describe('Standard dimension properties', () => {
  // A Text element sets Maximalbreite, rejects a negative value, then clears the limit.
  it('should set, reject and clear the maximum width of a text element', () => {
    openEditorInExpertMode();
    addElement('Text', 'Medium');
    setExpertMode(false);

    selectOnPage('aspect-text');
    standardDimensions().contains('0 oder leer = keine Begrenzung').should('be.visible');
    standardDimensions().contains('Feste Breite').should('not.exist');
    standardDimensions().contains('mat-label', 'Höhe').should('not.exist');
    dimensionInput('Maximalbreite').should('be.disabled');

    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', SIZE.text.maxWidth);
    dimensionInput('Maximalbreite').should('have.value', `${SIZE.text.maxWidth}`);

    setDimension('Maximalbreite', SIZE.text.invalid);
    cy.contains('Eingabe ungültig').should('be.visible');
    dimensionInput('Maximalbreite').should('have.value', `${SIZE.text.maxWidth}`);
    cy.contains('Eingabe ungültig').should('not.exist');

    setStandardCheckbox('Maximalbreite setzen', false);
    dimensionInput('Maximalbreite').should('be.disabled');
  });

  // A Geometrie element edits Breite and Höhe, and a negative Höhe is rejected.
  it('should edit the width and height of a geometry element', () => {
    interceptDeployGGB();
    openEditorInExpertMode();
    addGeometryElement('Geometrie-Text', 'kurven2.ggb', SIZE.geometry.alias);
    setExpertMode(false);

    selectOnPage('aspect-geometry');
    standardDimensions().contains('Feste Breite').should('not.exist');
    dimensionInput('Breite').should('have.value', `${SIZE.geometry.defaultWidth}`).and('not.be.disabled');
    dimensionInput('Höhe').should('have.value', `${SIZE.geometry.defaultHeight}`).and('not.be.disabled');

    setDimension('Breite', SIZE.geometry.width);
    setDimension('Höhe', SIZE.geometry.height);
    dimensionInput('Breite').should('have.value', `${SIZE.geometry.width}`);
    dimensionInput('Höhe').should('have.value', `${SIZE.geometry.height}`);

    setDimension('Höhe', SIZE.geometry.invalidHeight);
    cy.contains('Eingabe ungültig').should('be.visible');
    dimensionInput('Höhe').should('have.value', `${SIZE.geometry.height}`);
  });

  // An Ablegeliste enables Feste Breite and then sets Breite.
  it('should edit the fixed width of a drop list', () => {
    openEditorInExpertMode();
    addElement('Ablegeliste', '(Zu)Ordnung');
    setExpertMode(false);

    selectOnPage('aspect-drop-list');
    standardCheckbox('Feste Breite').should('not.be.checked');
    dimensionInput('Breite').should('be.disabled');

    setStandardCheckbox('Feste Breite', true);
    dimensionInput('Breite').should('have.value', `${SIZE.dropList.defaultWidth}`).and('not.be.disabled');
    setDimension('Breite', SIZE.dropList.width);
    dimensionInput('Breite').should('have.value', `${SIZE.dropList.width}`);
  });

  // Two Text elements with different Maximalbreite values show an indeterminate checkbox and a merged marker.
  it('should show a diverging maximum width as indeterminate', () => {
    openEditorInExpertMode();
    addElement('Text', 'Medium');
    addElement('Text', 'Medium');
    setExpertMode(false);

    selectOnPage('aspect-text', 0);
    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', SIZE.textA.maxWidth);

    selectOnPage('aspect-text', 1);
    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', SIZE.textB.maxWidth);

    selectOnPage('aspect-text', 0, true);
    standardCheckbox('Maximalbreite setzen').should('have.attr', 'aria-checked', 'mixed');
    dimensionInput('Maximalbreite').should('not.be.disabled');
    standardDimensions().find('aspect-merged-marker').should('exist');
  });

  // Two Geometrie elements with different Breite and Höhe show a merged marker on each field.
  it('should mark width and height when two geometry elements disagree', () => {
    interceptDeployGGB();
    openEditorInExpertMode();
    addGeometryElement('Geometrie eins', 'kurven2.ggb', SIZE.geometryA.alias);
    addAnotherGeometry('kurven2.ggb', SIZE.geometryB.alias);
    setExpertMode(false);

    selectOnPage('aspect-geometry', 0);
    setDimension('Breite', SIZE.geometryA.width);
    setDimension('Höhe', SIZE.geometryA.height);

    selectOnPage('aspect-geometry', 1);
    setDimension('Breite', SIZE.geometryB.width);
    setDimension('Höhe', SIZE.geometryB.height);

    selectOnPage('aspect-geometry', 0, true);
    dimensionMarker('Breite').should('be.visible');
    dimensionMarker('Höhe').should('be.visible');
  });

  // Two Ablegeliste elements with different fixed Breite values show a merged marker on Breite.
  it('should mark the fixed width when two drop lists disagree', () => {
    openEditorInExpertMode();
    addElement('Ablegeliste', '(Zu)Ordnung');
    addElement('Ablegeliste', '(Zu)Ordnung');
    setExpertMode(false);

    selectOnPage('aspect-drop-list', 0);
    setStandardCheckbox('Feste Breite', true);
    setDimension('Breite', SIZE.dropList.width);

    selectOnPage('aspect-drop-list', 1);
    setStandardCheckbox('Feste Breite', true);
    setDimension('Breite', SIZE.dropListB.width);

    selectOnPage('aspect-drop-list', 0, true);
    dimensionMarker('Breite').should('be.visible');
  });

  // A Text, a Geometrie element and an Ablegeliste are saved with the pixel sizes in the normal dynamic layout.
  it('should save the entered sizes', () => {
    interceptDeployGGB();
    openEditorInExpertMode();
    addElement('Text', 'Medium');
    setID(SIZE.text.alias);
    addElement('Ablegeliste', '(Zu)Ordnung');
    setID(SIZE.dropList.alias);
    addGeometryElement('Geometrie-Text', 'kurven2.ggb', SIZE.geometry.alias);
    setExpertMode(false);

    selectOnPage('aspect-text', 0);
    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', SIZE.text.maxWidth);

    selectOnPage('aspect-drop-list');
    setStandardCheckbox('Feste Breite', true);
    setDimension('Breite', SIZE.dropList.width);

    selectOnPage('aspect-geometry');
    setDimension('Breite', SIZE.geometry.width);
    setDimension('Höhe', SIZE.geometry.height);

    saveStandardDimensionUnit();
  });

  // The player shows the saved Maximalbreite and fixed Breite.
  it('should show the entered sizes in the player', () => {
    interceptDeployGGB();
    openStandardDimensionPlayer();

    expectPlayerPx(SIZE.text.alias, 'max-width', SIZE.text.maxWidth);
    expectPlayerPx(SIZE.dropList.alias, 'width', SIZE.dropList.width);
    cy.getElementByAlias(SIZE.geometry.alias).should('be.visible');
  });
});

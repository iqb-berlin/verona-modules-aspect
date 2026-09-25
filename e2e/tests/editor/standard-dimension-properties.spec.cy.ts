import { addElement, setExpertMode } from '../util';
import { addGeometryElement, interceptDeployGGB } from '../e2e/helpers/geometry-util';
import {
  addAnotherGeometry,
  dimensionInput,
  dimensionMarker,
  openEditorInExpertMode,
  selectOnPage,
  setDimension,
  setStandardCheckbox,
  standardCheckbox,
  standardDimensions
} from './standard-dimension-properties-util';

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
    setDimension('Maximalbreite', 320);
    dimensionInput('Maximalbreite').should('have.value', '320');

    setDimension('Maximalbreite', -1);
    cy.contains('Eingabe ungültig').should('be.visible');
    dimensionInput('Maximalbreite').should('have.value', '320');
    cy.contains('Eingabe ungültig').should('not.exist');

    setStandardCheckbox('Maximalbreite setzen', false);
    dimensionInput('Maximalbreite').should('be.disabled');
  });

  // A Geometrie element edits Breite and Höhe, and a negative Höhe is rejected.
  it('should edit the width and height of a geometry element', () => {
    interceptDeployGGB();
    openEditorInExpertMode();
    addGeometryElement('Geometrie-Text', 'kurven2.ggb', 'geo_size');
    setExpertMode(false);

    selectOnPage('aspect-geometry');
    standardDimensions().contains('Feste Breite').should('not.exist');
    dimensionInput('Breite').should('have.value', '600').and('not.be.disabled');
    dimensionInput('Höhe').should('have.value', '400').and('not.be.disabled');

    setDimension('Breite', 500);
    setDimension('Höhe', 350);
    dimensionInput('Breite').should('have.value', '500');
    dimensionInput('Höhe').should('have.value', '350');

    setDimension('Höhe', -5);
    cy.contains('Eingabe ungültig').should('be.visible');
    dimensionInput('Höhe').should('have.value', '350');
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
    dimensionInput('Breite').should('have.value', '240').and('not.be.disabled');
    setDimension('Breite', 180);
    dimensionInput('Breite').should('have.value', '180');
  });

  // Two Text elements with different Maximalbreite values show an indeterminate checkbox and a merged marker.
  it('should show a diverging maximum width as indeterminate', () => {
    openEditorInExpertMode();
    addElement('Text', 'Medium');
    addElement('Text', 'Medium');
    setExpertMode(false);

    selectOnPage('aspect-text', 0);
    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', 100);

    selectOnPage('aspect-text', 1);
    setStandardCheckbox('Maximalbreite setzen', true);
    setDimension('Maximalbreite', 200);

    selectOnPage('aspect-text', 0, true);
    standardCheckbox('Maximalbreite setzen').should('have.attr', 'aria-checked', 'mixed');
    dimensionInput('Maximalbreite').should('not.be.disabled');
    standardDimensions().find('aspect-merged-marker').should('exist');
  });

  // Two Geometrie elements with different Breite and Höhe show a merged marker on each field.
  it('should mark width and height when two geometry elements disagree', () => {
    interceptDeployGGB();
    openEditorInExpertMode();
    addGeometryElement('Geometrie eins', 'kurven2.ggb', 'geo_a');
    addAnotherGeometry('kurven2.ggb', 'geo_b');
    setExpertMode(false);

    selectOnPage('aspect-geometry', 0);
    setDimension('Breite', 500);
    setDimension('Höhe', 350);

    selectOnPage('aspect-geometry', 1);
    setDimension('Breite', 400);
    setDimension('Höhe', 250);

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
    setDimension('Breite', 180);

    selectOnPage('aspect-drop-list', 1);
    setStandardCheckbox('Feste Breite', true);
    setDimension('Breite', 240);

    selectOnPage('aspect-drop-list', 0, true);
    dimensionMarker('Breite').should('be.visible');
  });
});

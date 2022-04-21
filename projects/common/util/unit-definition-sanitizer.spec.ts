import { UnitDefinitionSanitizer } from 'common/util/unit-definition-sanitizer';
import { Unit } from 'common/interfaces/unit';
import packageJSON from '../../../package.json';
import * as sampleUnit100 from 'test-data/test100.json';
import * as sampleUnit126 from 'test-data/test126.json';
import * as sampleUnit129 from 'test-data/test129.json';
import * as sampleUnit130 from 'test-data/test130.json';

describe('UnitDefinitionSanitizer', () => {
  const basicUnitDefinition: Unit = {
    'type': 'aspect-unit-definition',
    'version': packageJSON.config.unit_definition_version,
    'pages': []
  };

  const sanitizedUnit100 = UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit100)));
  const sanitizedUnit126 = UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126)));
  const sanitizedUnit129 = UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit129)));

  it('isUnitDefinitionOutdated should return false on current version', () => {

    expect(UnitDefinitionSanitizer.isUnitDefinitionOutdated(basicUnitDefinition)).toBe(false);
  });

  it('isUnitDefinitionOutdated should return true on older version', () => {
    const unitDefinition: Unit = {
      'type': 'aspect-unit-definition',
      'version': '3.3.0',
      'pages': []
    };
    expect(UnitDefinitionSanitizer.isUnitDefinitionOutdated(unitDefinition)).toBe(true);
  });

  it('sanitizeUnitDefinition should return basic unit definition', () => {
    expect(UnitDefinitionSanitizer.sanitizeUnitDefinition(basicUnitDefinition)).toEqual(basicUnitDefinition);
  });

  it('sanitizeUnitDefinition should return position', () => {
    const testData130 = JSON.parse(JSON.stringify(sampleUnit130));
    const expectedPositionProps = {
      'position': {
        'fixedSize': false,
        'dynamicPositioning': true,
        'xPosition': 0,
        'yPosition': 0,
        'useMinHeight': false,
        'gridColumn': 1,
        'gridColumnRange': 1,
        'gridRow': 1,
        'gridRowRange': 1,
        'marginLeft': 0,
        'marginRight': 0,
        'marginTop': 0,
        'marginBottom': 0,
        'zIndex': 0
      }
    };
    expect(UnitDefinitionSanitizer.sanitizeUnitDefinition(testData130).pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining(expectedPositionProps));
  });

  it('sanitizeUnitDefinition should repair positionProps', () => {
    const expectedPositionProps = {
      'xPosition': 0,
      'yPosition': 0,
      'gridColumn': 1,
      'gridColumnRange': 1,
      'gridRow': 1,
      'gridRowRange': 1
    };
    expect(Object.keys(sanitizedUnit126.pages[0].sections[0].elements[0]))
      .toContain('position');
    expect(sanitizedUnit126.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining(expectedPositionProps));
  });

  // very old stuff
  it('sanitizeUnitDefinition should repair position properties outside sub-elements', () => {
    const expectedPositionProps = {
      'xPosition': 420,
      'yPosition': 69,
      'gridColumn': 2,
      'gridColumnRange': 2,
      'gridRow': 3,
      'gridRowRange': 1
    };
    expect(Object.keys(sanitizedUnit100.pages[0].sections[0].elements[0]))
      .toContain('position');
    expect(sanitizedUnit100.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining(expectedPositionProps));
  });

  it('sanitizeUnitDefinition should fix dynamicPositioning according to parent section', () => {
    // manipulate section prop first, so element needs to be corrected
    const unit = sampleUnit126;
    unit.pages[0].sections[0].dynamicPositioning = true;
    const sanitizedUnit = UnitDefinitionSanitizer.sanitizeUnitDefinition(JSON.parse(JSON.stringify(unit)));
    expect(sanitizedUnit.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining({
        'dynamicPositioning': true
      }));

    // no change necessary
    expect(sanitizedUnit129.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining({
        'dynamicPositioning': false
      }));
  });
});

import { TestBed } from '@angular/core/testing';
import { SanitizationService } from './sanitization.service';
import { Unit } from 'common/interfaces/unit';
import packageJSON from '../../../package.json';
import * as sampleUnit100 from 'test-data/test100.json';
import * as sampleUnit126 from 'test-data/test126.json';
import * as sampleUnit129 from 'test-data/test129.json';
import * as sampleUnit130 from 'test-data/test130.json';
import * as sampleUnit126Audio from 'test-data/test126-audio.json';
import * as sampleUnit130Audio from 'test-data/test130-audio.json';
import * as sampleUnit112Texts from 'test-data/test112-texts.json';
import * as sampleUnit112TextFields from 'test-data/test112-Textfields.json';
import * as sampleUnit130TextFields from 'test-data/test130-textfields.json';
import * as sampleUnit112Droplists from 'test-data/test112-droplist.json';

describe('SanitizationService', () => {
  let service: SanitizationService;

  const basicUnitDefinition: Unit = {
    'type': 'aspect-unit-definition',
    'version': packageJSON.config.unit_definition_version,
    'pages': []
  };
  const sanitizedUnit100 = SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit100)));
  const sanitizedUnit126 = SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126)));
  const sanitizedUnit129 = SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit129)));
  const sanitizedUnit130 = SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130)));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanitizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isUnitDefinitionOutdated should return false on current version', () => {
    expect(SanitizationService.isUnitDefinitionOutdated(basicUnitDefinition)).toBe(false);
  });

  it('isUnitDefinitionOutdated should return true on older version', () => {
    const unitDefinition: Unit = {
      'type': 'aspect-unit-definition',
      'version': '3.3.0',
      'pages': []
    };
    expect(SanitizationService.isUnitDefinitionOutdated(unitDefinition)).toBe(true);
  });

  it('sanitizeUnitDefinition should return basic unit definition', () => {
    expect(SanitizationService.sanitizeUnitDefinition(basicUnitDefinition)).toEqual(basicUnitDefinition);
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
    expect(SanitizationService.sanitizeUnitDefinition(testData130).pages[0].sections[0].elements[0])
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
    const sanitizedUnit = SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(unit)));
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

  it('sanitizeUnitDefinition should return styling', () => {
    const expectedStylingProps = {
      'fontColor': '#000000',
      'font': 'Roboto',
      'fontSize': 20,
      'bold': false,
      'italic': false,
      'underline': false,
      'backgroundColor': 'transparent',
      'lineHeight': 135
    };
    expect(Object.keys(sanitizedUnit130.pages[0].sections[0].elements[0]))
      .toContain('styling');
    expect(sanitizedUnit130.pages[0].sections[0].elements[0].styling)
      .toEqual(jasmine.objectContaining(expectedStylingProps));
  });

  it('sanitizeUnitDefinition should repair fontProps and surfaceProps', () => {
    const expectedStylingProps = {
      'fontColor': '#000000',
      'font': 'Roboto',
      'fontSize': 20,
      'lineHeight': 135,
      'bold': false,
      'italic': false,
      'underline': false,
      'backgroundColor': 'red'
    };
    expect(Object.keys(sanitizedUnit126.pages[0].sections[0].elements[0]))
      .toContain('styling');
    expect(sanitizedUnit126.pages[0].sections[0].elements[0].styling)
      .toEqual(jasmine.objectContaining(expectedStylingProps));
  });

  it('sanitizeUnitDefinition should return player properties', () => {
    const sanitizedUnit130Audio =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130Audio)));
    const expectedPlayerProps = {
      'autostart': false,
      'autostartDelay': 0,
      'loop': false,
      'startControl': true,
      'pauseControl': false,
      'progressBar': true,
      'interactiveProgressbar': false,
      'volumeControl': true
    };
    expect(Object.keys(sanitizedUnit130Audio.pages[0].sections[0].elements[0]))
      .toContain('player');
    expect(sanitizedUnit130Audio.pages[0].sections[0].elements[0].player)
      .toEqual(jasmine.objectContaining(expectedPlayerProps));
  });

  it('sanitizeUnitDefinition should repair playerProps', () => {
    const sanitizedUnit126Audio =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126Audio)));
    const expectedPlayerProps = {
      'autostart': false,
      'autostartDelay': 0,
      'loop': false,
      'startControl': true,
      'pauseControl': false,
      'progressBar': true,
      'interactiveProgressbar': false,
      'volumeControl': true,
      'defaultVolume': 0.8,
      'minVolume': 0,
      'muteControl': true
    };
    expect(Object.keys(sanitizedUnit126Audio.pages[0].sections[0].elements[0]))
      .toContain('player');
    expect(sanitizedUnit126Audio.pages[0].sections[0].elements[0].player)
      .toEqual(jasmine.objectContaining(expectedPlayerProps));
  });

  it('sanitizeUnitDefinition should repair text element - interaction: "none"', () => {
    const sanitizedUnit112Texts =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
    const expectedTextProps = {
      highlightableYellow: false,
      highlightableTurquoise: false,
      highlightableOrange: false
    };
    expect(sanitizedUnit112Texts.pages[0].sections[0].elements[1])
      .not.toEqual(jasmine.objectContaining(expectedTextProps));
  });

  it('sanitizeUnitDefinition should repair text element - interaction: "highlightable"', () => {
    const sanitizedUnit112Texts =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
    const expectedTextProps = {
      highlightableYellow: true,
      highlightableTurquoise: true,
      highlightableOrange: true
    };
    expect(sanitizedUnit112Texts.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining(expectedTextProps));
  });

  it('sanitizeUnitDefinition should repair text element - interaction: "strikable"', () => {
    const sanitizedUnit112Texts =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
    const expectedTextProps = {
      highlightableYellow: true,
      highlightableTurquoise: false,
      highlightableOrange: false
    };
    expect(sanitizedUnit112Texts.pages[0].sections[0].elements[2])
      .not.toEqual(jasmine.objectContaining(expectedTextProps));
  });

  it('sanitizeUnitDefinition should return text field element', () => {
    const sanitizedUnit130TextFields =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130TextFields)));
    expect(sanitizedUnit130TextFields.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'none',
        'inputAssistancePosition': 'floating',
        'restrictedToInputAssistanceChars': false
      }));
    expect(sanitizedUnit130TextFields.pages[0].sections[0].elements[1])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'french',
        'inputAssistancePosition': 'floating',
        'restrictedToInputAssistanceChars': true
      }));
    expect(sanitizedUnit130TextFields.pages[0].sections[0].elements[2])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'numbers',
        'inputAssistancePosition': 'floating',
        'restrictedToInputAssistanceChars': false
      }));
  });

  // only french inputAssistance is corrected to false, since the default is true
  it('sanitizeUnitDefinition should repair text field and area elements', () => {
    const sanitizedUnit112TextFields =
      SanitizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112TextFields)));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'none',
        'inputAssistancePosition': 'floating'
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[0])
      .not.toEqual(jasmine.objectContaining({
        'restrictedToInputAssistanceChars': false
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[1])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'french',
        'inputAssistancePosition': 'right',
        'restrictedToInputAssistanceChars': false
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[2])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'numbers',
        'inputAssistancePosition': 'floating'
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[2])
      .not.toEqual(jasmine.objectContaining({
        'restrictedToInputAssistanceChars': false
      }));
    // text areas
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[3])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'none',
        'inputAssistancePosition': 'floating'
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[3])
      .not.toEqual(jasmine.objectContaining({
        'restrictedToInputAssistanceChars': false
      }));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[4])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': 'french',
        'inputAssistancePosition': 'floating',
        'restrictedToInputAssistanceChars': false
      }));
  });

  // it('sanitizeUnitDefinition should repair drop lists', () => {
  //   const sanitizedUnit112Droplists =
  //     SantizationService.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Droplists)));
  //
  //   expect(sanitizedUnit112Droplists.pages[0].sections[0].elements[0])
  //     .toEqual(jasmine.objectContaining({
  //       'value': []
  //     }));
  // });
});

import { TestBed } from '@angular/core/testing';
import { SanitizationService } from './sanitization.service';
import { Unit } from 'common/interfaces/unit';
import packageJSON from '../../../package.json';
import * as sampleUnit100 from 'test-data/unit-definitions/test100.json';
import * as sampleUnit126 from 'test-data/unit-definitions/test126.json';
import * as sampleUnit129 from 'test-data/unit-definitions/test129.json';
import * as sampleUnit130 from 'test-data/unit-definitions/test130.json';
import * as sampleUnit126Audio from 'test-data/unit-definitions/test126-audio.json';
import * as sampleUnit130Audio from 'test-data/unit-definitions/test130-audio.json';
import * as sampleUnit112Texts from 'test-data/unit-definitions/test112-texts.json';
import * as sampleUnit112TextFields from 'test-data/unit-definitions/test112-Textfields.json';
import * as sampleUnit130TextFields from 'test-data/unit-definitions/test130-textfields.json';
import { ClozeElement } from 'common/interfaces/elements';

const unitDefStub: Record<string, any> = {
  'unitDefinitionType': 'iqb-aspect-definition@1.1.0',
  'pages': [{
    'sections': [
      {
        'elements': []
      }]
  }]
};

describe('SanitizationService', () => {
  let service: SanitizationService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanitizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isUnitDefinitionOutdated should return false on current version', () => {
    const basicUnitDefinition: Unit = {
      'type': 'aspect-unit-definition',
      'version': packageJSON.config.unit_definition_version,
      'pages': []
    };
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
    const basicUnitDefinition: Unit = {
      'type': 'aspect-unit-definition',
      'version': packageJSON.config.unit_definition_version,
      'pages': []
    };
    expect(service.sanitizeUnitDefinition(basicUnitDefinition)).toEqual(basicUnitDefinition);
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
    expect(service.sanitizeUnitDefinition(testData130).pages[0].sections[0].elements[0])
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
    const sanitizedUnit126 = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126)));
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
    const sanitizedUnit100 = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit100)));
    expect(Object.keys(sanitizedUnit100.pages[0].sections[0].elements[0]))
      .toContain('position');
    expect(sanitizedUnit100.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining(expectedPositionProps));
  });

  it('sanitizeUnitDefinition should fix dynamicPositioning according to parent section', () => {
    // manipulate section prop first, so element needs to be corrected
    const unit = sampleUnit126;
    unit.pages[0].sections[0].dynamicPositioning = true;
    const sanitizedUnit = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(unit)));
    expect(sanitizedUnit.pages[0].sections[0].elements[0].position)
      .toEqual(jasmine.objectContaining({
        'dynamicPositioning': true
      }));

    // no change necessary
    const sanitizedUnit129 = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit129)));
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
    const sanitizedUnit130 = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130)));
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
    const sanitizedUnit126 = service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126)));
    expect(Object.keys(sanitizedUnit126.pages[0].sections[0].elements[0]))
      .toContain('styling');
    expect(sanitizedUnit126.pages[0].sections[0].elements[0].styling)
      .toEqual(jasmine.objectContaining(expectedStylingProps));
  });

  it('sanitizeUnitDefinition should return player properties', () => {
    const sanitizedUnit130Audio =
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130Audio)));
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit126Audio)));
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112Texts)));
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit130TextFields)));
    expect(sanitizedUnit130TextFields.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': null,
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
      service.sanitizeUnitDefinition(JSON.parse(JSON.stringify(sampleUnit112TextFields)));
    expect(sanitizedUnit112TextFields.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining({
        'inputAssistancePreset': null,
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
        'inputAssistancePreset': null,
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

  it('should rename cloze children with "simple" affix', () => {
    const unitDef = {
      ...unitDefStub,
      'pages': [{
        'sections': [
          {
            'elements': [{
              'id': 'cloze_1',
              'type': 'cloze',
              'document': {
                'type': 'doc',
                'content': [
                  {
                    'type': 'paragraph',
                    'content': [
                      {
                        'type': 'TextField',
                        'attrs': {
                          'model': {
                            'id': 'text-field_1',
                            'type': 'text-field' } } },
                      {
                        'type': 'DropList',
                        'attrs': {
                          'model': {
                            'id': 'drop-list_1',
                            'type': 'drop-list' } } },
                      {
                        'type': 'ToggleButton',
                        'attrs': {
                          'model': {
                            'id': 'toggle_button_1',
                            'type': 'toggle-button' } } }] }] } }
            ] }] }]
    };
    const sanitizedUnitDefinition = service.sanitizeUnitDefinition(unitDef as unknown as Unit);

    expect(sanitizedUnitDefinition.pages[0].sections[0].elements[0])
      .toEqual(jasmine.objectContaining({
        'id': 'cloze_1',
        'type': 'cloze'
      }));

    const sanatizedClozeChild1 = (sanitizedUnitDefinition.pages[0].sections[0].elements[0] as ClozeElement)
      .document.content[0].content[0]?.attrs?.model;
    expect(sanatizedClozeChild1)
      .toEqual(jasmine.objectContaining({
        'id': 'text-field_1',
        'type': 'text-field-simple'
      }));

    const sanatizedClozeChild2 = (sanitizedUnitDefinition.pages[0].sections[0].elements[0] as ClozeElement)
      .document.content[0].content[1]?.attrs?.model;
    expect(sanatizedClozeChild2)
      .toEqual(jasmine.objectContaining({
        'id': 'drop-list_1',
        'type': 'drop-list-simple'
      }));

    const sanatizedClozeChild3 = (sanitizedUnitDefinition.pages[0].sections[0].elements[0] as ClozeElement)
      .document.content[0].content[2]?.attrs?.model;
    expect(sanatizedClozeChild3)
      .toEqual(jasmine.objectContaining({
        'id': 'toggle_button_1',
        'type': 'toggle-button'
      }));
  });
});

import { TestBed } from '@angular/core/testing';
import { ElementModelElementCodeMappingService } from './element-model-element-code-mapping.service';
import {
  AudioElement,
  DragNDropValueObject,
  DropListElement, ImageElement,
  TextElement, TextFieldElement
} from 'common/interfaces/elements';
import * as dropList_130 from 'test-data/element-models/dropList_130.json';
import * as textField_130 from 'test-data/element-models/textField_130.json';
import * as image_130 from 'test-data/element-models/image_130.json';
import * as audio_130 from 'test-data/element-models/audio_130.json';
import * as text_130 from 'test-data/element-models/text_130.json';
import * as dropListValues_01_130 from 'test-data/values/dropListValues_01_130.json';
import * as dropListValues_02_130 from 'test-data/values/dropListValues_02_130.json';


describe('ElementModelElementCodeMappingService', () => {
  let service: ElementModelElementCodeMappingService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementModelElementCodeMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // mapToElementCodeValue

  it('should map the value of a drop-list elementModel to its elementCode value', () => {
    const dragNDropValueObjects: DragNDropValueObject[] = JSON.parse(JSON.stringify(dropListValues_01_130)).default;
    expect(service.mapToElementCodeValue(dragNDropValueObjects, 'drop-list'))
      .toEqual( ['value_1', 'value_2', 'value_3']);
  });

  it('should map the value of a text elementModel to its elementCode value', () => {
    const textValue =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    expect(service.mapToElementCodeValue(textValue, 'text'))
      .toEqual( ['6-11-#f9f871']);
  });

  it('should map the value of a text elementModel to its elementCode value - empty Array', () => {
    const textValue =
      'Lorem dolor sit amet';
    expect(service.mapToElementCodeValue(textValue, 'text'))
      .toEqual( []);
  });

  it('should map the value of a audio elementModel to its elementCode value', () => {
    expect(service.mapToElementCodeValue(2, 'audio'))
      .toEqual(2);
  });

  it('should map the value of a iamge elementModel to its elementCode value', () => {
    expect(service.mapToElementCodeValue(true, 'audio'))
      .toEqual(true);
  });

  it('should map the value of a iamge elementModel to its elementCode value', () => {
    expect(service.mapToElementCodeValue(false, 'audio'))
      .toEqual(false);
  });

  it('should map the value of a radio elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.mapToElementCodeValue(i, 'radio'))
        .toEqual(i + 1);
    }
  });

  it('should map the value of a radio-group-images elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.mapToElementCodeValue(i, 'radio-group-images'))
        .toEqual(i + 1);
    }
  });

  it('should map the value of a dropdown elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.mapToElementCodeValue(i, 'dropdown'))
        .toEqual(i + 1);
    }
  });

  it('should map the value of a toggle-button elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.mapToElementCodeValue(i, 'toggle-button'))
        .toEqual(i + 1);
    }
  });

  it('should map the value of a likert-row elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(service.mapToElementCodeValue(i, 'likert-row'))
        .toEqual(i + 1);
    }
  });

  it('should map the value of a text-field elementModel to its elementCode value', () => {
    const textFieldValue =
      'TEST';
    expect(service.mapToElementCodeValue(textFieldValue, 'text-field'))
      .toEqual( 'TEST');
  });

  it('should map the value of a text-field elementModel to its elementCode value', () => {
    const textFieldValue =
      null;
    expect(service.mapToElementCodeValue(textFieldValue, 'text-field'))
      .toEqual( null);
  });


  // mapToElementValue

  it('should map a elementCode value to drop-list elementModel value', () => {
    service.dragNDropValueObjects =  [
      {
        'stringValue': 'a',
        'id': 'value_1'
      },
      {
        'stringValue': 'b',
        'id': 'value_2'
      },
      {
        'stringValue': 'c',
        'id': 'value_3'
      },
      {
        'stringValue': 'd',
        'id': 'value_4'
      },
      {
        'stringValue': 'e',
        'id': 'value_5'
      }
    ];
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    const expectedValue = [
      {
        'stringValue': 'e',
        'id': 'value_5'
      }
    ];
    expect(service.mapToElementModelValue(['value_5'], elementModel))
      .toEqual(expectedValue);
  });

  it('should not map but return the drop-list elementModel value', () => {
    service.dragNDropValueObjects =  [
      {
        'stringValue': 'a',
        'id': 'value_1'
      },
      {
        'stringValue': 'b',
        'id': 'value_2'
      },
      {
        'stringValue': 'c',
        'id': 'value_3'
      },
      {
        'stringValue': 'd',
        'id': 'value_4'
      },
      {
        'stringValue': 'e',
        'id': 'value_5'
      }
    ];
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(elementModel.value);
  });

  it('should map a elementCode value to drop-list elementModel value with imageSrc', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dropListValues_01_130)).default;
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    const expectedValue = JSON.parse(JSON.stringify(dropListValues_02_130)).default;
    expect(service.mapToElementModelValue(['value_1', 'value_2'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map a elementCode value to drop-list elementModel value - an empty array', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dropListValues_01_130)).default;
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    expect(service.mapToElementModelValue([], elementModel ))
      .toEqual([]);
  });

  it('should map a elementCode value to text elementModel value (text)', () => {
    const elementModel: TextElement = JSON.parse(JSON.stringify(text_130));
    const expectedValue =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    expect(service.mapToElementModelValue(['6-11-#f9f871'], elementModel))
      .toEqual(expectedValue);
  });

  it('should not map but return the text elementModel value (text)', () => {
    const elementModel: TextElement = JSON.parse(JSON.stringify(text_130));
    expect(service.mapToElementModelValue([], elementModel))
      .toEqual(elementModel.text);
  });

  it('should not map but return the text elementModel value (text)', () => {
    const elementModel: TextElement = JSON.parse(JSON.stringify(text_130));
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(elementModel.text);
  });

  it('should map a elementCode value to audio elementModel value', () => {
    const elementModel: AudioElement = JSON.parse(JSON.stringify(audio_130));
    expect(service.mapToElementModelValue( 2, elementModel))
      .toEqual(2);
  });

  it('should not map but return the audio elementModel value (player.playbackTime)', () => {
    const elementModel: AudioElement = JSON.parse(JSON.stringify(audio_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(0);
  });

  it('should map a elementCode value to image elementModel value', () => {
    const elementModel: ImageElement = JSON.parse(JSON.stringify(image_130));
    expect(service.mapToElementModelValue( true, elementModel))
      .toEqual(true);
  });

  it('should not map but return the image elementModel value (magnifierUsed)', () => {
    const elementModel: ImageElement = JSON.parse(JSON.stringify(image_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(false);
  });

  it('should map a elementCode value to text-field elementModel value', () => {
    const elementModel: TextFieldElement = JSON.parse(JSON.stringify(textField_130));
    expect(service.mapToElementModelValue( 'TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-field elementModel value', () => {
    const elementModel: TextFieldElement = JSON.parse(JSON.stringify(textField_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

});

import { TestBed } from '@angular/core/testing';
import { ElementModelElementCodeMappingService } from './element-model-element-code-mapping.service';
import {
  AudioElement,
  DragNDropValueObject,
  DropListElement, DropListSimpleElement,
  ImageElement,
  LikertRowElement,
  RadioButtonGroupComplexElement,
  RadioButtonGroupElement, SpellCorrectElement,
  TextAreaElement,
  TextElement,
  TextFieldElement,
  ToggleButtonElement
} from 'common/interfaces/elements';
import * as dropList_130 from 'test-data/element-models/dropList_130.json';
import * as dropListSimple_131 from 'test-data/element-models/dropListSimple_131.json';
import * as textField_130 from 'test-data/element-models/text-field_130.json';
import * as image_130 from 'test-data/element-models/image_130.json';
import * as audio_130 from 'test-data/element-models/audio_130.json';
import * as text_130 from 'test-data/element-models/text_130.json';
import * as likertRow_130 from 'test-data/element-models/likert-row_130.json';
import * as radio_130 from 'test-data/element-models/radio_130.json';
import * as radioGroupImages_130 from 'test-data/element-models/radio-group-images_130.json';
import * as toggleButton_130 from 'test-data/element-models/toggle-button_130.json';
import * as textArea_130 from 'test-data/element-models/text-area_130.json';
import * as spellCorrect_130 from 'test-data/element-models/spell-correct_130.json';
import * as dragNDropValues_01_130 from 'test-data/values/dragNDropValues_01_130.json';
import * as dragNDropValues_02_130 from 'test-data/values/dragNDropValues_02_130.json';

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
    const dragNDropValueObjects: DragNDropValueObject[] = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    expect(service.mapToElementCodeValue(dragNDropValueObjects, 'drop-list'))
      .toEqual( ['value_1', 'value_2', 'value_3']);
  });

  it('should map the value of a drop-list-simple elementModel to its elementCode value', () => {
    const dragNDropValueObjects: DragNDropValueObject[] = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    expect(service.mapToElementCodeValue(dragNDropValueObjects, 'drop-list-simple'))
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

  it('should map the value of a spell-correct elementModel to its elementCode value', () => {
    const spellCorrectValue =
      'TEST';
    expect(service.mapToElementCodeValue(spellCorrectValue, 'spell-correct'))
      .toEqual( 'TEST');
  });

  it('should map the value of a spell-correct elementModel to its elementCode value', () => {
    const spellCorrectValue =
      null;
    expect(service.mapToElementCodeValue(spellCorrectValue, 'spell-correct'))
      .toEqual( null);
  });

  it('should map the value of a text-area elementModel to its elementCode value', () => {
    const textAreaValue =
      'TEST';
    expect(service.mapToElementCodeValue(textAreaValue, 'text-area'))
      .toEqual( 'TEST');
  });

  it('should map the value of a text-area elementModel to its elementCode value', () => {
    const textAreaValue =
      null;
    expect(service.mapToElementCodeValue(textAreaValue, 'text-area'))
      .toEqual( null);
  });


  // mapToElementValue

  it('should map an elementCode value to drop-list elementModel value', () => {
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

  it('should map an elementCode value to drop-list elementModel value', () => {
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

  it('should not map but return the drop-list-simple elementModel value', () => {
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
    const elementModel: DropListSimpleElement = JSON.parse(JSON.stringify(dropListSimple_131));
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(elementModel.value);
  });

  it('should map an elementCode value to drop-list elementModel value with imageSrc', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    const expectedValue = JSON.parse(JSON.stringify(dragNDropValues_02_130)).default;
    expect(service.mapToElementModelValue(['value_1', 'value_2'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map an elementCode value to drop-list-simple elementModel value with imageSrc', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    const elementModel: DropListSimpleElement = JSON.parse(JSON.stringify(dropListSimple_131));
    const expectedValue = JSON.parse(JSON.stringify(dragNDropValues_02_130)).default;
    expect(service.mapToElementModelValue(['value_1', 'value_2'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map an elementCode value to drop-list-simple elementModel value - an empty array', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    const elementModel: DropListElement = JSON.parse(JSON.stringify(dropList_130));
    expect(service.mapToElementModelValue([], elementModel ))
      .toEqual([]);
  });

  it('should map an elementCode value to drop-list elementModel value - an empty array', () => {
    service.dragNDropValueObjects = JSON.parse(JSON.stringify(dragNDropValues_01_130)).default;
    const elementModel: DropListSimpleElement = JSON.parse(JSON.stringify(dropListSimple_131));
    expect(service.mapToElementModelValue([], elementModel ))
      .toEqual([]);
  });

  it('should map an elementCode value to text elementModel value (text)', () => {
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

  it('should map an elementCode value to audio elementModel value', () => {
    const elementModel: AudioElement = JSON.parse(JSON.stringify(audio_130));
    expect(service.mapToElementModelValue( 2, elementModel))
      .toEqual(2);
  });

  it('should not map but return the audio elementModel value (player.playbackTime)', () => {
    const elementModel: AudioElement = JSON.parse(JSON.stringify(audio_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(0);
  });

  it('should map an elementCode value to image elementModel value', () => {
    const elementModel: ImageElement = JSON.parse(JSON.stringify(image_130));
    expect(service.mapToElementModelValue( true, elementModel))
      .toEqual(true);
  });

  it('should not map but return the image elementModel value (magnifierUsed)', () => {
    const elementModel: ImageElement = JSON.parse(JSON.stringify(image_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(false);
  });

  it('should map an elementCode value to text-field elementModel value', () => {
    const elementModel: TextFieldElement = JSON.parse(JSON.stringify(textField_130));
    expect(service.mapToElementModelValue( 'TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-field elementModel value', () => {
    const elementModel: TextFieldElement = JSON.parse(JSON.stringify(textField_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to text-area elementModel value', () => {
    const elementModel: TextAreaElement = JSON.parse(JSON.stringify(textArea_130));
    expect(service.mapToElementModelValue( 'TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-area elementModel value', () => {
    const elementModel: TextAreaElement = JSON.parse(JSON.stringify(textArea_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to spell-correct elementModel value', () => {
    const elementModel: SpellCorrectElement = JSON.parse(JSON.stringify(spellCorrect_130));
    expect(service.mapToElementModelValue( 'TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the spell-correct elementModel value', () => {
    const elementModel: SpellCorrectElement = JSON.parse(JSON.stringify(spellCorrect_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to radio elementModel value', () => {
    const elementModel: RadioButtonGroupElement = JSON.parse(JSON.stringify(radio_130));
    expect(service.mapToElementModelValue( 1, elementModel))
      .toEqual(0);
  });

  it('should not map but return the radio elementModel value', () => {
    const elementModel: RadioButtonGroupElement = JSON.parse(JSON.stringify(radio_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to radio-group-images elementModel value', () => {
    const elementModel: RadioButtonGroupComplexElement = JSON.parse(JSON.stringify(radioGroupImages_130));
    expect(service.mapToElementModelValue( 2, elementModel))
      .toEqual(1);
  });

  it('should not map but return the radio-group-images elementModel value', () => {
    const elementModel: RadioButtonGroupComplexElement = JSON.parse(JSON.stringify(radioGroupImages_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to likert-row elementModel value', () => {
    const elementModel: LikertRowElement = JSON.parse(JSON.stringify(likertRow_130));
    expect(service.mapToElementModelValue( 3, elementModel))
      .toEqual(2);
  });

  it('should not map but return the likert-row elementModel value', () => {
    const elementModel: LikertRowElement = JSON.parse(JSON.stringify(likertRow_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to toggle-button elementModel value', () => {
    const elementModel: ToggleButtonElement = JSON.parse(JSON.stringify(toggleButton_130));
    expect(service.mapToElementModelValue( 1, elementModel))
      .toEqual(0);
  });

  it('should not map but return the toggle-button elementModel value', () => {
    const elementModel: ToggleButtonElement = JSON.parse(JSON.stringify(toggleButton_130));
    expect(service.mapToElementModelValue( undefined, elementModel))
      .toEqual(null);
  });
});

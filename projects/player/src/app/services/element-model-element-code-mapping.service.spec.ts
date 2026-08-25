import { TestBed } from '@angular/core/testing';
import { DropListElement } from 'common/models/elements/drop-list';
import { TextElement } from 'common/models/elements/text';
import { MathFormulaMarkup } from 'common/utils/math-formula-markup';
import { TextMarkingUtils } from 'player/src/app/classes/text-marking-utils';
import { AudioElement } from 'common/models/elements/audio';
import { ImageElement } from 'common/models/elements/image';
import { TextFieldElement } from 'common/models/elements/text-field';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-field-simple';
import { TextAreaElement } from 'common/models/elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/spell-correct';
import { RadioButtonGroupElement } from 'common/models/elements/radio-button-group';
import { RadioButtonGroupComplexElement } from 'common/models/elements/radio-button-group-complex';
import { LikertRowElement } from 'common/models/elements/likert-row';
import { ToggleButtonElement } from 'common/models/elements/toggle-button';
import { Hotspot, HotspotImageElement } from 'common/models/elements/hotspot-image';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-periodic-table';
import { ElementFactory } from 'common/utils/element-factory';
import { ElementModelElementCodeMappingService } from './element-model-element-code-mapping.service';

/* Element models are built here, not read from JSON files under `test-data/`: what a test is about
   should be visible in the test. The files this replaced carried the 1.3.0 shape with sixty keys per
   element, of which each test used one or two -- and the ones with images carried them as base64
   (#1171). Whatever a test does not name, the element brings itself. */
const withProperties = <T>(element: T, properties: Partial<T>): T => {
  Object.assign(element as object, properties);
  return element;
};

/* Three values as a drop list holds them, the third without an image. The images were 200 KB of base64
   in the file this replaced; no assertion looks at them, they are only carried through. */
const dragNDropValues = (): DragNDropValueObject[] => ([
  {
    stringValue: 'a', imgSrcValue: 'img-a', id: 'value_1', alias: 'alias_1'
  },
  {
    stringValue: 'b', imgSrcValue: 'img-b', id: 'value_2', alias: 'alias_2'
  },
  { stringValue: 'c', id: 'value_3', alias: 'alias_3' }
] as unknown as DragNDropValueObject[]);

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
    const dragNDropValueObjects: DragNDropValueObject[] = dragNDropValues();
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(dragNDropValueObjects, 'drop-list'))
      .toEqual(['alias_1', 'alias_2', 'alias_3']);
  });

  it('should map the value of a text elementModel to its elementCode value', () => {
    const textValue =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textValue, 'text', { markingMode: 'selection' }))
      .toEqual(['6-11-#f9f871']);
  });

  it('should map the value of a text elementModel to its elementCode value - empty Array', () => {
    const textValue = 'Lorem dolor sit amet';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textValue, 'text', { markingMode: 'selection' }))
      .toEqual([]);
  });

  it('should map the value of a audio elementModel to its elementCode value', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(2, 'audio'))
      .toEqual(2);
  });

  it('should map the value of a iamge elementModel to its elementCode value', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(true, 'audio'))
      .toEqual(true);
  });

  it('should map the value of a image elementModel to its elementCode value', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(false, 'audio'))
      .toEqual(false);
  });

  it('should map the value of a radio elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(ElementModelElementCodeMappingService.mapToElementCodeValue(i, 'radio'))
        .toEqual(i + 1);
    }
  });

  it('should map the value null of a radio elementModel to null', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(null, 'radio'))
      .toBe(null);
  });

  it('should map the value of a hotspot image elementModel to its elementCode value', () => {
    const hotspots: Hotspot[] = [
      {
        top: 10,
        left: 10,
        width: 20,
        height: 20,
        shape: 'rectangle',
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: '#000000',
        rotation: 0,
        readOnly: false,
        value: true
      },
      {
        top: 10,
        left: 10,
        width: 20,
        height: 20,
        shape: 'rectangle',
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: '#000000',
        rotation: 0,
        readOnly: false,
        value: false
      }
    ];
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(hotspots, 'hotspot-image'))
      .toEqual([true, false]);
  });

  it('should map the value of a hotspot image elementModel to its elementCode value', () => {
    const hotspots: Hotspot[] = [];

    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(hotspots, 'hotspot-image'))
      .toEqual([]);
  });

  it('should map the value of a radio-group-images elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(ElementModelElementCodeMappingService.mapToElementCodeValue(i, 'radio-group-images'))
        .toEqual(i + 1);
    }
  });

  it('should map the value null of a radio-group-images elementModel to null', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(null, 'radio'))
      .toBe(null);
  });

  it('should map the value of a dropdown elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(ElementModelElementCodeMappingService.mapToElementCodeValue(i, 'dropdown'))
        .toEqual(i + 1);
    }
  });

  it('should map the value null of a dropdown elementModel to null', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(null, 'radio'))
      .toBe(null);
  });

  it('should map the value of a toggle-button elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(ElementModelElementCodeMappingService.mapToElementCodeValue(i, 'toggle-button'))
        .toEqual(i + 1);
    }
  });

  it('should map the value null of a toggle-button elementModel to null', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(null, 'radio'))
      .toBe(null);
  });

  it('should map the value of a likert-row elementModel to its elementCode value', () => {
    for (let i = 0; i < 10; i++) {
      expect(ElementModelElementCodeMappingService.mapToElementCodeValue(i, 'likert-row'))
        .toEqual(i + 1);
    }
  });

  it('should map the value null of a likert-row  elementModel to null', () => {
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(null, 'radio'))
      .toBe(null);
  });

  it('should map the value of a text-field elementModel to its elementCode value', () => {
    const textFieldValue = 'TEST';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textFieldValue, 'text-field'))
      .toEqual('TEST');
  });

  it('should map the value of a text-field elementModel to its elementCode value', () => {
    const textFieldValue = null;
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textFieldValue, 'text-field'))
      .toEqual(null);
  });

  it('should map the value of a text-field-simple elementModel to its elementCode value', () => {
    const textFieldValue = 'TEST';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textFieldValue, 'text-field-simple'))
      .toEqual('TEST');
  });

  it('should map the value of a text-field-simple elementModel to its elementCode value', () => {
    const textFieldValue = null;
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textFieldValue, 'text-field-simple'))
      .toEqual(null);
  });

  it('should map the value of a spell-correct elementModel to its elementCode value', () => {
    const spellCorrectValue = 'TEST';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(spellCorrectValue, 'spell-correct'))
      .toEqual('TEST');
  });

  it('should map the value of a spell-correct elementModel to its elementCode value', () => {
    const spellCorrectValue = null;
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(spellCorrectValue, 'spell-correct'))
      .toEqual(null);
  });

  it('should map the value of a text-area elementModel to its elementCode value', () => {
    const textAreaValue = 'TEST';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textAreaValue, 'text-area'))
      .toEqual('TEST');
  });

  it('should map the value of a text-area elementModel to its elementCode value', () => {
    const textAreaValue = null;
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(textAreaValue, 'text-area'))
      .toEqual(null);
  });

  it('should map the value of a widget-periodic-table elementModel to its elementCode value', () => {
    const widgetValue = 'stateString';
    expect(ElementModelElementCodeMappingService.mapToElementCodeValue(widgetValue, 'widget-periodic-table'))
      .toEqual('stateString');
  });

  // mapToElementValue

  it('should map an elementCode value to drop-list elementModel value', () => {
    service.dragNDropValueObjects = [
      {
        text: 'a',
        id: 'value_1',
        alias: 'value_1',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      },
      {
        text: 'b',
        id: 'value_2',
        alias: 'value_2',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      },
      {
        text: 'c',
        id: 'value_3',
        alias: 'value_3',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      },
      {
        text: 'd',
        id: 'value_4',
        alias: 'value_4',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      },
      {
        text: 'e',
        id: 'value_5',
        alias: 'value_5',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      }
    ];
    const elementModel: DropListElement = new DropListElement({ id: 'drop-list_1' });
    const expectedValue: DragNDropValueObject[] = [
      {
        text: 'e',
        id: 'value_5',
        alias: 'value_5',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      }
    ];
    expect(service.mapToElementModelValue(['value_5'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map an elementCode value to drop-list elementModel value', () => {
    service.dragNDropValueObjects = [
      {
        text: 'a',
        id: 'value_1',
        alias: 'value_1',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 0
      },
      {
        text: 'b',
        id: 'value_2',
        alias: 'value_2',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 1
      },
      {
        text: 'c',
        id: 'value_3',
        alias: 'value_3',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 2
      },
      {
        text: 'd',
        id: 'value_4',
        alias: 'value_4',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 3
      },
      {
        text: 'e',
        id: 'value_5',
        alias: 'value_5',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 4
      }
    ];
    const elementModel: DropListElement = new DropListElement({ id: 'drop-list_1' });
    const expectedValue: DragNDropValueObject[] = [
      {
        text: 'e',
        id: 'value_5',
        alias: 'value_5',
        imgSrc: null,
        imgFileName: '',
        audioSrc: null,
        audioFileName: '',
        imgPosition: 'above',
        originListID: 'id',
        originListIndex: 4
      }
    ];
    expect(service.mapToElementModelValue(['value_5'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map an elementCode value to drop-list elementModel value with imageSrc', () => {
    service.dragNDropValueObjects = dragNDropValues();
    const elementModel: DropListElement = new DropListElement({ id: 'drop-list_1' });
    const expectedValue = dragNDropValues().slice(0, 2);
    expect(service.mapToElementModelValue(['alias_1', 'alias_2'], elementModel))
      .toEqual(expectedValue);
  });

  it('should map an elementCode value to drop-list-simple elementModel value - an empty array', () => {
    service.dragNDropValueObjects = dragNDropValues();
    const elementModel: DropListElement = new DropListElement({ id: 'drop-list_1' });
    expect(service.mapToElementModelValue([], elementModel))
      .toEqual([]);
  });

  it('should map an elementCode value to text elementModel value (text)', () => {
    const elementModel: TextElement =
      withProperties(new TextElement({ id: 'text_1' }), { text: 'Lorem ipsum dolor sit amet' });
    const expectedValue =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    expect(service.mapToElementModelValue(['6-11-#f9f871'], elementModel))
      .toEqual(expectedValue);
  });

  it('should not map but return the text elementModel value (text)', () => {
    const elementModel: TextElement =
      withProperties(new TextElement({ id: 'text_1' }), { text: 'Lorem ipsum dolor sit amet' });
    expect(service.mapToElementModelValue([], elementModel))
      .toEqual(elementModel.text);
  });

  it('should not map but return the text elementModel value (text)', () => {
    const elementModel: TextElement =
      withProperties(new TextElement({ id: 'text_1' }), { text: 'Lorem ipsum dolor sit amet' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(elementModel.text);
  });

  it('should map an elementCode value to audio elementModel value', () => {
    const elementModel: AudioElement = new AudioElement({ id: 'audio_1' });
    expect(service.mapToElementModelValue(2, elementModel))
      .toEqual(2);
  });

  it('should not map but return the audio elementModel value (player.playbackTime)', () => {
    const elementModel: AudioElement = new AudioElement({ id: 'audio_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(0);
  });

  it('should map an elementCode value to image elementModel value', () => {
    const elementModel: ImageElement = new ImageElement({ id: 'image_1' });
    expect(service.mapToElementModelValue(true, elementModel))
      .toEqual(true);
  });

  it('should not map but return the image elementModel value (magnifierUsed)', () => {
    const elementModel: ImageElement = new ImageElement({ id: 'image_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(false);
  });

  it('should map an elementCode value to text-field elementModel value', () => {
    const elementModel: TextFieldElement = new TextFieldElement({ id: 'text-field_1' });
    expect(service.mapToElementModelValue('TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-field elementModel value', () => {
    const elementModel: TextFieldElement = new TextFieldElement({ id: 'text-field_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to text-field-simple elementModel value', () => {
    const elementModel: TextFieldSimpleElement = new TextFieldSimpleElement({ id: 'text-field-simple_1' });
    expect(service.mapToElementModelValue('TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-field-simple elementModel value', () => {
    const elementModel: TextFieldSimpleElement = new TextFieldSimpleElement({ id: 'text-field-simple_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to text-area elementModel value', () => {
    const elementModel: TextAreaElement = new TextAreaElement({ id: 'text-area_1' });
    expect(service.mapToElementModelValue('TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the text-area elementModel value', () => {
    const elementModel: TextAreaElement = new TextAreaElement({ id: 'text-area_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to spell-correct elementModel value', () => {
    const elementModel: SpellCorrectElement = new SpellCorrectElement({ id: 'spell-correct_1' });
    expect(service.mapToElementModelValue('TEST', elementModel))
      .toEqual('TEST');
  });

  it('should not map but return the spell-correct elementModel value', () => {
    const elementModel: SpellCorrectElement = new SpellCorrectElement({ id: 'spell-correct_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to radio elementModel value', () => {
    const elementModel: RadioButtonGroupElement = new RadioButtonGroupElement({ id: 'radio_1' });
    expect(service.mapToElementModelValue(1, elementModel))
      .toEqual(0);
  });

  it('should not map but return the radio elementModel value', () => {
    const elementModel: RadioButtonGroupElement = new RadioButtonGroupElement({ id: 'radio_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to radio-group-images elementModel value', () => {
    const elementModel: RadioButtonGroupComplexElement =
      new RadioButtonGroupComplexElement({ id: 'radio-group-images_1' });
    expect(service.mapToElementModelValue(2, elementModel))
      .toEqual(1);
  });

  it('should not map but return the radio-group-images elementModel value', () => {
    const elementModel: RadioButtonGroupComplexElement =
      new RadioButtonGroupComplexElement({ id: 'radio-group-images_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to likert-row elementModel value', () => {
    const elementModel: LikertRowElement = new LikertRowElement({ id: 'likert-row_1' });
    expect(service.mapToElementModelValue(3, elementModel))
      .toEqual(2);
  });

  it('should not map but return the likert-row elementModel value', () => {
    const elementModel: LikertRowElement = new LikertRowElement({ id: 'likert-row_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to toggle-button elementModel value', () => {
    const elementModel: ToggleButtonElement = new ToggleButtonElement({ id: 'toggle-button_1' });
    expect(service.mapToElementModelValue(1, elementModel))
      .toEqual(0);
  });

  it('should not map but return the toggle-button elementModel value', () => {
    const elementModel: ToggleButtonElement = new ToggleButtonElement({ id: 'toggle-button_1' });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual(null);
  });

  it('should map an elementCode value to hotspot-image elementModel value', () => {
    const elementModel: HotspotImageElement = withProperties(new HotspotImageElement({ id: 'hotspot-image_1' }), {
      value: [{
        top: 10,
        left: 10,
        width: 20,
        height: 20,
        shape: 'rectangle',
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: '#000000',
        rotation: 0,
        readOnly: false,
        value: true
      }]
    });
    expect(service.mapToElementModelValue([true], elementModel))
      .toEqual([
        {
          top: 10,
          left: 10,
          width: 20,
          height: 20,
          shape: 'rectangle',
          borderWidth: 1,
          borderColor: '#000000',
          backgroundColor: '#000000',
          rotation: 0,
          readOnly: false,
          value: true
        }
      ]);
  });

  it('should map an elementCode value to hotspot-image elementModel value', () => {
    const elementModel: HotspotImageElement = withProperties(new HotspotImageElement({ id: 'hotspot-image_1' }), {
      value: [{
        top: 10,
        left: 10,
        width: 20,
        height: 20,
        shape: 'rectangle',
        borderWidth: 1,
        borderColor: '#000000',
        backgroundColor: '#000000',
        rotation: 0,
        readOnly: false,
        value: true
      }]
    });
    expect(service.mapToElementModelValue([false], elementModel))
      .toEqual([
        {
          top: 10,
          left: 10,
          width: 20,
          height: 20,
          shape: 'rectangle',
          borderWidth: 1,
          borderColor: '#000000',
          backgroundColor: '#000000',
          rotation: 0,
          readOnly: false,
          value: false
        }
      ]);
  });

  it('should map an elementCode value to widget-periodic-table elementModel value', () => {
    const elementModel = new WidgetPeriodicTableElement({
      id: 'id1', alias: 'alias1', type: 'widget-periodic-table', state: 'initial_state'
    });
    expect(service.mapToElementModelValue('new_state', elementModel))
      .toEqual('new_state');
  });

  it('should not map but return the widget-periodic-table elementModel value', () => {
    const elementModel = new WidgetPeriodicTableElement({
      id: 'id1', alias: 'alias1', type: 'widget-periodic-table', state: 'initial_state'
    });
    expect(service.mapToElementModelValue(undefined, elementModel))
      .toEqual('initial_state');
  });

  /* Selection marks are stored as character offsets into the text as the browser rendered it, and they
     are restored into what `markingBase` returns -- so the two must be the same string. Since #1105 the
     display rebuilds a formula from its LaTeX, and a base that still held the stored markup would put
     every offset behind a formula inside that markup: for one formula, over 1600 characters off. */
  describe('the base a marking answer is measured against (#1105)', () => {
    /* A formula as an editor before 2.12.4 stored it, shortened: KaTeX MathML in both places. */
    const OLD_FORM = '<aspect-nodeview-math-formula formula="\\overline{BC}" ' +
      'formulahtml="&lt;span class=&quot;katex&quot;&gt;&lt;math&gt;&lt;/math&gt;&lt;/span&gt;">' +
      '<span><span class="katex"><math><mi>B</mi></math></span></span></aspect-nodeview-math-formula>';

    /* Built through the factory and then set, rather than passed in: the factory's parameter takes the
       base properties only, and a blueprint wide enough to carry `text` would need a cast. */
    const textWithFormula = (): TextElement => {
      const element = ElementFactory
        .createElement({ type: 'text', id: 'text1', alias: 'text1' }) as TextElement;
      element.text = `<p>Vor ${OLD_FORM} nach</p>`;
      element.markingMode = 'selection';
      return element;
    };

    it('should hand out the same text the display renders', () => {
      const base = ElementModelElementCodeMappingService.markingBase(textWithFormula());

      expect(base).toContain('ML__latex');
      expect(base).not.toContain('<math>');
      expect(MathFormulaMarkup.refreshInStoredHtml(base)).toBe(base);
    });

    /* The mark has to land on the word again, not inside the formula. The tag itself is rebuilt in a
       canonical form by `restoreMarkedTextIndices`, so the assertion is about WHERE it sits. */
    it('should restore a mark at the offset the rendered text gave it', () => {
      const elementModel = textWithFormula();
      const base = ElementModelElementCodeMappingService.markingBase(elementModel);
      const marked = base.replace(
        'nach', '<aspect-marked style="background-color: rgb(249, 248, 113);">nach</aspect-marked>'
      );
      const offsets = TextMarkingUtils.getMarkedTextIndices(marked);

      const restored = service.mapToElementModelValue(offsets, elementModel) as string;

      expect(offsets).toHaveLength(1);
      expect(restored).toContain('>nach</aspect-marked>');
      expect(restored.indexOf('<aspect-marked'))
        .toBeGreaterThan(restored.indexOf('</aspect-nodeview-math-formula>'));
    });
  });
});

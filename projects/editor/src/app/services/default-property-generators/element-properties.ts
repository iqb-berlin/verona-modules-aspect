import { UIElementProperties, UIElementType } from 'common/models/elements/element';
import { ButtonProperties } from 'common/models/elements/button/button';
import { TextFieldProperties } from 'common/models/elements/input-elements/text-field';
import { TextAreaProperties } from 'common/models/elements/input-elements/text-area';
import { CheckboxProperties } from 'common/models/elements/input-elements/checkbox';
import { DropdownProperties } from 'common/models/elements/input-elements/dropdown';
import { RadioButtonGroupProperties } from 'common/models/elements/input-elements/radio-button-group';
import { ImageProperties } from 'common/models/elements/media-elements/image';
import { AudioProperties } from 'common/models/elements/media-elements/audio';
import { VideoProperties } from 'common/models/elements/media-elements/video';
import { LikertProperties } from 'common/models/elements/compound-elements/likert/likert';
import { RadioButtonGroupComplexProperties } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropListProperties } from 'common/models/elements/input-elements/drop-list';
import { SliderProperties } from 'common/models/elements/input-elements/slider';
import { SpellCorrectProperties } from 'common/models/elements/input-elements/spell-correct';
import { FrameProperties } from 'common/models/elements/frame/frame';
import { GeometryProperties } from 'common/models/elements/geometry/geometry';
import { HotspotImageProperties } from 'common/models/elements/input-elements/hotspot-image';
import { LikertRowProperties } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextProperties } from 'common/models/elements/text/text';
import { ClozeElement, ClozeProperties } from 'common/models/elements/compound-elements/cloze/cloze';
import { TextFieldSimpleProperties }
  from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { ToggleButtonProperties }
  from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { MathFieldProperties } from 'common/models/elements/input-elements/math-field';
import { ElementPropertyGroupGenerator }
  from 'editor/src/app/services/default-property-generators/element-property-groups';

export class ElementPropertyGenerator {
  static getButton(): ButtonProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      label: 'Knopf',
      imageSrc: null,
      asLink: false,
      action: null,
      actionParam: null,
      tooltipText: '',
      tooltipPosition: 'above',
      superscriptLabel: false,
      subscriptLabel: false,
      styling: {
        ...ElementPropertyGroupGenerator.generateFontStylingProps(),
        ...ElementPropertyGroupGenerator.generateBorderStylingProps(),
        backgroundColor: 'transparent'
      }
    };
  }

  static getFrame(): FrameProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      hasBorderTop: true,
      hasBorderBottom: true,
      hasBorderLeft: true,
      hasBorderRight: true,
      position: {
        ...ElementPropertyGroupGenerator.generatePositionProps(),
        zIndex: -1
      },
      styling: {
        ...ElementPropertyGroupGenerator.generateBorderStylingProps(),
        borderWidth: 1,
        backgroundColor: 'transparent'
      }
    };
  }

  static getCheckbox(): CheckboxProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 215
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: ElementPropertyGroupGenerator.generateBasicStyleProps()
    };
  }

  static getDropList(): DropListProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 100,
        minHeight: 100
      },
      value: [],
      onlyOneItem: false,
      connectedTo: [],
      copyOnDrop: false,
      allowReplacement: false,
      orientation: 'vertical',
      highlightReceivingDropList: false,
      highlightReceivingDropListColor: '#006064',
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        backgroundColor: '#ededed',
        itemBackgroundColor: '#c9e0e0'
      }
    };
  }

  static getDropdown(): DropdownProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 240,
        height: 83
      },
      options: [],
      allowUnset: false,
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: ElementPropertyGroupGenerator.generateBasicStyleProps()
    };
  }

  static getHotspotImage(): HotspotImageProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 100
      },
      value: [],
      src: null,
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      }
    };
  }

  static getRadioButtonGroup(): RadioButtonGroupProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 100
      },
      options: [],
      alignment: 'column',
      strikeOtherOptions: false,
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      }
    };
  }

  static getRadioButtonGroupComplex(): RadioButtonGroupComplexProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 100
      },
      options: [],
      itemsPerRow: null,
      position: {
        ...ElementPropertyGroupGenerator.generatePositionProps(),
        marginBottom: { value: 40, unit: 'px' }
      },
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps()
      }
    };
  }

  static getSlider(): SliderProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      },
      minValue: 0,
      maxValue: 100,
      showValues: true,
      barStyle: false,
      thumbLabel: false
    };
  }

  static getSpellCorrect(): SpellCorrectProperties {
    return {
      ...ElementPropertyGroupGenerator.generateTextInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 230,
        height: 80
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: ElementPropertyGroupGenerator.generateBasicStyleProps()
    };
  }

  static getTextArea(): TextAreaProperties {
    return {
      ...ElementPropertyGroupGenerator.generateTextInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 230,
        height: 132
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      },
      appearance: 'outline',
      resizeEnabled: false,
      hasDynamicRowCount: false,
      rowCount: 3,
      expectedCharactersCount: 300,
      hasReturnKey: false,
      hasKeyboardIcon: false
    };
  }

  static getTextField(): TextFieldProperties {
    return {
      ...ElementPropertyGroupGenerator.generateTextInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 180,
        height: 120
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      },
      appearance: 'outline',
      minLength: null,
      minLengthWarnMessage: 'Eingabe zu kurz',
      maxLength: null,
      maxLengthWarnMessage: 'Eingabe zu lang',
      isLimitedToMaxLength: false,
      pattern: null,
      patternWarnMessage: 'Eingabe entspricht nicht der Vorgabe',
      hasKeyboardIcon: false,
      clearable: false
    };
  }

  static getAudio(): AudioProperties {
    return {
      ...ElementPropertyGroupGenerator.generatePlayerElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 250,
        height: 90
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      src: null
    };
  }

  static getVideo(): VideoProperties {
    return {
      ...ElementPropertyGroupGenerator.generatePlayerElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 280,
        height: 230
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      src: null,
      scale: false
    };
  }

  static getImage(): ImageProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 100
      },
      src: null,
      alt: 'Bild nicht gefunden',
      scale: false,
      magnifier: false,
      magnifierSize: 100,
      magnifierZoom: 1.5,
      magnifierUsed: false,
      position: ElementPropertyGroupGenerator.generatePositionProps()
    };
  }

  static getGeometry(): GeometryProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 600,
        height: 400
      },
      appDefinition: '',
      showResetIcon: true,
      enableUndoRedo: true,
      showToolbar: true,
      enableShiftDragZoom: true,
      showZoomButtons: true,
      showFullscreenButton: true,
      customToolbar: ''
    };
  }

  static getLikert(): LikertProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 250,
        height: 200
      },
      position: {
        ...ElementPropertyGroupGenerator.generatePositionProps(),
        marginBottom: { value: 35, unit: 'px' }
      },
      rows: [],
      options: [],
      firstColumnSizeRatio: 5,
      label: 'Optionentabelle Beschriftung',
      label2: 'Beschriftung Erste Spalte',
      stickyHeader: false,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        backgroundColor: 'white',
        lineHeight: 135,
        lineColoring: true,
        lineColoringColor: '#c9e0e0'
      }
    };
  }

  static getLikertRow(): LikertRowProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      // TODO position?
      rowLabel: { text: '', imgSrc: null, imgPosition: 'above' },
      columnCount: 0,
      firstColumnSizeRatio: 5,
      verticalButtonAlignment: 'center'
    };
  }

  static getText(): TextProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 98
      },
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      text: 'Lorem ipsum dolor sit amet',
      highlightableOrange: false,
      highlightableTurquoise: false,
      highlightableYellow: false,
      hasSelectionPopup: true,
      columnCount: 1,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      }
    };
  }

  static getMathfield(): MathFieldProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      enableModeSwitch: false,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 135
      }
    };
  }

  static getCloze(): ClozeProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      position: ElementPropertyGroupGenerator.generatePositionProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 200
      },
      document: ClozeElement.initDocument(),
      columnCount: 1,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 150
      }
    };
  }

  static getTextFieldSimple(): TextFieldSimpleProperties {
    return {
      ...ElementPropertyGroupGenerator.generateTextInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        width: 150,
        height: 30,
        isWidthFixed: true
      },
      minLength: null,
      minLengthWarnMessage: 'Eingabe zu kurz',
      maxLength: null,
      maxLengthWarnMessage: 'Eingabe zu lang',
      isLimitedToMaxLength: false,
      pattern: null,
      patternWarnMessage: 'Eingabe entspricht nicht der Vorgabe',
      clearable: false,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 100
      }
    };
  }

  static getToggleButton(): ToggleButtonProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      dimensions: {
        ...ElementPropertyGroupGenerator.generateDimensionProps(),
        height: 30
      },
      options: [],
      strikeOtherOptions: false,
      strikeSelectedOption: false,
      verticalOrientation: false,
      styling: {
        ...ElementPropertyGroupGenerator.generateBasicStyleProps(),
        lineHeight: 100,
        selectionColor: '#c7f3d0'
      }
    };
  }

  static generateElementBlueprint(elementType: UIElementType): UIElementProperties {
    return ElementPropertyGenerator.BLUEPRINT_GENERATORS[elementType]();
  }

  static BLUEPRINT_GENERATORS: Record<string, () => UIElementProperties> = {
    text: ElementPropertyGenerator.getText,
    button: ElementPropertyGenerator.getButton,
    'text-field': ElementPropertyGenerator.getTextField,
    'text-field-simple': ElementPropertyGenerator.getTextFieldSimple,
    'text-area': ElementPropertyGenerator.getTextArea,
    checkbox: ElementPropertyGenerator.getCheckbox,
    dropdown: ElementPropertyGenerator.getDropdown,
    radio: ElementPropertyGenerator.getRadioButtonGroup,
    image: ElementPropertyGenerator.getImage,
    audio: ElementPropertyGenerator.getAudio,
    video: ElementPropertyGenerator.getVideo,
    likert: ElementPropertyGenerator.getLikert,
    'likert-row': ElementPropertyGenerator.getLikertRow,
    'radio-group-images': ElementPropertyGenerator.getRadioButtonGroupComplex,
    'drop-list': ElementPropertyGenerator.getDropList,
    cloze: ElementPropertyGenerator.getCloze,
    slider: ElementPropertyGenerator.getSlider,
    'spell-correct': ElementPropertyGenerator.getSpellCorrect,
    frame: ElementPropertyGenerator.getFrame,
    'toggle-button': ElementPropertyGenerator.getToggleButton,
    geometry: ElementPropertyGenerator.getGeometry,
    'hotspot-image': ElementPropertyGenerator.getHotspotImage,
    'math-field': ElementPropertyGenerator.getMathfield
  };
}

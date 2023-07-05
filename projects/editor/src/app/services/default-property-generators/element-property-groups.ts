import {
  BasicStyles, BorderStyles,
  DimensionProperties, FontStyles, PlayerProperties,
  PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import {
  InputElementProperties,
  PlayerElementBlueprint,
  TextInputElementProperties,
  UIElementProperties
} from 'common/models/elements/element';

export class ElementPropertyGroupGenerator {
  static generateElementProps(): UIElementProperties {
    return {
      id: 'placeholder',
      dimensions: ElementPropertyGroupGenerator.generateDimensionProps(),
      position: ElementPropertyGroupGenerator.generatePositionProps()
    };
  }

  static generateInputElementProps(): InputElementProperties {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      label: 'Beschriftung',
      value: null,
      required: false,
      requiredWarnMessage: 'Eingabe erforderlich',
      readOnly: false
    };
  }

  static generateTextInputElementProps(): TextInputElementProperties {
    return {
      ...ElementPropertyGroupGenerator.generateInputElementProps(),
      inputAssistancePreset: null,
      inputAssistanceCustomKeys: '',
      inputAssistancePosition: 'floating',
      inputAssistanceFloatingStartPosition: 'startBottom',
      restrictedToInputAssistanceChars: true,
      hasArrowKeys: false,
      hasBackspaceKey: false,
      showSoftwareKeyboard: false,
      softwareKeyboardShowFrench: false
    };
  }

  static generatePositionProps(): PositionProperties {
    return {
      xPosition: 0,
      yPosition: 0,
      gridColumn: null,
      gridColumnRange: 1,
      gridRow: null,
      gridRowRange: 1,
      marginLeft: { value: 0, unit: 'px' },
      marginRight: { value: 0, unit: 'px' },
      marginTop: { value: 0, unit: 'px' },
      marginBottom: { value: 0, unit: 'px' },
      zIndex: 0
    };
  }

  static generateDimensionProps(): DimensionProperties {
    return {
      width: 180,
      height: 60,
      isWidthFixed: false,
      isHeightFixed: false,
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null
    };
  }

  static generateBasicStyleProps(defaults: Partial<BasicStyles> = {}): BasicStyles {
    return {
      backgroundColor: 'transparent',
      ...ElementPropertyGroupGenerator.generateFontStylingProps(defaults)
    };
  }

  static generateFontStylingProps(defaults: Partial<FontStyles> = {}): FontStyles {
    return {
      fontColor: defaults.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults?.font !== undefined ? defaults.font as string : 'Roboto',
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : false
    };
  }

  static generateBorderStylingProps(defaults: Partial<Stylings> = {}): BorderStyles {
    return {
      borderWidth: defaults.borderWidth !== undefined ? defaults.borderWidth : 0,
      borderColor: defaults.borderColor !== undefined ? defaults.borderColor : 'black',
      borderStyle: defaults.borderStyle !== undefined ? defaults.borderStyle : 'solid',
      borderRadius: defaults.borderRadius !== undefined ? defaults.borderRadius : 0
    };
  }

  static generatePlayerElementProps(): PlayerElementBlueprint {
    return {
      ...ElementPropertyGroupGenerator.generateElementProps(),
      player: ElementPropertyGroupGenerator.generatePlayerProps()
    };
  }

  static generatePlayerProps(properties: Partial<PlayerProperties> = {}): PlayerProperties {
    return {
      autostart: properties.autostart !== undefined ? properties.autostart as boolean : false,
      autostartDelay: properties.autostartDelay !== undefined ? properties.autostartDelay as number : 0,
      loop: properties.loop !== undefined ? properties.loop as boolean : false,
      startControl: properties.startControl !== undefined ? properties.startControl as boolean : true,
      pauseControl: properties.pauseControl !== undefined ? properties.pauseControl as boolean : false,
      progressBar: properties.progressBar !== undefined ? properties.progressBar as boolean : true,
      interactiveProgressbar: properties.interactiveProgressbar !== undefined ?
        properties.interactiveProgressbar as boolean :
        false,
      volumeControl: properties.volumeControl !== undefined ? properties.volumeControl as boolean : true,
      defaultVolume: properties.defaultVolume !== undefined ? properties.defaultVolume as number : 0.8,
      minVolume: properties.minVolume !== undefined ? properties.minVolume as number : 0,
      muteControl: properties.muteControl !== undefined ? properties.muteControl as boolean : true,
      interactiveMuteControl: properties.interactiveMuteControl !== undefined ?
        properties.interactiveMuteControl as boolean :
        false,
      hintLabel: properties.hintLabel !== undefined ? properties.hintLabel as string : '',
      hintLabelDelay: properties.hintLabelDelay !== undefined ? properties.hintLabelDelay as number : 0,
      activeAfterID: properties.activeAfterID !== undefined ? properties.activeAfterID as string : '',
      minRuns: properties.minRuns !== undefined ? properties.minRuns as number : 1,
      maxRuns: properties.maxRuns !== undefined ? properties.maxRuns as number | null : null,
      showRestRuns: properties.showRestRuns !== undefined ? properties.showRestRuns as boolean : false,
      showRestTime: properties.showRestTime !== undefined ? properties.showRestTime as boolean : true,
      playbackTime: properties.playbackTime !== undefined ? properties.playbackTime as number : 0
    };
  }
}

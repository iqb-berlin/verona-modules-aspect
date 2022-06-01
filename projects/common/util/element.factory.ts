import {
  BasicStyles, PlayerProperties, PositionProperties, TextImageLabel,
  UIElementValue
} from 'common/models/elements/element';

export abstract class ElementFactory {

  static initPositionProps(defaults: Record<string, UIElementValue> = {}): PositionProperties {
    return {
      fixedSize: defaults.fixedSize !== undefined ? defaults.fixedSize as boolean : false,
      dynamicPositioning: defaults.dynamicPositioning !== undefined ? defaults.dynamicPositioning as boolean : true,
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition as number : 0,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition as number : 0,
      useMinHeight: defaults.useMinHeight !== undefined ? defaults.useMinHeight as boolean : false,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn as number : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange as number : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow as number : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange as number : 1,
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft as number : 0,
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight as number : 0,
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop as number : 0,
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom as number : 0,
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex as number : 0
    };
  }

  static initStylingProps<T>(defaults?: Partial<BasicStyles> & T): BasicStyles & T {
    return {
      ...defaults as T,
      fontColor: defaults?.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults?.font !== undefined ? defaults.font as string : 'Roboto',
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : false,
      backgroundColor: defaults?.backgroundColor !== undefined ? defaults.backgroundColor as string : '#d3d3d3'
    };
  }

  static initTextImageLabel(): TextImageLabel {
    return {
      text: '',
      imgSrc: null,
      position: 'above'
    };
  }

  static initPlayerProps(defaults: Record<string, UIElementValue> = {}): PlayerProperties {
    return {
      autostart: defaults.autostart !== undefined ? defaults.autostart as boolean : false,
      autostartDelay: defaults.autostartDelay !== undefined ? defaults.autostartDelay as number : 0,
      loop: defaults.loop !== undefined ? defaults.loop as boolean : false,
      startControl: defaults.startControl !== undefined ? defaults.startControl as boolean : true,
      pauseControl: defaults.pauseControl !== undefined ? defaults.pauseControl as boolean : false,
      progressBar: defaults.progressBar !== undefined ? defaults.progressBar as boolean : true,
      interactiveProgressbar: defaults.interactiveProgressbar !== undefined ?
        defaults.interactiveProgressbar as boolean :
        false,
      volumeControl: defaults.volumeControl !== undefined ? defaults.volumeControl as boolean : true,
      defaultVolume: defaults.defaultVolume !== undefined ? defaults.defaultVolume as number : 0.8,
      minVolume: defaults.minVolume !== undefined ? defaults.minVolume as number : 0,
      muteControl: defaults.muteControl !== undefined ? defaults.muteControl as boolean : true,
      interactiveMuteControl: defaults.interactiveMuteControl !== undefined ?
        defaults.interactiveMuteControl as boolean :
        false,
      hintLabel: defaults.hintLabel !== undefined ? defaults.hintLabel as string : '',
      hintLabelDelay: defaults.hintLabelDelay !== undefined ? defaults.hintLabelDelay as number : 0,
      activeAfterID: defaults.activeAfterID !== undefined ? defaults.activeAfterID as string : '',
      minRuns: defaults.minRuns !== undefined ? defaults.minRuns as number : 1,
      maxRuns: defaults.maxRuns !== undefined ? defaults.maxRuns as number | null : null,
      showRestRuns: defaults.showRestRuns !== undefined ? defaults.showRestRuns as boolean : false,
      showRestTime: defaults.showRestTime !== undefined ? defaults.showRestTime as boolean : true,
      playbackTime: defaults.playbackTime !== undefined ? defaults.playbackTime as number : 0
    };
  }
}

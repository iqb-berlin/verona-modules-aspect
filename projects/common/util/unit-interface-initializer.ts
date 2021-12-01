import {
  FontProperties,
  PlayerProperties,
  PositionProperties,
  SurfaceProperties,
  UIElement
} from '../models/uI-element';

// Properties check is only for backwards compatibility

const DEFAULT_DYNAMIC_POSITIONING = false;

const DEFAULT_FONT_COLOR = '#000000';
const DEFAULT_FONT = 'Roboto';
const DEFAULT_FONT_SIZE = 20;
const DEFAULT_LINE_HEIGHT = 120;
const DEFAULT_BOLD = false;
const DEFAULT_ITALIC = false;
const DEFAULT_UNDERLINE = false;

const DEFAULT_BACKGROUND_COLOR = '#d3d3d3';

export function initPositionedElement(serializedElement: Partial<UIElement>): PositionProperties {
  if (serializedElement.positionProps) {
    return {
      dynamicPositioning: serializedElement.positionProps.dynamicPositioning as boolean || DEFAULT_DYNAMIC_POSITIONING,
      xPosition: serializedElement.positionProps.xPosition !== undefined ?
        serializedElement.positionProps.xPosition as number : 0,
      yPosition: serializedElement.positionProps.yPosition !== undefined ?
        serializedElement.positionProps.yPosition as number : 0,
      useMinHeight: serializedElement.positionProps.useMinHeight !== undefined ?
        serializedElement.positionProps.useMinHeight as boolean : false,
      gridColumnStart: serializedElement.positionProps.gridColumnStart !== undefined ?
        serializedElement.positionProps.gridColumnStart as number : 1,
      gridColumnEnd: serializedElement.positionProps.gridColumnEnd !== undefined ?
        serializedElement.positionProps.gridColumnEnd as number : 2,
      gridRowStart: serializedElement.positionProps.gridRowStart !== undefined ?
        serializedElement.positionProps.gridRowStart as number : 1,
      gridRowEnd: serializedElement.positionProps.gridRowEnd !== undefined ?
        serializedElement.positionProps.gridRowEnd as number : 2,
      marginLeft: serializedElement.positionProps.marginLeft !== undefined ?
        serializedElement.positionProps.marginLeft as number : 0,
      marginRight: serializedElement.positionProps.marginRight !== undefined ?
        serializedElement.positionProps.marginRight as number : 0,
      marginTop: serializedElement.positionProps.marginTop !== undefined ?
        serializedElement.positionProps.marginTop as number : 0,
      marginBottom: serializedElement.positionProps.marginBottom !== undefined ?
        serializedElement.positionProps.marginBottom as number : 0,
      zIndex: serializedElement.positionProps.zIndex !== undefined ?
        serializedElement.positionProps.zIndex as number : 0
    };
  }
  return {
    dynamicPositioning: serializedElement.dynamicPositioning as boolean || DEFAULT_DYNAMIC_POSITIONING,
    xPosition: serializedElement.xPosition !== undefined ? serializedElement.xPosition as number : 0,
    yPosition: serializedElement.yPosition !== undefined ? serializedElement.yPosition as number : 0,
    useMinHeight: serializedElement.useMinHeight !== undefined ? serializedElement.useMinHeight as boolean : false,
    gridColumnStart: serializedElement.gridColumnStart !== undefined ? serializedElement.gridColumnStart as number : 1,
    gridColumnEnd: serializedElement.gridColumnEnd !== undefined ? serializedElement.gridColumnEnd as number : 2,
    gridRowStart: serializedElement.gridRowStart !== undefined ? serializedElement.gridRowStart as number : 1,
    gridRowEnd: serializedElement.gridRowEnd !== undefined ? serializedElement.gridRowEnd as number : 2,
    marginLeft: serializedElement.marginLeft !== undefined ? serializedElement.marginLeft as number : 0,
    marginRight: serializedElement.marginRight !== undefined ? serializedElement.marginRight as number : 0,
    marginTop: serializedElement.marginTop !== undefined ? serializedElement.marginTop as number : 0,
    marginBottom: serializedElement.marginBottom !== undefined ? serializedElement.marginBottom as number : 0,
    zIndex: serializedElement.zIndex !== undefined ? serializedElement.zIndex as number : 0
  };
}

export function initFontElement(serializedElement: Partial<UIElement>): FontProperties {
  if (serializedElement.fontProps) {
    return {
      fontColor: (serializedElement.fontProps as FontProperties).fontColor as string || DEFAULT_FONT_COLOR,
      font: (serializedElement.fontProps as FontProperties).font as string || DEFAULT_FONT,
      fontSize: (serializedElement.fontProps as FontProperties).fontSize !== undefined ?
        serializedElement.fontProps.fontSize as number : DEFAULT_FONT_SIZE,
      lineHeight: (serializedElement.fontProps as FontProperties).lineHeight !== undefined ?
        serializedElement.fontProps.lineHeight as number : DEFAULT_LINE_HEIGHT,
      bold: (serializedElement.fontProps as FontProperties).bold !== undefined ?
        serializedElement.fontProps.bold as boolean : DEFAULT_BOLD,
      italic: (serializedElement.fontProps as FontProperties).italic !== undefined ?
        serializedElement.fontProps.italic as boolean : DEFAULT_ITALIC,
      underline: (serializedElement.fontProps as FontProperties).underline !== undefined ?
        serializedElement.fontProps.underline as boolean : DEFAULT_UNDERLINE
    };
  }
  return {
    fontColor: serializedElement.fontColor as string || DEFAULT_FONT_COLOR,
    font: serializedElement.font as string || DEFAULT_FONT,
    fontSize: serializedElement.fontSize !== undefined ? serializedElement.fontSize as number : DEFAULT_FONT_SIZE,
    lineHeight: serializedElement.lineHeight !== undefined ?
      serializedElement.lineHeight as number : DEFAULT_LINE_HEIGHT,
    bold: serializedElement.bold !== undefined ? serializedElement.bold as boolean : DEFAULT_BOLD,
    italic: serializedElement.italic !== undefined ? serializedElement.italic as boolean : DEFAULT_ITALIC,
    underline: serializedElement.underline !== undefined ? serializedElement.underline as boolean : DEFAULT_UNDERLINE
  };
}

export function initSurfaceElement(serializedElement: Partial<UIElement>): SurfaceProperties {
  if (serializedElement.surfaceProps) {
    return { backgroundColor: serializedElement.surfaceProps.backgroundColor as string || DEFAULT_BACKGROUND_COLOR };
  }
  return { backgroundColor: serializedElement.backgroundColor as string || DEFAULT_BACKGROUND_COLOR };
}

export function initPlayerElement(serializedElement: Partial<UIElement>): PlayerProperties {
  if (serializedElement.playerProps) {
    return {
      autostart: serializedElement.playerProps.autostart !== undefined ?
        serializedElement.playerProps.autostart as boolean : false,
      autostartDelay: serializedElement.playerProps.autostartDelay !== undefined ?
        serializedElement.playerProps.autostartDelay as number : 0,
      loop: serializedElement.playerProps.loop !== undefined ?
        serializedElement.playerProps.loop as boolean : false,
      startControl: serializedElement.playerProps.startControl !== undefined ?
        serializedElement.playerProps.startControl as boolean : true,
      pauseControl: serializedElement.playerProps.pauseControl !== undefined ?
        serializedElement.playerProps.pauseControl as boolean : false,
      progressBar: serializedElement.playerProps.progressBar !== undefined ?
        serializedElement.playerProps.progressBar as boolean : true,
      interactiveProgressbar: serializedElement.playerProps.interactiveProgressbar !== undefined ?
        serializedElement.playerProps.interactiveProgressbar as boolean : false,
      volumeControl: serializedElement.playerProps.volumeControl !== undefined ?
        serializedElement.playerProps.volumeControl as boolean : true,
      defaultVolume: serializedElement.playerProps.defaultVolume !== undefined ?
        serializedElement.playerProps.defaultVolume as number : 0.8,
      minVolume: serializedElement.playerProps.minVolume !== undefined ?
        serializedElement.playerProps.minVolume as number : 0,
      muteControl: serializedElement.playerProps.muteControl !== undefined ?
        serializedElement.playerProps.muteControl as boolean : true,
      interactiveMuteControl:
        serializedElement.playerProps.interactiveMuteControl !== undefined ?
          serializedElement.playerProps.interactiveMuteControl as boolean : false,
      hintLabel: serializedElement.playerProps.hintLabel as string || '',
      hintLabelDelay: serializedElement.playerProps.hintLabelDelay !== undefined ?
        serializedElement.playerProps.hintLabelDelay as number : 0,
      uninterruptible: serializedElement.playerProps.uninterruptible !== undefined ?
        serializedElement.playerProps.uninterruptible as boolean : false,
      hideOtherPages: serializedElement.playerProps.hideOtherPages !== undefined ?
        serializedElement.playerProps.hideOtherPages as boolean : false,
      activeAfterID: serializedElement.playerProps.activeAfterID as string || '',
      minRuns: serializedElement.playerProps.minRuns !== undefined ?
        serializedElement.playerProps.minRuns as number : 1,
      maxRuns: serializedElement.playerProps.maxRuns !== undefined ?
        serializedElement.playerProps.maxRuns as number | null : null,
      showRestRuns: serializedElement.playerProps.showRestRuns !== undefined ?
        serializedElement.playerProps.showRestRuns as boolean : false,
      showRestTime: serializedElement.playerProps.showRestTime !== undefined ?
        serializedElement.playerProps.showRestTime as boolean : true,
      playbackTime: serializedElement.playerProps.playbackTime !== undefined ?
        serializedElement.playerProps.playbackTime as number : 0
    };
  }

  return {
    autostart: serializedElement.autostart !== undefined ? serializedElement.autostart as boolean : false,
    autostartDelay: serializedElement.autostartDelay !== undefined ? serializedElement.autostartDelay as number : 0,
    loop: serializedElement.loop !== undefined ? serializedElement.loop as boolean : false,
    startControl: serializedElement.startControl !== undefined ? serializedElement.startControl as boolean : true,
    pauseControl: serializedElement.pauseControl !== undefined ? serializedElement.pauseControl as boolean : false,
    progressBar: serializedElement.progressBar !== undefined ? serializedElement.progressBar as boolean : true,
    interactiveProgressbar: serializedElement.interactiveProgressbar !== undefined ?
      serializedElement.interactiveProgressbar as boolean : false,
    volumeControl: serializedElement.volumeControl !== undefined ? serializedElement.volumeControl as boolean : true,
    defaultVolume: serializedElement.defaultVolume !== undefined ? serializedElement.defaultVolume as number : 0.8,
    minVolume: serializedElement.minVolume !== undefined ? serializedElement.minVolume as number : 0,
    muteControl: serializedElement.muteControl !== undefined ? serializedElement.muteControl as boolean : true,
    interactiveMuteControl:
      serializedElement.interactiveMuteControl !== undefined ?
        serializedElement.interactiveMuteControl as boolean : true,
    hintLabel: serializedElement.hintLabel as string || '',
    hintLabelDelay: serializedElement.hintLabelDelay !== undefined ? serializedElement.hintLabelDelay as number : 0,
    uninterruptible:
      serializedElement.uninterruptible !== undefined ? serializedElement.uninterruptible as boolean : false,
    hideOtherPages:
      serializedElement.hideOtherPages !== undefined ? serializedElement.hideOtherPages as boolean : false,
    activeAfterID: serializedElement.activeAfterID as string || '',
    minRuns: serializedElement.minRuns !== undefined ? serializedElement.minRuns as number : 1,
    maxRuns: serializedElement.maxRuns !== undefined ? serializedElement.maxRuns as number : null,
    showRestRuns: serializedElement.showRestRuns !== undefined ? serializedElement.showRestRuns as boolean : false,
    showRestTime: serializedElement.showRestTime !== undefined ? serializedElement.showRestTime as boolean : true,
    playbackTime: serializedElement.playbackTime !== undefined ? serializedElement.playbackTime as number : 0
  };
}

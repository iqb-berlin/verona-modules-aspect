import { FontElement, PlayerElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { UIElement } from '../models/uI-element';

export function initFontElement(serializedElement: UIElement): FontElement {
  return {
    fontColor: serializedElement.fontColor as string || '#000000',
    font: serializedElement.font as string || 'Roboto',
    fontSize: serializedElement.fontSize as number || 18,
    lineHeight: serializedElement.lineHeight as number || 120,
    bold: serializedElement.bold !== undefined ? serializedElement.bold as boolean : false,
    italic: serializedElement.italic !== undefined ? serializedElement.italic as boolean : false,
    underline: serializedElement.underline !== undefined ? serializedElement.underline as boolean : false
  };
}

export function initSurfaceElement(serializedElement: UIElement): SurfaceUIElement {
  return { backgroundColor: serializedElement.backgroundColor as string || '#d3d3d3' };
}

export function initPlayerElement(serializedElement: UIElement): PlayerElement {
  return {
    autostart: serializedElement.autostart !== undefined ? serializedElement.autostart as boolean : false,
    autostartDelay: serializedElement.autostartDelay as number || 0,
    loop: serializedElement.loop !== undefined ? serializedElement.loop as boolean : false,
    startControl: serializedElement.startControl !== undefined ? serializedElement.startControl as boolean : true,
    pauseControl: serializedElement.pauseControl !== undefined ? serializedElement.pauseControl as boolean : false,
    progressBar: serializedElement.progressBar !== undefined ? serializedElement.progressBar as boolean : true,
    interactiveProgressbar: serializedElement.interactiveProgressbar !== undefined ?
      serializedElement.interactiveProgressbar as boolean : false,
    volumeControl: serializedElement.volumeControl !== undefined ? serializedElement.volumeControl as boolean : true,
    hintLabel: serializedElement.hintLabel as string || '',
    hintLabelDelay: serializedElement.hintLabelDelay as number || 0,
    uninterruptible:
      serializedElement.uninterruptible !== undefined ? serializedElement.uninterruptible as boolean : false,
    hideOtherPages:
      serializedElement.hideOtherPages !== undefined ? serializedElement.hideOtherPages as boolean : false,
    activeAfterID: serializedElement.activeAfterID as string || '',
    minRuns: serializedElement.minRuns as number || 1,
    maxRuns: serializedElement.maxRuns as number | null || null,
    showRestRuns: serializedElement.showRestRuns !== undefined ? serializedElement.showRestRuns as boolean : false,
    showRestTime: serializedElement.showRestTime !== undefined ? serializedElement.showRestTime as boolean : true,
    playbackTime: serializedElement.playbackTime as number || 0
  };
}

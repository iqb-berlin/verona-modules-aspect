import { FontElement, PlayerElement, SurfaceUIElement } from '../interfaces/UIElementInterfaces';
import { UIElement } from '../models/uI-element';

export function initFontElement(serializedElement: UIElement): FontElement {
  return {
    fontColor: serializedElement.fontColor as string || 'black',
    font: serializedElement.font as string || 'Roboto',
    fontSize: serializedElement.fontSize as number || 18,
    bold: serializedElement.bold as boolean || false,
    italic: serializedElement.italic as boolean || false,
    underline: serializedElement.underline as boolean || false
  };
}

export function initSurfaceElement(serializedElement: UIElement): SurfaceUIElement {
  return { backgroundColor: serializedElement.backgroundColor as string || 'lightgrey' };
}

export function initPlayerElement(serializedElement: UIElement): PlayerElement {
  return {
    autostart: serializedElement.autostart as boolean || false,
    autostartDelay: serializedElement.autostartDelay as number || 0,
    loop: serializedElement.loop as boolean || false,
    startControl: serializedElement.startControl as boolean || true,
    pauseControl: serializedElement.pauseControl as boolean || false,
    stopControl: serializedElement.stopControl as boolean || false,
    progressBar: serializedElement.progressBar as boolean || true,
    interactiveProgressbar: serializedElement.interactiveProgressbar as boolean || false,
    volumeControl: serializedElement.volumeControl as boolean || true,
    hintLabel: serializedElement.hintLabel as string || '',
    hintLabelDelay: serializedElement.hintLabelDelay as number || 0,
    uninterruptible: serializedElement.uninterruptible as boolean || false,
    hideOtherPages: serializedElement.hideOtherPages as boolean || false,
    activeAfter: serializedElement.activeAfter as string || '',
    minRuns: serializedElement.minRuns as number || 1,
    maxRuns: serializedElement.maxRuns as number | null || null,
    showRestRuns: serializedElement.showRestRuns as boolean || true,
    showRestTime: serializedElement.showRestTime as boolean || true
  };
}

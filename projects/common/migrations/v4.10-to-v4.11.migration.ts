/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { UnitTraversalMigration } from './unit-traversal-migration';

export class Migration4m10To4m11 extends UnitTraversalMigration {
  fromVersion = '4.10';
  toVersion = '4.11.0';

  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const newElement = { ...element };

    // 1. Audio Margin Migration (-4px)
    if (element['type'] === 'audio' && newElement['position']) {
      const position = { ...(newElement['position'] as Record<string, unknown>) };
      if (position['marginTop'] && (position['marginTop'] as Record<string, unknown>)['unit'] === 'px') {
        const marginTop = { ...(position['marginTop'] as Record<string, unknown>) };
        marginTop['value'] = (marginTop['value'] as number) - 4;
        position['marginTop'] = marginTop;
      }
      if (position['marginBottom'] && (position['marginBottom'] as Record<string, unknown>)['unit'] === 'px') {
        const marginBottom = { ...(position['marginBottom'] as Record<string, unknown>) };
        marginBottom['value'] = (marginBottom['value'] as number) - 4;
        position['marginBottom'] = marginBottom;
      }
      newElement['position'] = position;
    }

    // 2. Restore/Complete player properties for Player's 'strictInstantiation: true'
    if (['video', 'audio'].includes(element['type'] as string)) {
      const player = { ...(newElement['player'] as Record<string, unknown>) };
      newElement['player'] = {
        loop: player['loop'] ?? false,
        startControl: player['startControl'] ?? true,
        pauseControl: player['pauseControl'] ?? false,
        progressBar: player['progressBar'] ?? true,
        interactiveProgressbar: player['interactiveProgressbar'] ?? false,
        volumeControl: player['volumeControl'] ?? true,
        defaultVolume: player['defaultVolume'] ?? 0.8,
        minVolume: player['minVolume'] ?? 0.2,
        muteControl: player['muteControl'] ?? true,
        interactiveMuteControl: player['interactiveMuteControl'] ?? false,
        showHint: player['showHint'] ?? true,
        hintLabel: player['hintLabel'] ?? 'Bitte starten',
        hintDelay: player['hintDelay'] ?? 5000,
        activeAfterID: player['activeAfterID'] ?? '',
        minRuns: player['minRuns'] ?? 1,
        maxRuns: player['maxRuns'] ?? 1,
        showRestRuns: player['showRestRuns'] ?? false,
        showRestTime: player['showRestTime'] ?? true,
        playbackTime: player['playbackTime'] ?? 0,
        fileName: player['fileName'] ?? '',
        imgSrc: player['imgSrc'] ?? null,
        imgFileName: player['imgFileName'] ?? ''
      };
    }

    // 3. Element specific properties (4.11 additions)
    if (['text-field', 'text-area', 'spell-correct', 'text-field-simple'].includes(element['type'] as string)) {
      newElement['keyStyle'] = element['keyStyle'] ?? 'round';
      newElement['inputAssistanceCustomStyle'] = element['inputAssistanceCustomStyle'] ?? 'medium';
    }

    return newElement;
  }
}

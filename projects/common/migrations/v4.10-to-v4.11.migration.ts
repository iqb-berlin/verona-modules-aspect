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
        position['marginTop'] = Migration4m10To4m11.reduceMargin(position['marginTop'] as Record<string, unknown>);
      }
      if (position['marginBottom'] && (position['marginBottom'] as Record<string, unknown>)['unit'] === 'px') {
        position['marginBottom'] = Migration4m10To4m11
          .reduceMargin(position['marginBottom'] as Record<string, unknown>);
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
        /* The old name too, because this rebuild is what would otherwise lose it: the rename
           `hintLabelDelay -> hintDelay` is a 4.10 change, so a unit below that carries the old one --
           and `PropertyGroupGenerators.sanitizeHintDelay`, which exists to rescue exactly this value,
           only looks when `hintDelay` is undefined. By then this line has set it to 5000 (#1191). */
        hintDelay: player['hintDelay'] ?? player['hintLabelDelay'] ?? 5000,
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

  /* The four pixels the audio element gained in 4.11 are taken off what a unit stored -- but never
     below zero: a margin of 0 came out as -4px, which no version of the element ever meant (#1191).
     A value that is not a number is left alone rather than turned into `NaN`, which would reach the
     player as `NaNpx`; a numeric string still counts, and the step to 4.12 makes a number of it. */
  private static reduceMargin(margin: Record<string, unknown>): Record<string, unknown> {
    const reduced = Number(margin['value']) - 4;
    return Number.isFinite(reduced) ? { ...margin, value: Math.max(0, reduced) } : margin;
  }
}

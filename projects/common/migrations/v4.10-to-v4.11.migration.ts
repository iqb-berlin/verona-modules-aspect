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

    /* Two repairs of the stored group, and nothing else. What stood here rebuilt all 22 of its members
       from a list of `?? default` lines -- work the normalizer does anyway, and does better: it derives
       `showHint` from the hint label instead of defaulting it to true, which is what 4.10 introduced the
       property for. A unit whose label had been emptied to switch the hint off got it switched back on
       here (#1315). */
    if (['video', 'audio'].includes(element['type'] as string) && newElement['player']) {
      newElement['player'] = Migration4m10To4m11.repairPlayer(newElement['player'] as Record<string, unknown>);
    }

    return newElement;
  }

  /** What a step is for, twice over.

     The rename of 4.10: `hintLabelDelay` became `hintDelay`, and a value stored under the old name
     would otherwise be read under a name nothing knows.

     And `null` where a number belongs. Until 2023 the player dialog wrote `null` into the model when a
     number field was cleared, so units carry it. The list of `?? default` lines this replaced caught
     that in passing -- `?? 1` turned a `maxRuns: null` into one run. The normalizer does not: it asks
     `!== undefined`, so the `null` would stay, and the control bar reads it as "no limit" -- a unit that
     could be played once could suddenly be played forever. An emptied field is not a value, so the key
     goes and the normalizer fills it (#1315). */
  private static repairPlayer(player: Record<string, unknown>): Record<string, unknown> {
    const repaired = { ...player };
    if (repaired['hintLabelDelay'] !== undefined) {
      if (repaired['hintDelay'] === undefined) repaired['hintDelay'] = repaired['hintLabelDelay'];
      delete repaired['hintLabelDelay'];
    }
    Object.keys(repaired).forEach(key => {
      if (repaired[key] === null && key !== 'imgSrc') delete repaired[key];
    });
    return repaired;
  }

  /** The four pixels the audio element gained in 4.11 are taken off what a unit stored -- but never
     below zero: a margin of 0 came out as -4px, which no version of the element ever meant (#1191).
     A value that is not a number is left alone rather than turned into `NaN`, which would reach the
     player as `NaNpx`; a numeric string still counts, and the step to 4.12 makes a number of it. */
  private static reduceMargin(margin: Record<string, unknown>): Record<string, unknown> {
    const reduced = Number(margin['value']) - 4;
    return Number.isFinite(reduced) ? { ...margin, value: Math.max(0, reduced) } : margin;
  }
}

import { MigrationManager } from 'common/services/migration-manager';
import { Migration4m10To4m11 } from './v4.10-to-v4.11.migration';

describe('Migration4m10To4m11', () => {
  let migration: Migration4m10To4m11;

  beforeEach(() => {
    migration = new Migration4m10To4m11();
  });

  it('should have correct versions', () => {
    expect(migration.fromVersion).toBe('4.10');
    expect(migration.toVersion).toBe('4.11.0');
  });

  const audioUnit = (element: Record<string, unknown>): Record<string, unknown> => ({
    version: '4.10',
    pages: [{ sections: [{ elements: [{ type: 'audio', ...element }] }] }]
  });
  const audioOf = (result: Record<string, unknown>): Record<string, unknown> => ((
    (result.pages as Record<string, unknown>[])[0].sections as Record<string, unknown>[]
  )[0].elements as Record<string, unknown>[])[0];

  /* A margin of 0 came out as -4px, which no version of the element ever meant (#1191). */
  it('should not subtract a margin below zero', () => {
    const result = audioOf(migration.execute(audioUnit({
      position: { marginTop: { value: 0, unit: 'px' }, marginBottom: { value: 2, unit: 'px' } }
    })));
    const position = result.position as Record<string, unknown>;

    expect((position.marginTop as Record<string, unknown>).value).toBe(0);
    expect((position.marginBottom as Record<string, unknown>).value).toBe(0);
  });

  /* The rename `hintLabelDelay -> hintDelay` is a 4.10 change, so a unit below that carries the old
     name. The rebuild in this step used to write the default over it, which is why the rescue that sat
     in `generatePlayerProps` -- it looked only when `hintDelay` was undefined -- never ran (#1191). */
  it('should keep the delay a unit stored under the old name', () => {
    const result = audioOf(migration.execute(audioUnit({ player: { hintLabelDelay: 2000 } })));

    expect((result.player as Record<string, unknown>).hintDelay).toBe(2000);
  });

  it('should prefer the current name over the old one', () => {
    const result = audioOf(migration.execute(audioUnit({ player: { hintDelay: 1000, hintLabelDelay: 2000 } })));

    expect((result.player as Record<string, unknown>).hintDelay).toBe(1000);
  });

  /* The step renames, it does not fill: what a unit stored under neither name is answered by the
     normalizer at the end of the migration (#1315). Held below, over the whole way. */
  it('should leave a player group that carries neither name alone', () => {
    const result = audioOf(migration.execute(audioUnit({ player: {} })));

    expect(result.player).toEqual({});
  });

  it('should take the old name away once it has been read', () => {
    const result = audioOf(migration.execute(audioUnit({ player: { hintLabelDelay: 2000 } })));

    expect(result.player).toEqual({ hintDelay: 2000 });
  });

  /* Zero is a delay a unit can have stored, and it is what tells `??` from `||`: with the latter both
     of these would come out as the default. */
  it('should keep a delay of zero under either name', () => {
    expect((audioOf(migration.execute(audioUnit({ player: { hintDelay: 0 } }))).player as Record<string, unknown>)
      .hintDelay).toBe(0);
    expect((audioOf(migration.execute(audioUnit({ player: { hintLabelDelay: 0 } }))).player as Record<string, unknown>)
      .hintDelay).toBe(0);
  });

  /* Video carries the same group, so the rename has to hold there too. */
  it('should keep the delay a video stored under the old name', () => {
    const unit = {
      version: '4.10',
      pages: [{ sections: [{ elements: [{ type: 'video', player: { hintLabelDelay: 1500 } }] }] }]
    };

    expect((audioOf(migration.execute(unit)).player as Record<string, unknown>).hintDelay).toBe(1500);
  });

  /* A margin whose value is not a number stays as it is: `NaN` would reach the player as `NaNpx`. */
  it('should leave a margin it cannot subtract from alone', () => {
    const result = audioOf(migration.execute(audioUnit({
      position: { marginTop: { value: 'auto', unit: 'px' } }
    })));

    expect((result.position as Record<string, unknown>).marginTop).toEqual({ value: 'auto', unit: 'px' });
  });

  it('should migrate audio margins by subtracting 4px', () => {
    const unit = {
      version: '4.10',
      pages: [{
        sections: [{
          elements: [{
            type: 'audio',
            position: {
              marginTop: { value: 10, unit: 'px' },
              marginBottom: { value: 20, unit: 'px' }
            }
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const audio = elements[0] as Record<string, unknown>;
    const position = audio.position as Record<string, unknown>;
    const marginTop = position.marginTop as Record<string, unknown>;
    const marginBottom = position.marginBottom as Record<string, unknown>;

    expect(marginTop.value).toBe(6);
    expect(marginBottom.value).toBe(16);
  });

  /* What the step used to fill itself -- the whole player group and the two keyboard properties of
     4.11 -- comes from the normalizer, which fills it for every unit whatever its version. Asked of the
     migration as a whole, so that it stays answered no matter which half answers it (#1315). */
  it('should end up with a complete player group and the keyboard properties of 4.11', () => {
    const migrated = MigrationManager.migrate({
      type: 'aspect-unit-definition',
      version: '4.10',
      pages: [{
        sections: [{
          elements: [
            { type: 'video', id: 'video_1', player: { loop: true, hintLabel: 'Play me' } },
            { type: 'text-field', id: 'text-field_1' }
          ]
        }]
      }]
    }, '4.12.0');
    const elements = migrated.pages[0].sections[0].elements as unknown as Record<string, unknown>[];
    const player = elements[0].player as Record<string, unknown>;

    expect(player.loop).toBe(true);
    expect(player.hintLabel).toBe('Play me');
    expect(player.startControl).toBe(true);
    expect(player.pauseControl).toBe(false);
    expect(player.minRuns).toBe(1);
    expect(elements[1].keyStyle).toBe('round');
    expect(elements[1].inputAssistanceCustomStyle).toBe('medium');
  });

  /* All 22 members, not a sample: this is the claim that made the list of `?? default` lines removable,
     and the values are the ones that list carried. */
  it('should end up with the whole player group a unit stored nothing for', () => {
    const migrated = MigrationManager.migrate({
      type: 'aspect-unit-definition',
      version: '4.10',
      pages: [{ sections: [{ elements: [{ type: 'audio', id: 'audio_1' }] }] }]
    }, '4.12.0');
    const player = (migrated.pages[0].sections[0].elements as unknown as Record<string, unknown>[])[0]
      .player as Record<string, unknown>;

    expect(player).toEqual({
      loop: false,
      startControl: true,
      pauseControl: false,
      progressBar: true,
      interactiveProgressbar: false,
      volumeControl: true,
      defaultVolume: 0.8,
      minVolume: 0.2,
      muteControl: true,
      interactiveMuteControl: false,
      showHint: true,
      hintLabel: 'Bitte starten',
      hintDelay: 5000,
      activeAfterID: '',
      minRuns: 1,
      maxRuns: 1,
      showRestRuns: false,
      showRestTime: true,
      playbackTime: 0,
      fileName: '',
      imgSrc: null,
      imgFileName: ''
    });
  });

  /* Until 2023 the player dialog wrote `null` when a number field was cleared. The list of `?? default`
     lines caught that on the way; the normalizer asks `!== undefined` and would keep it -- and the
     control bar reads `maxRuns: null` as "no limit", so a unit playable once would become playable
     forever (#1315). */
  it('should treat a number a unit stored as null as an empty field', () => {
    const migrated = MigrationManager.migrate({
      type: 'aspect-unit-definition',
      version: '4.9',
      pages: [{
        sections: [{
          elements: [{
            type: 'audio',
            id: 'audio_1',
            player: {
              maxRuns: null, defaultVolume: null, minRuns: null, hintLabelDelay: null, imgSrc: null
            }
          }]
        }]
      }]
    }, '4.12.0');
    const player = (migrated.pages[0].sections[0].elements as unknown as Record<string, unknown>[])[0]
      .player as Record<string, unknown>;

    expect(player.maxRuns).toBe(1);
    expect(player.defaultVolume).toBe(0.8);
    expect(player.minRuns).toBe(1);
    expect(player.hintDelay).toBe(5000);
    /* Not a number and not an empty field: no image is what `null` means here. */
    expect(player.imgSrc).toBeNull();
  });

  /* The reason the group is left to the normalizer: it derives `showHint` from the hint label, which is
     what 4.10 introduced the property for -- an emptied label means the author switched the hint off.
     The step defaulted it to true and switched it back on (#1315). */
  it('should leave the hint of a unit whose label was emptied switched off', () => {
    const migrated = MigrationManager.migrate({
      type: 'aspect-unit-definition',
      version: '4.9',
      pages: [{ sections: [{ elements: [{ type: 'audio', id: 'audio_1', player: { hintLabel: '' } }] }] }]
    }, '4.12.0');
    const player = (migrated.pages[0].sections[0].elements as unknown as Record<string, unknown>[])[0]
      .player as Record<string, unknown>;

    expect(player.showHint).toBe(false);
  });

  /* And the delay stored under the old name survives the whole way, not just the step. */
  it('should carry the delay stored under the old name through the migration', () => {
    const migrated = MigrationManager.migrate({
      type: 'aspect-unit-definition',
      version: '4.9',
      pages: [{ sections: [{ elements: [{ type: 'audio', id: 'audio_1', player: { hintLabelDelay: 2000 } }] }] }]
    }, '4.12.0');
    const player = (migrated.pages[0].sections[0].elements as unknown as Record<string, unknown>[])[0]
      .player as Record<string, unknown>;

    expect(player.hintDelay).toBe(2000);
    expect(player.hintLabelDelay).toBeUndefined();
  });

  it('should bump the unit version to 4.11.0', () => {
    const unit = {
      version: '4.10',
      pages: []
    };
    const result = migration.execute(unit);
    expect(result.version).toBe('4.11.0');
  });
});

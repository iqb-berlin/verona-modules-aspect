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
     name. The rebuild below used to set `hintDelay` to its default before anything could look for it,
     and `sanitizeHintDelay`, which exists for exactly this value, only looks when it is undefined. */
  it('should keep the delay a unit stored under the old name', () => {
    const result = audioOf(migration.execute(audioUnit({ player: { hintLabelDelay: 2000 } })));

    expect((result.player as Record<string, unknown>).hintDelay).toBe(2000);
  });

  it('should prefer the current name over the old one', () => {
    const result = audioOf(migration.execute(audioUnit({ player: { hintDelay: 1000, hintLabelDelay: 2000 } })));

    expect((result.player as Record<string, unknown>).hintDelay).toBe(1000);
  });

  it('should fall back to the default when a unit stored neither', () => {
    const result = audioOf(migration.execute(audioUnit({ player: {} })));

    expect((result.player as Record<string, unknown>).hintDelay).toBe(5000);
  });

  /* Zero is a delay a unit can have stored, and it is what tells `??` from `||`: with the latter both
     of these would come out as the default. */
  it('should keep a delay of zero under either name', () => {
    expect((audioOf(migration.execute(audioUnit({ player: { hintDelay: 0 } }))).player as Record<string, unknown>)
      .hintDelay).toBe(0);
    expect((audioOf(migration.execute(audioUnit({ player: { hintLabelDelay: 0 } }))).player as Record<string, unknown>)
      .hintDelay).toBe(0);
  });

  /* The player group is rebuilt for video as well, and the rescue has to hold there too. */
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

  it('should complete player properties for audio/video elements', () => {
    const unit = {
      version: '4.10',
      pages: [{
        sections: [{
          elements: [{
            type: 'video',
            player: {
              loop: true,
              hintLabel: 'Play me'
            }
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const video = elements[0] as Record<string, unknown>;
    const player = video.player as Record<string, unknown>;

    expect(player.loop).toBe(true);
    expect(player.hintLabel).toBe('Play me');
    // Verify default fills
    expect(player.startControl).toBe(true);
    expect(player.pauseControl).toBe(false);
    expect(player.minRuns).toBe(1);
  });

  it('should add 4.11 specific keyboard properties to text input elements', () => {
    const unit = {
      version: '4.10',
      pages: [{
        sections: [{
          elements: [{
            type: 'text-field'
          }]
        }]
      }]
    };

    const result = migration.execute(unit);
    const pages = result.pages as Record<string, unknown>[];
    const sections = pages[0].sections as Record<string, unknown>[];
    const elements = sections[0].elements as Record<string, unknown>[];
    const textField = elements[0] as Record<string, unknown>;

    expect(textField.keyStyle).toBe('round');
    expect(textField.inputAssistanceCustomStyle).toBe('medium');
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

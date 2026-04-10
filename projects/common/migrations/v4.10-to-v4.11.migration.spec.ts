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

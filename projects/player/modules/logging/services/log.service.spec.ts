import { LogLevel, LogService } from './log.service';

describe('LogService', () => {
  const initialLevel = LogService.level;
  let reached: unknown[][];

  beforeEach(() => {
    reached = [];
    (['error', 'warn', 'info', 'log'] as const).forEach(method => {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => { reached.push([method, ...args]); });
    });
  });

  afterEach(() => {
    LogService.level = initialLevel;
  });

  const cases: [LogLevel, unknown[][]][] = [
    [LogLevel.NONE, []],
    [LogLevel.ERROR, [['error', 'e', 1]]],
    [LogLevel.WARN, [['error', 'e', 1], ['warn', 'w', 2]]],
    [LogLevel.INFO, [['error', 'e', 1], ['warn', 'w', 2], ['info', 'i', 3]]],
    [LogLevel.DEBUG, [['error', 'e', 1], ['warn', 'w', 2], ['info', 'i', 3], ['log', 'd', 4]]]
  ];

  it.each(cases.map(([level, expected]) => [LogLevel[level], level, expected] as const))(
    'should log at level %s only what is at least as severe',
    (_, level, expected) => {
      LogService.level = level;

      LogService.error('e', 1);
      LogService.warn('w', 2);
      LogService.info('i', 3);
      LogService.debug('d', 4);

      expect(reached).toEqual(expected);
    }
  );
});

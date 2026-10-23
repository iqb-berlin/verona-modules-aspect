import { TetfolioBridge, TetfolioBridgeTimings } from 'common/utils/tetfolio-bridge';

const PREFIX = TetfolioBridge.STATE_KEY_PREFIX;

describe('TetfolioBridge.extractStateKeys', () => {
  it('should derive the state key from the tetfoliopage attribute', () => {
    const html = '<div tetfoliopage="tf_1651734"></div>';
    expect(TetfolioBridge.extractStateKeys(html)).toEqual([`${PREFIX}1651734`]);
  });

  it('should accept single quotes and deduplicate repeated pages', () => {
    const html = "<div tetfoliopage='tf_42'></div><span tetfoliopage=\"tf_42\"></span>";
    expect(TetfolioBridge.extractStateKeys(html)).toEqual([`${PREFIX}42`]);
  });

  it('should collect the keys of several pages', () => {
    const html = '<div tetfoliopage="tf_1"></div><div tetfoliopage="tf_2"></div>';
    expect(TetfolioBridge.extractStateKeys(html)).toEqual([`${PREFIX}1`, `${PREFIX}2`]);
  });

  it('should ignore attribute values without a page id after the marker', () => {
    expect(TetfolioBridge.extractStateKeys('<div tetfoliopage="tf_"></div>')).toEqual([]);
  });

  it('should return no keys for HTML without the attribute', () => {
    expect(TetfolioBridge.extractStateKeys('<html><body></body></html>')).toEqual([]);
  });
});

describe('TetfolioBridge.storageScopeOf', () => {
  it('should derive different namespaces for different elements', () => {
    expect(TetfolioBridge.storageScopeOf('tetfolio_1')).not.toBe(TetfolioBridge.storageScopeOf('tetfolio_2'));
  });

  it('should contain the element id', () => {
    expect(TetfolioBridge.storageScopeOf('tetfolio_1')).toContain('tetfolio_1');
  });
});

describe('TetfolioBridge.inject', () => {
  it('should splice the bridge script before the closing body tag', () => {
    const result = TetfolioBridge.inject('<html><body><p>x</p></body></html>', null, 'tetfolio_1');
    const scriptIndex = result.indexOf('<script>');
    const bodyCloseIndex = result.indexOf('</body>');
    expect(scriptIndex).toBeGreaterThan(-1);
    expect(scriptIndex).toBeLessThan(bodyCloseIndex);
  });

  it('should append the bridge script when there is no body tag', () => {
    const result = TetfolioBridge.inject('<p>x</p>', null, 'tetfolio_1');
    expect(result.startsWith('<p>x</p>')).toBe(true);
    expect(result).toContain('<script>');
  });

  it('should scope the script to the state keys found in the HTML', () => {
    const html = '<html><body><div tetfoliopage="tf_77"></div></body></html>';
    const result = TetfolioBridge.inject(html, null, 'tetfolio_1');
    expect(result).toContain(`"${PREFIX}77"`);
  });

  it('should namespace the storage by the element id', () => {
    const result = TetfolioBridge.inject('<html><body></body></html>', null, 'tetfolio_1');
    expect(result).toContain(JSON.stringify(TetfolioBridge.storageScopeOf('tetfolio_1')));
  });

  it('should give two elements with the same experiment different namespaces', () => {
    const html = '<html><body><div tetfoliopage="tf_77"></div></body></html>';
    const first = TetfolioBridge.inject(html, null, 'tetfolio_1');
    const second = TetfolioBridge.inject(html, null, 'tetfolio_2');
    expect(first).toContain(JSON.stringify(TetfolioBridge.storageScopeOf('tetfolio_1')));
    expect(second).toContain(JSON.stringify(TetfolioBridge.storageScopeOf('tetfolio_2')));
    expect(second).not.toContain(JSON.stringify(TetfolioBridge.storageScopeOf('tetfolio_1')));
  });

  it('should embed the saved state for seeding when one is given', () => {
    const savedState = JSON.stringify({ [`${PREFIX}77`]: 'line1' });
    const result = TetfolioBridge.inject('<html><body></body></html>', savedState, 'tetfolio_1');
    expect(result).toContain(JSON.stringify(savedState));
  });

  it('should not contain a seeding block without a saved state', () => {
    const result = TetfolioBridge.inject('<html><body></body></html>', null, 'tetfolio_1');
    expect(result).not.toContain('seededState');
  });

  it('should keep a closing script tag in the saved state from ending the bridge script', () => {
    const savedState = JSON.stringify({ [`${PREFIX}77`]: 'a</script><p id="injected">x</p>' });
    const result = TetfolioBridge.inject('<html><body></body></html>', savedState, 'tetfolio_1');
    const doc = new DOMParser().parseFromString(result, 'text/html');
    expect(doc.getElementById('injected')).toBeNull();
    expect(doc.scripts).toHaveLength(1);
    expect(doc.scripts[0].textContent).toContain('injected');
  });
});

/**
 * Runtime tests: the injected script actually executes here. Vitest browser mode runs in a real
 * Chromium page, so a srcdoc iframe behaves exactly as in the player (same origin, no sandbox).
 * A minimal stub stands in for tet.folio's logger: it reacts to postMessage commands with
 * sessionStorage calls, and its variants register `window.ibe_logger_restore` in different ways.
 * Real timers with shrunken windows - fakeAsync cannot reach into another frame's realm.
 */
describe('TetfolioBridge runtime', () => {
  /** Small enough for fast tests, large enough that postMessage round-trips fit inside. */
  const FAST: TetfolioBridgeTimings = {
    restoreDelayMs: 50, replayMarginMs: 300, initSettleMs: 200, reportDebounceMs: 10
  };

  interface BridgeMessage {
    type: string;
    state?: string;
    height?: number;
    width?: number;
    key?: string;
    value?: string | null;
  }

  class BridgeHarness {
    readonly messages: BridgeMessage[] = [];
    private readonly iframe: HTMLIFrameElement;
    private readonly listener: (event: MessageEvent) => void;

    constructor(html: string, savedState: string | null, elementId: string) {
      this.iframe = document.createElement('iframe');
      this.listener = (event: MessageEvent) => {
        if (event.source === this.iframe.contentWindow &&
            event.data && typeof event.data.type === 'string') {
          this.messages.push(event.data as BridgeMessage);
        }
      };
      window.addEventListener('message', this.listener);
      this.iframe.srcdoc = TetfolioBridge.inject(html, savedState, elementId, FAST);
      document.body.appendChild(this.iframe);
    }

    command(data: Record<string, unknown>): void {
      this.iframe.contentWindow?.postMessage(data, '*');
    }

    /** Lays the frame out at another width, as the host does when it scales the experiment. */
    resize(width: number): void {
      this.iframe.style.width = `${width}px`;
    }

    get frameDocument(): Document {
      return this.iframe.contentDocument as Document;
    }

    ofType(type: string): BridgeMessage[] {
      return this.messages.filter(message => message.type === type);
    }

    dispose(): void {
      window.removeEventListener('message', this.listener);
      this.iframe.remove();
    }
  }

  /**
   * How the stub registers its restore:
   * - 'none': not at all
   * - 'onLoad': on 'load', after the bridge ran - when the real logger registers too (its script
   *   is a `sebscript` that tet.folio evaluates on init)
   * - 'atParse': in a script before the bridge, which the bridge's shim has to take over
   * - 'throwing': on 'load', with a restore that throws
   */
  type RestoreVariant = 'none' | 'onLoad' | 'atParse' | 'throwing';

  const stubExperimentHtml = (restore: RestoreVariant): string => {
    const restoreFunction = restore === 'throwing' ?
      "function () { parent.postMessage({ type: 'stubRestoreRan' }, '*'); throw new Error('replay broke'); }" :
      "function () { parent.postMessage({ type: 'stubRestoreRan' }, '*'); }";
    const registerAtParse = restore === 'atParse' ?
      `<script>window.ibe_logger_restore = ${restoreFunction};</script>` : '';
    const registerOnLoad = restore === 'onLoad' || restore === 'throwing' ?
      `window.addEventListener('load', function () {
        window.ibe_logger_restore = ${restoreFunction};
        parent.postMessage({ type: 'stubRestoreRegistered' }, '*');
      });` : '';
    return `<!doctype html><html><body>
    <div tetfoliopage="tf_77"></div><div tetfoliopage="tf_88"></div>
    <div style="height: 400px"></div>
    ${registerAtParse}
    <script>
      window.addEventListener('message', function (event) {
        var cmd = event.data || {};
        if (cmd.op === 'set') sessionStorage.setItem(cmd.key, cmd.value);
        if (cmd.op === 'get') {
          parent.postMessage({ type: 'stubValue', key: cmd.key, value: sessionStorage.getItem(cmd.key) }, '*');
        }
        if (cmd.op === 'callRestore') window.ibe_logger_restore();
      });
      ${registerOnLoad}
      parent.postMessage({ type: 'stubReady' }, '*');
    </script>
  </body></html>`;
  };

  const harnesses: BridgeHarness[] = [];

  const makeHarness = (html: string, savedState: string | null, elementId: string): BridgeHarness => {
    const harness = new BridgeHarness(html, savedState, elementId);
    harnesses.push(harness);
    return harness;
  };

  const sleep = (ms: number): Promise<void> => new Promise(resolve => { setTimeout(resolve, ms); });

  const waitFor = async (predicate: () => boolean, timeoutMs = 4000): Promise<void> => {
    const start = Date.now();
    while (!predicate()) {
      if (Date.now() - start > timeoutMs) throw new Error('waitFor timed out');
      // eslint-disable-next-line no-await-in-loop
      await sleep(10);
    }
  };

  const reportedStates = (harness: BridgeHarness): Record<string, string>[] => harness
    .ofType('tetfolioStateChanged')
    .map(message => JSON.parse(message.state as string));

  const lastReportedState = (harness: BridgeHarness): Record<string, string> => reportedStates(harness)
    .slice(-1)[0];

  afterEach(() => {
    harnesses.forEach(harness => harness.dispose());
    harnesses.length = 0;
    const stale: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith('tetfolio:')) stale.push(key);
    }
    stale.forEach(key => window.sessionStorage.removeItem(key));
  });

  it('should seed the saved state where the experiment reads it', async () => {
    const savedState = JSON.stringify({ 'ibe_logger-77': 'line1' });
    const harness = makeHarness(stubExperimentHtml('none'), savedState, 'el_1');
    await waitFor(() => harness.ofType('stubReady').length > 0);
    harness.command({ op: 'get', key: 'ibe_logger-77' });
    await waitFor(() => harness.ofType('stubValue').length > 0);
    expect(harness.ofType('stubValue')[0].value).toBe('line1');
  });

  it('should seed a saved state that contains a closing script tag', async () => {
    const savedState = JSON.stringify({ 'ibe_logger-77': 'a</script><p>b' });
    const harness = makeHarness(stubExperimentHtml('none'), savedState, 'el_1');
    await waitFor(() => harness.ofType('stubReady').length > 0);
    harness.command({ op: 'get', key: 'ibe_logger-77' });
    await waitFor(() => harness.ofType('stubValue').length > 0);
    expect(harness.ofType('stubValue')[0].value).toBe('a</script><p>b');
    await waitFor(() => harness.ofType('tetfolioReady').length > 0);
  });

  it('should suppress reports until the settle window, then report the full state', async () => {
    const harness = makeHarness(stubExperimentHtml('none'), null, 'el_1');
    await waitFor(() => harness.ofType('stubReady').length > 0);
    harness.command({ op: 'set', key: 'ibe_logger-77', value: 'early' });
    await sleep(100);
    expect(harness.ofType('tetfolioStateChanged')).toHaveLength(0);
    expect(harness.ofType('tetfolioReady')).toHaveLength(0);
    await sleep(200);
    expect(harness.ofType('tetfolioReady')).toHaveLength(1);
    harness.command({ op: 'set', key: 'ibe_logger-88', value: 'late' });
    await waitFor(() => reportedStates(harness).some(state => state['ibe_logger-88'] === 'late'));
    expect(lastReportedState(harness)).toEqual({ 'ibe_logger-77': 'early', 'ibe_logger-88': 'late' });
  }, 10000);

  it('should report input made before the settle window without waiting for another change', async () => {
    const harness = makeHarness(stubExperimentHtml('none'), null, 'el_1');
    await waitFor(() => harness.ofType('stubReady').length > 0);
    harness.command({ op: 'set', key: 'ibe_logger-77', value: 'only-click' });
    await waitFor(() => harness.ofType('tetfolioStateChanged').length > 0);
    expect(lastReportedState(harness)).toEqual({ 'ibe_logger-77': 'only-click' });
  }, 10000);

  it('should not report a restored state the host already has', async () => {
    const savedState = JSON.stringify({ 'ibe_logger-77': 'line1' });
    const harness = makeHarness(stubExperimentHtml('none'), savedState, 'el_1');
    await waitFor(() => harness.ofType('tetfolioReady').length > 0);
    await sleep(50);
    expect(harness.ofType('tetfolioStateChanged')).toHaveLength(0);
  }, 10000);

  it('should revert input made during the replay window and capture again afterwards', async () => {
    const savedState = JSON.stringify({ 'ibe_logger-77': 'line1' });
    const harness = makeHarness(stubExperimentHtml('onLoad'), savedState, 'el_1');
    await waitFor(() => harness.ofType('stubRestoreRegistered').length > 0);
    harness.command({ op: 'callRestore' });
    await waitFor(() => harness.ofType('stubRestoreRan').length > 0);
    // Inside the replay window (replayMarginMs wide): indistinguishable from a replay echo.
    harness.command({ op: 'set', key: 'ibe_logger-77', value: 'user-input-during-replay' });
    expect(harness.ofType('tetfolioReady')).toHaveLength(0);
    await sleep(500);
    // Ready only once the replay window has closed - the overlay must outlast the replay.
    expect(harness.ofType('tetfolioReady')).toHaveLength(1);
    harness.command({ op: 'get', key: 'ibe_logger-77' });
    await waitFor(() => harness.ofType('stubValue').length > 0);
    expect(harness.ofType('stubValue')[0].value).toBe('line1');
    harness.command({ op: 'set', key: 'ibe_logger-77', value: 'after-replay' });
    await waitFor(() => harness.ofType('tetfolioStateChanged').length > 0);
    expect(lastReportedState(harness)).toEqual({ 'ibe_logger-77': 'after-replay' });
  }, 10000);

  it('should end the replay window and capture again when the replay throws', async () => {
    const savedState = JSON.stringify({ 'ibe_logger-77': 'line1' });
    const harness = makeHarness(stubExperimentHtml('throwing'), savedState, 'el_1');
    await waitFor(() => harness.ofType('stubRestoreRegistered').length > 0);
    harness.command({ op: 'callRestore' });
    await waitFor(() => harness.ofType('stubRestoreRan').length > 0);
    await waitFor(() => harness.ofType('tetfolioReady').length > 0);
    harness.command({ op: 'set', key: 'ibe_logger-77', value: 'after-broken-replay' });
    await waitFor(() => harness.ofType('tetfolioStateChanged').length > 0);
    expect(lastReportedState(harness)).toEqual({ 'ibe_logger-77': 'after-broken-replay' });
  }, 10000);

  it('should take over a restore the experiment registered before the bridge ran', async () => {
    const harness = makeHarness(stubExperimentHtml('atParse'), null, 'el_1');
    await waitFor(() => harness.ofType('stubReady').length > 0);
    harness.command({ op: 'callRestore' });
    await waitFor(() => harness.ofType('stubRestoreRan').length > 0);
    expect(harness.ofType('stubRestoreRan')).toHaveLength(1);
  }, 10000);

  it('should keep two elements with the same experiment isolated', async () => {
    const html = stubExperimentHtml('none');
    const first = makeHarness(html, null, 'el_1');
    const second = makeHarness(html, null, 'el_2');
    await waitFor(() => first.ofType('stubReady').length > 0 && second.ofType('stubReady').length > 0);
    await sleep(300);
    first.command({ op: 'set', key: 'ibe_logger-77', value: 'A' });
    await waitFor(() => first.ofType('tetfolioStateChanged').length > 0);
    expect(lastReportedState(first)).toEqual({ 'ibe_logger-77': 'A' });
    second.command({ op: 'get', key: 'ibe_logger-77' });
    await waitFor(() => second.ofType('stubValue').length > 0);
    expect(second.ofType('stubValue')[0].value).toBeNull();
    expect(second.ofType('tetfolioStateChanged')).toHaveLength(0);
  }, 10000);

  it('should report the content height after load', async () => {
    const harness = makeHarness(stubExperimentHtml('none'), null, 'el_1');
    await waitFor(() => harness.ofType('tetfolioResize')
      .some(message => (message.height ?? 0) >= 400));
    expect(harness.ofType('tetfolioResize').slice(-1)[0].height).toBeGreaterThanOrEqual(400);
  });

  describe('content width', () => {
    /**
     * A page laid out like a tet.folio export: `#mainPane` is a child of the body, centred by auto
     * margins and shifted by a relative offset, and the experiment inside it reaches past its right
     * edge. No scrollbars, so the body's chrome is 0 and the numbers stay the page's own.
     */
    const pageHtml = (pane: string, content: string): string => `<!doctype html><html>
      <head><style>html, body { margin: 0; overflow: hidden; }</style></head>
      <body>${pane.replace('%CONTENT%', content)}</body></html>`;
    const centredPane = '<div id="mainPane" style="position: relative; left: -20px; width: 600px; ' +
      'height: 100px; margin: 0 auto">%CONTENT%</div>';
    const wideExperiment = '<div style="width: 700px; height: 50px"></div>';

    const reports = (harness: BridgeHarness): number => harness.ofType('tetfolioResize').length;

    const lastWidth = (harness: BridgeHarness): number | undefined => harness
      .ofType('tetfolioResize').slice(-1)[0]?.width;

    /** The frame is laid out at `width` before its document loads; the first report measures that. */
    const startAt = async (html: string, width: number): Promise<BridgeHarness> => {
      const harness = makeHarness(html, null, 'el_1');
      harness.resize(width);
      await waitFor(() => reports(harness) > 0);
      return harness;
    };

    /** The width the page reports once the frame has been laid out at `width` - a report made after
       the change, not one left over from before it. */
    const widthAfterResize = async (harness: BridgeHarness, width: number): Promise<number | undefined> => {
      const before = reports(harness);
      harness.resize(width);
      await waitFor(() => reports(harness) > before);
      return lastWidth(harness);
    };

    /* Centred, the page needs its overhang on both sides: the 700px experiment starts 20px left of
       the page's unshifted box, so it ends 80px right of it - 600 + 2 * 80. */
    it('should report the width at which a centred page shows its content uncut', async () => {
      const harness = await startAt(pageHtml(centredPane, wideExperiment), 400);
      expect(lastWidth(harness)).toBe(760);
    });

    it('should report the same width whatever width the frame is laid out at', async () => {
      const harness = await startAt(pageHtml(centredPane, wideExperiment), 400);
      expect(await widthAfterResize(harness, 1200)).toBe(760);
      expect(await widthAfterResize(harness, 760)).toBe(760);
    });

    it('should show the centred page uncut at the reported width', async () => {
      const harness = await startAt(pageHtml(centredPane, wideExperiment), 400);
      const width = lastWidth(harness) as number;
      await widthAfterResize(harness, width);
      const pane = harness.frameDocument.getElementById('mainPane') as HTMLElement;
      const experiment = pane.firstElementChild as HTMLElement;
      const rect = experiment.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width);
    });

    /* Only a frame wider than the page shows whether its margins centre it; narrower, the page is
       taken as centred, which asks for more than it needs - laid out at that, it reports its own. */
    it('should report a page that is not centred by its overhang on the right only', async () => {
      const leftPane = '<div id="mainPane" style="width: 500px; height: 100px">%CONTENT%</div>';
      const harness = await startAt(pageHtml(leftPane, '<div style="width: 650px; height: 50px"></div>'), 400);
      expect(lastWidth(harness)).toBe(800);
      expect(await widthAfterResize(harness, 800)).toBe(650);
      expect(await widthAfterResize(harness, 650)).toBe(650);
    });

    /* Only the overhang of the experiment counts: 640 is the page with its 20px shift on both sides. */
    it('should leave out what a box inside the page clips', async () => {
      const clipped = '<div style="width: 300px; overflow: hidden">' +
        '<div style="width: 2000px; height: 10px"></div></div>';
      const harness = await startAt(pageHtml(centredPane, clipped), 400);
      expect(lastWidth(harness)).toBe(640);
    });

    it('should leave out invisible content, such as hidden measuring boxes', async () => {
      const hidden = '<div style="visibility: hidden; position: absolute; left: 0; width: 3000px; height: 10px"></div>';
      const harness = await startAt(pageHtml(centredPane, hidden), 400);
      expect(lastWidth(harness)).toBe(640);
    });

    it('should take the body as the page without a #mainPane, and content wider than it', async () => {
      const wideContent = '<div style="width: 900px; height: 50px"></div>';
      const harness = await startAt(pageHtml('%CONTENT%', wideContent), 400);
      expect(lastWidth(harness)).toBe(900);
    });

    /* Content that follows the frame never asks for more than the frame has, so it is never scaled. */
    it('should report the frame\'s own width for content that fills it', async () => {
      const harness = await startAt(pageHtml('%CONTENT%', '<p>flowing text</p>'), 400);
      expect(lastWidth(harness)).toBe(400);
    });
  });
});

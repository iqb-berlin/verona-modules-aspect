/**
 * Overrides for the bridge's timing windows. Production uses the constants on `TetfolioBridge`;
 * the runtime specs shrink the windows so the suppression, replay and settle behavior can be
 * exercised in milliseconds instead of seconds.
 */
export interface TetfolioBridgeTimings {
  restoreDelayMs?: number;
  replayMarginMs?: number;
  initSettleMs?: number;
  reportDebounceMs?: number;
}

/**
 * The script spliced into a packed tet.folio document, which connects the experiment inside the
 * iframe to the hosting `TetfolioComponent`.
 *
 * Tetfolio units are rendered as self-contained HTML (produced by the `Distpacker`) inside a
 * srcdoc iframe. The bridge is spliced into that HTML string before the iframe is created - the
 * same string-level technique the distpacker itself uses. This class owns everything about that
 * script; the component only calls `TetfolioBridge.inject()`.
 *
 * A srcdoc iframe shares the parent's origin, so every tetfolio element in a tab writes into ONE
 * sessionStorage. The bridge therefore namespaces the experiment's state keys per element: what
 * the experiment reads and writes under `ibe_logger-<pageId>` physically lands under
 * `<element scope>ibe_logger-<pageId>` (see `storageScopeOf`), rewritten transparently in the
 * setItem/getItem/removeItem patches. Two elements - even two copies of the SAME experiment, whose
 * pageId-derived key names are identical - can then never clear or overwrite each other's state.
 * The reported state and the seeded state keep the RAW key names, so stored states are
 * independent of the element id and survive duplication.
 *
 * Messages to the host: `tetfolioResize` (document height), `tetfolioStateChanged` (the captured
 * state) and `tetfolioReady`, posted once capture becomes active - i.e. the moment the seeded state
 * is final, which is when the host lifts its restore overlay. When capture starts with a state that
 * differs from the last one the host knows - input made before it, on a first visit - that state
 * is reported right away instead of waiting for the next change.
 *
 * Accepted tradeoff, by design: while a restore replays the seeded state, capture is suppressed and
 * the replay window ends with `reseed(basis)` - because the replay's own storage writes ("echoes")
 * are indistinguishable from user input, input made during that window is overwritten along with
 * them. The runtime specs pin this behavior.
 *
 * Why the iframe is not sandboxed: `sandbox="allow-scripts"` gives the document an opaque origin -
 * and a NESTED iframe inside it gets an opaque origin OF ITS OWN (verified in Chromium 2026-09:
 * parent-child `contentWindow` access throws SecurityError in both directions). Tet.folio exports
 * load the experiment as a nested page and the outer page reaches into its `contentWindow` (see
 * `replaceIframes()` in the distpacker), so a sandboxed tetfolio element would break every such
 * export. What the content can reach instead is described in docs/tetfolio-element.md.
 */
export class TetfolioBridge {
  /**
   * Session storage key prefix for experiment state. The pageId comes from the static
   * `tetfoliopage="tf_<pageId>"` attribute. Framework keys like 'tet_cssTransform*' are
   * intentionally not captured.
   */
  static readonly STATE_KEY_PREFIX = 'ibe_logger-';

  /** Delay for the experiment's own state replay (see class docs). */
  static readonly RESTORE_DELAY_MS = 1500;

  /** Extra margin after the computed replay duration (see class docs). */
  static readonly REPLAY_MARGIN_MS = 1500;

  /** Fallback: enable capture if no restore happens (see class docs). */
  static readonly INIT_SETTLE_MS = 4000;

  /** Debounce for reporting a state change to the host component. */
  static readonly REPORT_DEBOUNCE_MS = 300;

  /**
   * Splice the bridge script into the packed unit HTML, scoped to the element's own state keys and
   * storage namespace (see class docs) and optionally seeding a saved state. `timings` is for tests
   * only.
   */
  static inject(
    html: string, savedState: string | null, elementId: string, timings?: TetfolioBridgeTimings
  ): string {
    const stateKeys = TetfolioBridge.extractStateKeys(html);
    const bridge = TetfolioBridge.buildScript(savedState, stateKeys, elementId, timings);
    const idx = html.lastIndexOf('</body>');
    if (idx !== -1) {
      return html.substring(0, idx) + bridge + html.substring(idx);
    }
    return html + bridge;
  }

  /**
   * The per-element namespace prepended to every state key in the tab's shared sessionStorage.
   * Derived from the element id, which is unique within a unit - unlike the experiment's pageId,
   * which is identical for two copies of the same export.
   */
  static storageScopeOf(elementId: string): string {
    return `tetfolio:${elementId}::`;
  }

  /**
   * Extract the element's own state keys from the packed HTML. They scope the capture to
   * experiment state (framework keys stay untouched); the cross-element isolation itself comes from
   * the element-id namespace.
   */
  static extractStateKeys(htmlContent: string): string[] {
    const keys: string[] = [];
    // Mirror the logger exactly: it derives the pageId from the attribute value as
    // value.substring(3) (dropping the leading 'tf_' marker), whatever characters follow.
    // Accept both quote styles.
    const regex = /tetfoliopage=["']([^"']+)["']/gi;
    let match = regex.exec(htmlContent);
    while (match !== null) {
      const pageAttribute = match[1];
      if (pageAttribute.length > 3) {
        const key = TetfolioBridge.STATE_KEY_PREFIX + pageAttribute.substring(3);
        if (!keys.includes(key)) keys.push(key);
      }
      match = regex.exec(htmlContent);
    }
    return keys;
  }

  /**
   * A value as a JavaScript literal that is safe inside an inline `<script>`. `JSON.stringify`
   * leaves `<` as it is, so a `</script>` in the value - in a saved state the host hands back, say -
   * would end the script in the middle of the string. As `<` it means the same to JavaScript
   * and nothing to the HTML parser.
   */
  private static scriptLiteral(value: unknown): string {
    return JSON.stringify(value).replace(/</g, '\\u003c');
  }

  private static buildScript(
    savedState: string | null, stateKeys: string[], elementId: string, timings?: TetfolioBridgeTimings
  ): string {
    const keys = TetfolioBridge.scriptLiteral(stateKeys);
    const prefix = TetfolioBridge.scriptLiteral(TetfolioBridge.STATE_KEY_PREFIX);
    const scope = TetfolioBridge.scriptLiteral(TetfolioBridge.storageScopeOf(elementId));
    const restoreDelayMs = timings?.restoreDelayMs ?? TetfolioBridge.RESTORE_DELAY_MS;
    const replayMarginMs = timings?.replayMarginMs ?? TetfolioBridge.REPLAY_MARGIN_MS;
    const initSettleMs = timings?.initSettleMs ?? TetfolioBridge.INIT_SETTLE_MS;
    const reportDebounceMs = timings?.reportDebounceMs ?? TetfolioBridge.REPORT_DEBOUNCE_MS;
    // Seed the saved state synchronously at document parse time, so it is guaranteed to be
    // present before the experiment's own autoRestore() (which waits for inner-iframe load +
    // tet:afterinit) reads it. The saved state carries raw key names; they are scoped on the way in.
    const seed = savedState ? `
  try {
    var seededState = ${TetfolioBridge.scriptLiteral(savedState)};
    var parsedState = JSON.parse(seededState);
    for (var seedKey in parsedState) {
      if (Object.prototype.hasOwnProperty.call(parsedState, seedKey) && matchesKey(seedKey)) {
        seededSnapshot[seedKey] = parsedState[seedKey];
        origSetItem.call(window.sessionStorage, scoped(seedKey), parsedState[seedKey]);
      }
    }
  } catch (e) { console.warn('tetfolio-bridge: state seeding failed', e); }
` : '';
    return `<script>
(function() {
  var STATE_KEYS = ${keys};
  var STATE_KEY_PREFIX = ${prefix};
  var SCOPE_PREFIX = ${scope};
  var RESTORE_DELAY_MS = ${restoreDelayMs};
  var REPLAY_MARGIN_MS = ${replayMarginMs};
  var INIT_SETTLE_MS = ${initSettleMs};
  function matchesKey(key) {
    if (STATE_KEYS.length > 0) return STATE_KEYS.indexOf(String(key)) >= 0;
    return String(key).indexOf(STATE_KEY_PREFIX) === 0;
  }
  // The experiment addresses its keys by their raw names; physically they are
  // stored under the element's own namespace, so a second element in the same
  // tab - even one showing the same experiment - reads and writes elsewhere.
  // The rewrite covers the method calls the logger is known to use; an
  // experiment that ENUMERATED sessionStorage to find its keys would not see
  // them, but the logger derives its key from the pageId and reads it
  // directly.
  function scoped(key) { return SCOPE_PREFIX + key; }
  var origSetItem = Storage.prototype.setItem;
  var origGetItem = Storage.prototype.getItem;
  var origRemoveItem = Storage.prototype.removeItem;
  var seededSnapshot = {};
  // Clear own keys BEFORE seeding: sessionStorage is per-tab and survives
  // logout/login on a shared device, so leftover state from a previous
  // user must never become this session's starting point. After this,
  // the state persisted by the host is the single source of truth.
  // Only keys inside this element's namespace are touched.
  try {
    var staleKeys = [];
    for (var si = 0; si < window.sessionStorage.length; si++) {
      var staleKey = window.sessionStorage.key(si);
      if (staleKey && staleKey.indexOf(SCOPE_PREFIX) === 0 &&
          matchesKey(staleKey.substring(SCOPE_PREFIX.length))) {
        staleKeys.push(staleKey);
      }
    }
    for (var sj = 0; sj < staleKeys.length; sj++) {
      origRemoveItem.call(window.sessionStorage, staleKeys[sj]);
    }
  } catch (e) { console.warn('tetfolio-bridge: state clearing failed', e); }
${seed}
  var captureSuppressed = true;
  var restoreStarted = false;
  var firstRestore = true;
  // The state the host last heard of: the seeded one until the first report.
  var reportedSnapshot = seededSnapshot;
  function reseed(snapshot) {
    for (var key in snapshot) {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        origSetItem.call(window.sessionStorage, scoped(key), snapshot[key]);
      }
    }
  }
  function hasKeys(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return true;
    }
    return false;
  }
  function sameState(a, b) {
    var key;
    for (key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key) && a[key] !== b[key]) return false;
    }
    for (key in b) {
      if (Object.prototype.hasOwnProperty.call(b, key) && !Object.prototype.hasOwnProperty.call(a, key)) return false;
    }
    return true;
  }
  // Raw key names in, raw key names out - the scope stays a storage detail.
  function collectStateRaw() {
    var state = {};
    var value;
    if (STATE_KEYS.length > 0) {
      for (var i = 0; i < STATE_KEYS.length; i++) {
        value = origGetItem.call(window.sessionStorage, scoped(STATE_KEYS[i]));
        if (value !== null) state[STATE_KEYS[i]] = value;
      }
    } else {
      for (var j = 0; j < window.sessionStorage.length; j++) {
        var key = window.sessionStorage.key(j);
        if (key && key.indexOf(SCOPE_PREFIX) === 0 &&
            matchesKey(key.substring(SCOPE_PREFIX.length))) {
          state[key.substring(SCOPE_PREFIX.length)] =
            origGetItem.call(window.sessionStorage, key);
        }
      }
    }
    return state;
  }
  function countStateLines(state) {
    var n = 0;
    for (var key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        n += state[key].split('\\n').length;
      }
    }
    return n;
  }
  // The state is final from here on. Input made before - while capture was
  // still suppressed on a first visit - is reported now rather than with the
  // next change, which might never come.
  function startCapture() {
    captureSuppressed = false;
    if (!sameState(collectStateRaw(), reportedSnapshot)) reportStateDebounced();
    reportReady();
  }
  try {
    // Kept if the experiment registered its restore before the bridge ran.
    var realRestore = typeof window.ibe_logger_restore === 'function' ? window.ibe_logger_restore : null;
    var delayedRestore = function () {
      var args = arguments;
      restoreStarted = true;
      setTimeout(function () {
        if (!realRestore) return;
        // Between seeding and this point, page-load animations were
        // re-logged and auto-saved over the true state (init pollution).
        // For the first (auto) restore, re-assert the seeded state so the
        // replay processes the true state; later manual restores operate
        // on current storage (which may contain newer interactions).
        var basis;
        if (firstRestore && hasKeys(seededSnapshot)) {
          reseed(seededSnapshot);
          basis = seededSnapshot;
        } else {
          basis = collectStateRaw();
        }
        firstRestore = false;
        var replayWindowMs = countStateLines(basis) * 10 + REPLAY_MARGIN_MS;
        captureSuppressed = true;
        // Scheduled before the replay starts, so that a replay that throws
        // still ends the window instead of suppressing capture for good.
        setTimeout(function () {
          reseed(basis);
          startCapture();
        }, replayWindowMs);
        try {
          realRestore.apply(window, args);
        } catch (e) { console.warn('tetfolio-bridge: restore failed', e); }
      }, RESTORE_DELAY_MS);
    };
    Object.defineProperty(window, 'ibe_logger_restore', {
      configurable: true,
      get: function () { return realRestore ? delayedRestore : undefined; },
      set: function (fn) { realRestore = fn; }
    });
  } catch (e) { console.warn('tetfolio-bridge: restore delay shim failed', e); }
  // If no restore happens (autoSaveRestore unchecked or nothing saved),
  // undo any init pollution once and start capturing.
  setTimeout(function () {
    if (restoreStarted) return;
    if (hasKeys(seededSnapshot)) reseed(seededSnapshot);
    startCapture();
  }, INIT_SETTLE_MS);
  function reportReady() {
    window.parent.postMessage({ type: 'tetfolioReady' }, '*');
  }
  var stateReportTimer = null;
  function reportStateDebounced() {
    if (stateReportTimer) clearTimeout(stateReportTimer);
    stateReportTimer = setTimeout(function() {
      reportedSnapshot = collectStateRaw();
      window.parent.postMessage({
        type: 'tetfolioStateChanged',
        state: JSON.stringify(reportedSnapshot)
      }, '*');
    }, ${reportDebounceMs});
  }
  Storage.prototype.setItem = function(key, value) {
    if (this === window.sessionStorage && matchesKey(key)) {
      origSetItem.call(this, scoped(key), value);
      if (!captureSuppressed) reportStateDebounced();
    } else {
      origSetItem.apply(this, arguments);
    }
  };
  Storage.prototype.getItem = function(key) {
    if (this === window.sessionStorage && matchesKey(key)) {
      return origGetItem.call(this, scoped(key));
    }
    return origGetItem.apply(this, arguments);
  };
  Storage.prototype.removeItem = function(key) {
    if (this === window.sessionStorage && matchesKey(key)) {
      origRemoveItem.call(this, scoped(key));
      if (!captureSuppressed) reportStateDebounced();
    } else {
      origRemoveItem.apply(this, arguments);
    }
  };
  function reportSize() {
    var body = document.body;
    var h = Math.max(body.scrollHeight, body.offsetHeight);
    window.parent.postMessage({ type: 'tetfolioResize', height: h }, '*');
  }
  if (document.readyState === 'complete') { setTimeout(reportSize, 200); }
  else { window.addEventListener('load', function() { setTimeout(reportSize, 200); }); }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function() { setTimeout(reportSize, 50); }).observe(document.documentElement);
  }
})();
</script>`;
  }
}

/**
 * Bridge script for tetfolio iframe content.
 *
 * Tetfolio units are rendered as self-contained HTML (produced by the
 * distpacker) inside a blob-URL iframe. Communication with the hosting
 * TetfolioComponent works via a script that is spliced into that HTML
 * string before the iframe is created - the same string-level technique
 * the distpacker itself uses. This module owns everything about that
 * script; the component only calls injectTetfolioBridge().
 */

/**
 * Session storage key prefix for experiment state.
 * The pageId comes from the static tetfoliopage="tf_<pageId>" attribute.
 * Framework keys like 'tet_cssTransform*' are intentionally not captured.
 */
export const TETFOLIO_STATE_KEY_PREFIX = 'ibe_logger-';

/** Delay for the experiment's own state replay (see module docs). */
export const TETFOLIO_RESTORE_DELAY_MS = 1500;

/** Extra margin after the computed replay duration (see module docs). */
export const TETFOLIO_REPLAY_MARGIN_MS = 1500;

/** Fallback: enable capture if no restore happens (see module docs). */
export const TETFOLIO_INIT_SETTLE_MS = 4000;

/**
 * Extract the element's own state keys from the packed HTML, so that
 * multiple tetfolio elements in the same tab (shared sessionStorage)
 * never capture or seed each other's experiment state.
 */
export function extractTetfolioStateKeys(htmlContent: string): string[] {
  const keys: string[] = [];
  // Mirror the logger exactly: it derives the pageId from the attribute
  // value as value.substring(3) (dropping the leading 'tf_' marker),
  // whatever characters follow. Accept both quote styles.
  const regex = /tetfoliopage=["']([^"']+)["']/gi;
  let match = regex.exec(htmlContent);
  while (match !== null) {
    const pageAttribute = match[1];
    if (pageAttribute.length > 3) {
      const key = TETFOLIO_STATE_KEY_PREFIX + pageAttribute.substring(3);
      if (!keys.includes(key)) keys.push(key);
    }
    match = regex.exec(htmlContent);
  }
  return keys;
}

function buildBridgeScript(savedState: string | null, stateKeys: string[]): string {
  const keys = JSON.stringify(stateKeys);
  const prefix = JSON.stringify(TETFOLIO_STATE_KEY_PREFIX);
  // Seed the saved state synchronously at document parse time, so it is
  // guaranteed to be present before the experiment's own autoRestore()
  // (which waits for inner-iframe load + tet:afterinit) reads it.
  const seed = savedState ? `
  try {
    var seededState = ${JSON.stringify(savedState)};
    var parsedState = JSON.parse(seededState);
    for (var seedKey in parsedState) {
      if (Object.prototype.hasOwnProperty.call(parsedState, seedKey) && matchesKey(seedKey)) {
        seededSnapshot[seedKey] = parsedState[seedKey];
        window.sessionStorage.setItem(seedKey, parsedState[seedKey]);
      }
    }
  } catch (e) { console.warn('tetfolio-bridge: state seeding failed', e); }
` : '';
  return `<script>
(function() {
  var STATE_KEYS = ${keys};
  var STATE_KEY_PREFIX = ${prefix};
  var RESTORE_DELAY_MS = ${TETFOLIO_RESTORE_DELAY_MS};
  var REPLAY_MARGIN_MS = ${TETFOLIO_REPLAY_MARGIN_MS};
  var INIT_SETTLE_MS = ${TETFOLIO_INIT_SETTLE_MS};
  function matchesKey(key) {
    if (STATE_KEYS.length > 0) return STATE_KEYS.indexOf(String(key)) >= 0;
    return String(key).indexOf(STATE_KEY_PREFIX) === 0;
  }
  var origSetItem = Storage.prototype.setItem;
  var origRemoveItem = Storage.prototype.removeItem;
  var seededSnapshot = {};
  // Clear own keys BEFORE seeding: sessionStorage is per-tab and survives
  // logout/login on a shared device, so leftover state from a previous
  // user must never become this session's starting point. After this,
  // the state persisted by the Testcenter is the single source of truth.
  try {
    var staleKeys = [];
    for (var si = 0; si < window.sessionStorage.length; si++) {
      var staleKey = window.sessionStorage.key(si);
      if (staleKey && matchesKey(staleKey)) staleKeys.push(staleKey);
    }
    for (var sj = 0; sj < staleKeys.length; sj++) {
      origRemoveItem.call(window.sessionStorage, staleKeys[sj]);
    }
  } catch (e) { console.warn('tetfolio-bridge: state clearing failed', e); }
${seed}
  var captureSuppressed = true;
  var restoreStarted = false;
  var firstRestore = true;
  function reseed(snapshot) {
    for (var key in snapshot) {
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        origSetItem.call(window.sessionStorage, key, snapshot[key]);
      }
    }
  }
  function hasKeys(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return true;
    }
    return false;
  }
  function collectStateRaw() {
    var state = {};
    if (STATE_KEYS.length > 0) {
      for (var i = 0; i < STATE_KEYS.length; i++) {
        var value = window.sessionStorage.getItem(STATE_KEYS[i]);
        if (value !== null) state[STATE_KEYS[i]] = value;
      }
    } else {
      for (var j = 0; j < window.sessionStorage.length; j++) {
        var key = window.sessionStorage.key(j);
        if (key && matchesKey(key)) {
          state[key] = window.sessionStorage.getItem(key);
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
  try {
    var realRestore = null;
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
        realRestore.apply(window, args);
        setTimeout(function () {
          reseed(basis);
          captureSuppressed = false;
        }, replayWindowMs);
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
    captureSuppressed = false;
  }, INIT_SETTLE_MS);
  var stateReportTimer = null;
  function reportStateDebounced() {
    if (stateReportTimer) clearTimeout(stateReportTimer);
    stateReportTimer = setTimeout(function() {
      window.parent.postMessage({
        type: 'tetfolioStateChanged',
        state: JSON.stringify(collectStateRaw())
      }, '*');
    }, 300);
  }
  Storage.prototype.setItem = function(key, value) {
    origSetItem.apply(this, arguments);
    if (this === window.sessionStorage && matchesKey(key) && !captureSuppressed) {
      reportStateDebounced();
    }
  };
  Storage.prototype.removeItem = function(key) {
    origRemoveItem.apply(this, arguments);
    if (this === window.sessionStorage && matchesKey(key) && !captureSuppressed) {
      reportStateDebounced();
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

/**
 * Splice the bridge script into the packed unit HTML, scoped to the
 * element's own state keys and optionally seeding a saved state.
 */
export function injectTetfolioBridge(html: string, savedState: string | null): string {
  const stateKeys = extractTetfolioStateKeys(html);
  const bridge = buildBridgeScript(savedState, stateKeys);
  const idx = html.lastIndexOf('</body>');
  if (idx !== -1) {
    return html.substring(0, idx) + bridge + html.substring(idx);
  }
  return html + bridge;
}

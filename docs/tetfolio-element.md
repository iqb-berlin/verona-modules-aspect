# The tetfolio element

The `tetfolio` element embeds an interactive [tet.folio](https://tetfolio.fu-berlin.de) experiment
inside a unit. Unlike every other element it renders author-supplied HTML, and unlike the two
widgets it does not route through the Verona host — both choices are deliberate and explained
below, because they are the parts a reader will not guess from any single file.

## How the pieces fit together

```
Editor                                    Unit definition            Player / editor preview
------                                    ---------------            -----------------------
tet.folio export zip
  │  unzipSync (fflate)
  ▼
distpack()                    ──────►     htmlContent: one           injectTetfolioBridge()
  inlines css/js/images/                  self-contained HTML          splices the bridge script
  audio/nested iframes                    string                       │
  (distpacker-browser.ts)                                              ▼
                                          state: JSON string         blob-URL <iframe>
                                          (answer variable)            posts tetfolioResize /
                                                                       tetfolioStateChanged
```

- **Editor**: `TetfolioPropertiesComponent` (properties panel) takes the zip, unpacks it in
  memory and runs `distpack()` (`common/utils/distpacker-browser.ts`), which rewrites the entry
  HTML so every asset is inlined — CSS as `<style>`, scripts inline, media as data URIs, nested
  pages as `srcdoc`. The result is written to the element's `htmlContent`.
- **Rendering**: `TetfolioComponent` (`common/components/elements/tetfolio/`) calls
  `injectTetfolioBridge()` (`common/utils/tetfolio-bridge.ts`) to splice a script into that HTML,
  builds a `Blob` URL from it and shows it in an iframe. The bridge script reports the document
  height (`tetfolioResize`) and state changes (`tetfolioStateChanged`) via `postMessage`.
  Height: the panel's height is the initial height; afterwards the iframe follows the content's
  reported height, clamped to `minHeight`/`maxHeight` when set — and with `isHeightFixed` it
  stays at the authored height and the content scrolls inside the iframe. Nothing is ever
  clipped.
- **Player**: `TetfolioGroupElementComponent` seeds the saved state into the model before the
  iframe is built and writes reported state changes into the unit state, mapped 1:1 as a string
  by `ElementModelElementCodeMappingService` (like `geometry` and `widget-periodic-table`).
- **Editor refresh**: uploading a new zip fires `UnitService.tetfolioElementPropertyUpdated`,
  and `ElementOverlay` calls `TetfolioComponent.refresh()` to rebuild the iframe — the same
  pattern geometry and math-table use.

## The state model

A tet.folio experiment logs its own interaction state into `sessionStorage` under
`ibe_logger-<pageId>` keys. Because every blob iframe shares the player's origin, all tetfolio
elements in a tab share ONE sessionStorage — and the pageId is identical for two copies of the
same export. The bridge therefore namespaces physical storage per **element id**
(`storageScopeOf()`): the experiment reads and writes its raw key names, the patched
`setItem`/`getItem`/`removeItem` rewrite them to `tetfolio:<elementId>::ibe_logger-<pageId>`,
so no element can clear or overwrite another's state. The reported and seeded state keeps the
raw key names, which keeps stored answers independent of the element id (duplicating an element
does not orphan its saved state). The captured keys are serialized into one JSON string — the
element's single `string` answer variable. On reload the bridge seeds the keys back **before**
the experiment's own auto-restore reads them. The delays and re-seeding steps in the bridge look
arbitrary but are not — the experiment replays its state with page-load animations that would
otherwise overwrite the true state ("init pollution"); the module docs in `tetfolio-bridge.ts`
are the authority on that timing. One tradeoff is accepted by design: replay echoes are
indistinguishable from user input, so input made *during* a restore's replay window is
overwritten together with them — the bridge's runtime specs pin this behavior.

## Decisions a reviewer will ask about

- **Own player group (`tetfolioGroup`) instead of `externalAppGroup` or `widgetGroup`.**
  Geometry talks to the embedded GeoGebra app through its API; the widgets send
  `vopWidgetCall` messages to the Verona *host*, which renders them outside the player. Tetfolio
  does neither: it renders in place and talks to its iframe directly over `postMessage`. Folding
  it into either existing group would have meant threading a third lifecycle through code built
  for another one.
- **The packed HTML is stored, not the zip.** The player stays free of unzip logic and asset
  serving, and a unit definition remains one self-contained JSON. The cost is a large
  `htmlContent` string (the panel shows its size after upload).
- **`bypassSecurityTrustResourceUrl` on a blob URL — the iframe is NOT sandboxed, and cannot
  be.** A blob URL shares the player's origin, so zip-supplied scripts run with access to the
  player's DOM, storage and `window.parent`. That is accepted because the content is
  author-supplied at design time — the same trust level as everything else in a unit definition;
  nothing user- or runtime-supplied reaches the iframe. Sandboxing was evaluated and rejected
  (2026-09): `sandbox="allow-scripts"` gives the document an opaque origin, and a *nested*
  iframe inside it gets an opaque origin **of its own** — parent↔child `contentWindow` access
  then throws `SecurityError` in both directions (verified empirically in Chromium; the storage
  side would have been solvable with an in-memory shim, this is not). Tet.folio exports load the
  experiment as a nested page and the outer page reaches into its `contentWindow`
  (`window.iiwin`), so a sandboxed element would break every such export. Adding
  `allow-same-origin` is no alternative: a same-origin sandboxed script can undo its own sandbox.
  If hardening is ever needed, the workable direction is an injected Content-Security-Policy
  (restricting network access against exfiltration), not origin isolation. Blob URL rather than
  `srcdoc` at the top level so the document gets its own browsing context; `srcdoc` for the
  nested experiment page inside, because of that same-origin requirement (a data: URI would
  create an opaque origin — see `replaceIframes()` in the distpacker).
- **Empty styling group.** No tetfolio template reads a styling value (the iframe document
  brings its own styles), so the element declares `styling: Record<never, never>` — the #1226
  convention, same as geometry and image.
- **Import `fflate/browser`, never bare `fflate`.** The bare specifier resolves through the
  package's `node` export condition under Vitest browser mode and crashes at import time on
  `createRequire`. The app build tolerates either; the tests only tolerate `fflate/browser`.
  Do not "simplify" the import.

## Where everything lives

| Piece | Path |
| --- | --- |
| Model | `projects/common/models/elements/tetfolio.ts` |
| Component | `projects/common/components/elements/tetfolio/` |
| Zip packer | `projects/common/utils/distpacker-browser.ts` |
| Iframe bridge | `projects/common/utils/tetfolio-bridge.ts` |
| Player group | `projects/player/src/app/components/elements/tetfolio-group-element/` |
| Editor properties | `projects/editor/src/app/modules/properties-panel/components/element-model-properties/tetfolio-properties/` |

The registration touch-points (type union, `ELEMENT_DEFAULTS`, factory, component registry,
panel sections, toolbox, group dispatch, code mapping) are the standard ones every element type
has; `widget-periodic-table` is the closest reference throughout.

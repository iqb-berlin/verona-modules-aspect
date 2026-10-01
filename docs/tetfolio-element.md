# The tetfolio element

The `tetfolio` element embeds an interactive [tet.folio](https://tetfolio.fu-berlin.de) experiment
inside a unit. Unlike every other element it runs author-supplied scripts, and unlike the two
widgets it does not route through the Verona host — both choices are deliberate and explained
below, because they are the parts a reader will not guess from any single file.

## How the pieces fit together

```
Editor                                    Unit definition            Player / editor preview
------                                    ---------------            -----------------------
tet.folio export zip
  │  Distpacker.packZip()
  │  (unzip with fflate, then pack)
  ▼
inlines css/js/images/        ──────►     htmlContent: one           TetfolioBridge.inject()
audio/nested iframes                      self-contained HTML          splices the bridge script
(common/utils/distpacker.ts)              string                       │
                                                                       ▼
                                                                     srcdoc <iframe>
                                                                       posts tetfolioResize /
                                                                       tetfolioStateChanged /
                                                                       tetfolioReady
```

- **Editor**: `TetfolioPropertiesComponent` (properties panel) hands the zip to
  `Distpacker.packZip()` (`common/utils/distpacker.ts`), which unpacks it in memory and rewrites
  the entry HTML so every asset is inlined — CSS as `<style>`, scripts inline, media as data
  URIs, nested pages as `srcdoc`. The result is written to the element's `htmlContent`.
- **Rendering**: `TetfolioComponent` (`common/components/elements/tetfolio/`) calls
  `TetfolioBridge.inject()` (`common/utils/tetfolio-bridge.ts`) to splice a script into that HTML
  and hands the result to an iframe via `srcdoc`. The bridge script reports the document
  height (`tetfolioResize`), state changes (`tetfolioStateChanged`) and the end of a restore
  (`tetfolioReady`) via `postMessage`. While a saved state is being replayed the component
  covers the iframe with the shared spinner overlay, so the test taker never sees the
  experiment jump from its initial to its restored state; the overlay lifts on `tetfolioReady`
  (or silently after the spinner's timeout - a late restore is not an error).
- **Height**: in a dynamic section the panel's height is the initial height; afterwards the
  iframe follows the content's reported height, clamped to `minHeight`/`maxHeight` when set
  (0 means no bound). With `isHeightFixed` the iframe fills the height the container gives it and
  the content scrolls inside. The component never sets a height outside its own template — the
  container bindings of the player and the editor stay in charge. In a static section every
  element has a fixed box from its dimensions, and that box scrolls when the content is taller.
- **Player**: `TetfolioGroupElementComponent` reads the stored state before the iframe is built,
  hands it to the component for seeding and writes reported state changes into the unit state,
  mapped 1:1 as a string by `ElementModelElementCodeMappingService`.
- **Editor refresh**: uploading a new zip fires `UnitService.tetfolioElementPropertyUpdated`,
  and `ElementOverlay` calls `TetfolioComponent.refresh()` to rebuild the iframe — the same
  pattern geometry and math-table use.

## The state model

A tet.folio experiment logs its own interaction state into `sessionStorage` under
`ibe_logger-<pageId>` keys. Because every srcdoc iframe shares the player's origin, all tetfolio
elements in a tab share ONE sessionStorage — and the pageId is identical for two copies of the
same export. The bridge therefore namespaces physical storage per **element id**
(`TetfolioBridge.storageScopeOf()`): the experiment reads and writes its raw key names, the
patched `setItem`/`getItem`/`removeItem` rewrite them to
`tetfolio:<elementId>::ibe_logger-<pageId>`, so no element can clear or overwrite another's state.
The reported and seeded state keeps the raw key names, which keeps stored states independent of
the element id (duplicating an element does not orphan its saved state).

The captured keys are serialized into one JSON string, which the player reports as the element's
value. **It is not an answer:** it exists only to restore the experiment on re-entry and is not
coded. The element therefore declares the `NO_VALUE` variable info of the base class, as audio
and video do for the playback time they report for the same reason. The state is never part of
the unit definition — the model has no property for it.

On reload the bridge seeds the keys back **before** the experiment's own auto-restore reads them.
The delays and re-seeding steps in the bridge look arbitrary but are not — the experiment replays
its state with page-load animations that would otherwise overwrite the true state ("init
pollution"); the class docs of `TetfolioBridge` are the authority on that timing. One tradeoff
is accepted by design: replay echoes are indistinguishable from user input, so input made
*during* a restore's replay window is overwritten together with them — the bridge's runtime specs
pin this behavior.

## What the content can reach

**The iframe is not sandboxed, and cannot be** (see below). A srcdoc document shares the origin
of the page that contains it, so the scripts in a tet.folio export run with the player's origin,
with access to the player's DOM, its storage and `window.parent`. The hosts load the player and
the editor themselves via `srcdoc`, so that origin is the host's:

- **Studio** loads the editor and the preview players via `srcdoc` without a sandbox and keeps
  the signed-in user's `id_token` and `refresh_token` in `localStorage`. The scripts of an
  uploaded export run with that origin for everyone who opens the unit in the editor or a
  preview — not only for the person who uploaded it.
- **Testcenter** loads the player via `srcdoc` as well, so the scripts run with the
  Testcenter's origin during a test.

The rich text of a unit is not sanitized either (`SafeResourceHTMLPipe` passes it through), so a
hand-edited unit definition could already carry markup that runs a script. What is new with this
element is that running author-supplied code is its purpose, and that the code arrives through an
ordinary upload in the editor: whoever can upload an export can act with the session of whoever
views it. That is the price of the element as it is built, and it is a decision for the team, not
something the code settles (#1497).

**Why no sandbox.** Evaluated and rejected (2026-09): `sandbox="allow-scripts"` gives the document
an opaque origin, and a *nested* iframe inside it gets an opaque origin **of its own** —
parent↔child `contentWindow` access then throws `SecurityError` in both directions (verified
empirically in Chromium). Tet.folio exports load the experiment as a nested page and the outer
page reaches into its `contentWindow` (`window.iiwin`), so a sandboxed element would break every
such export. Adding `allow-same-origin` is no alternative: a same-origin sandboxed script can undo
its own sandbox.

**Why no Content-Security-Policy in the iframe.** It restricts what the iframe's own document
loads and sends, but a same-origin script reaches the parent's functions — `window.top.fetch`
runs under the parent's policy, not the iframe's. Isolation needs an origin of its own, which only
a host can provide by serving the content from elsewhere.

## Decisions a reviewer will ask about

- **Own player group (`tetfolioGroup`) instead of `externalAppGroup` or `widgetGroup`.**
  Geometry talks to the embedded GeoGebra app through its API; the widgets send
  `vopWidgetCall` messages to the Verona *host*, which renders them outside the player. Tetfolio
  does neither: it renders in place and talks to its iframe directly over `postMessage`. Folding
  it into either existing group would have meant threading a third lifecycle through code built
  for another one.
- **The packed HTML is stored, not the zip.** The player stays free of unzip logic and asset
  serving, and a unit definition remains one self-contained JSON. The cost is a large
  `htmlContent` string (the panel shows its size after upload): the four IBE-Logger exports
  measured pack to 2.0 to 15.4 MB.
- **`srcdoc`, not a blob URL.** The first version loaded the document from a `blob:` URL. The
  Testcenter refused it: it runs the player under `frame-src 'self'`, and `'self'` does not
  cover `blob:` (its `child-src … blob:` does not help, `frame-src` takes precedence for
  frames). `srcdoc` passes under that policy, so the element works on hosts as they are,
  without a host release. The nested experiment page inside is `srcdoc` for a different reason:
  the outer page reaches into its `contentWindow`, and a data: URI would create an opaque origin
  (see `replaceIframes()` in the distpacker). Either way the document inherits the host's
  policy: what the distpacker inlines is allowed by the Testcenter's, but an export that loads
  external images or stylesheets, or sends requests to another server at runtime, is blocked
  there.
- **Empty styling group.** No tetfolio template reads a styling value (the iframe document
  brings its own styles), so the element declares `styling: Record<never, never>` — the #1226
  convention, same as geometry and image.
- **Import `fflate/browser`, never bare `fflate`.** The bare specifier resolves through the
  package's `node` export condition under Vitest browser mode and crashes at import time on
  `createRequire`. The app build tolerates either; the tests only tolerate `fflate/browser`.
  Do not "simplify" the import. It is a dynamic import in `Distpacker.packZip()`, so fflate is
  loaded only when an export is uploaded.

## Where everything lives

| Piece | Path |
| --- | --- |
| Model | `projects/common/models/elements/tetfolio.ts` |
| Component | `projects/common/components/elements/tetfolio/` |
| Zip packer | `projects/common/utils/distpacker.ts` |
| Iframe bridge | `projects/common/utils/tetfolio-bridge.ts` |
| Player group | `projects/player/src/app/components/elements/tetfolio-group-element/` |
| Editor properties | `projects/editor/src/app/modules/properties-panel/components/element-model-properties/tetfolio-properties/` |

The registration touch-points (type union, `ELEMENT_DEFAULTS`, factory, component registry,
panel sections, toolbox, group dispatch, code mapping) are the standard ones every element type
has; `widget-periodic-table` is the closest reference throughout.

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
- **Player**: `TetfolioGroupElementComponent` seeds the saved state into the model before the
  iframe is built and writes reported state changes into the unit state, mapped 1:1 as a string
  by `ElementModelElementCodeMappingService` (like `geometry` and `widget-periodic-table`).
- **Editor refresh**: uploading a new zip fires `UnitService.tetfolioElementPropertyUpdated`,
  and `ElementOverlay` calls `TetfolioComponent.refresh()` to rebuild the iframe — the same
  pattern geometry and math-table use.

## The state model

A tet.folio experiment logs its own interaction state into `sessionStorage` under
`ibe_logger-<pageId>` keys. The bridge script captures exactly those keys (scoped per element,
so two tetfolio elements in one tab never read each other's state), serializes them into one
JSON string, and that string is the element's single `string` answer variable. On reload the
bridge seeds the keys back **before** the experiment's own auto-restore reads them. The delays
and re-seeding steps in the bridge look arbitrary but are not — the experiment replays its state
with page-load animations that would otherwise overwrite the true state ("init pollution");
the module docs in `tetfolio-bridge.ts` are the authority on that timing.

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
- **`bypassSecurityTrustResourceUrl` on a blob URL.** The content is author-supplied at design
  time — the same trust level as everything else in a unit definition; nothing user- or
  runtime-supplied reaches the iframe. Blob URL rather than `srcdoc` at the top level so the
  document gets its own browsing context; `srcdoc` for the *nested* experiment page inside,
  because the outer page reaches into `iframe.contentWindow` and needs same-origin (a data: URI
  would create an opaque origin — see `replaceIframes()` in the distpacker).
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

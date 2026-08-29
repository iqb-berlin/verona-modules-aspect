/*
 * Builds a unit that holds every element type the player knows, for measurements that need a
 * realistic page rather than a realistic task -- how much the player keeps per loaded unit, how long
 * a rebuild takes. Not a fixture for behaviour tests: nothing here is a sensible exercise, the point
 * is that every component gets rendered.
 *
 * Element ids carry a stamp so that two builds look like two different tasks to the player. That is
 * what the leak measurements need: the editor gives out ids containing Date.now(), so ids never
 * collide between tasks, and anything the player keys by id would otherwise be overwritten instead
 * of piling up.
 *
 * As a module:
 *   const { buildUnit, ELEMENT_TYPES } = require('./scripts/generate-measurement-unit');
 *   buildUnit({ stamp: 'run-1', pages: 5, copies: 2 })   // -> unit definition object
 *
 * From the command line, writing example_data/measurement/all-elements.json:
 *   node scripts/generate-measurement-unit.js [--pages 5] [--copies 1] [--out <path>]
 */

const fs = require('fs');
const path = require('path');

/** Every member of `UIElementType` (`projects/common/models/ui-element-interfaces.ts`). */
const ELEMENT_TYPES = [
  'text', 'button', 'text-field', 'text-field-simple', 'text-area', 'checkbox', 'dropdown', 'radio',
  'image', 'audio', 'video', 'likert', 'likert-row', 'radio-group-images', 'hotspot-image',
  'drop-list', 'cloze', 'spell-correct', 'slider', 'frame', 'toggle-button', 'geometry',
  'math-field', 'math-table', 'text-area-math', 'trigger', 'table', 'marking-panel',
  'widget-periodic-table', 'widget-molecule-editor'
];

// 1x1 pixel, so that the media elements render their controls without a request leaving the page.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=';
const WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
const MP4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQ==';

const options = texts => texts.map(text => ({ text }));

/** The extra properties a type needs to render as more than an empty box. Everything else is filled
    in by `ModelNormalizer` from `ELEMENT_DEFAULTS`, whatever the unit leaves out. */
function contentFor(type, id) {
  switch (type) {
    case 'text':
      return { text: 'Ein Absatz Fließtext, lang genug für einen Umbruch in der Messseite.' };
    case 'button':
      return { label: 'Knopf' };
    case 'checkbox':
      return { label: 'Kontrollkästchen' };
    case 'text-field':
    case 'text-field-simple':
    case 'text-area':
    case 'spell-correct':
    case 'math-field':
    case 'text-area-math':
      return { label: 'Beschriftung' };
    case 'dropdown':
    case 'radio':
    case 'toggle-button':
      return { label: 'Beschriftung', options: options(['Erste', 'Zweite', 'Dritte']) };
    case 'radio-group-images':
      return { columns: [{ text: 'A', imgSrc: PNG }, { text: 'B', imgSrc: PNG }] };
    case 'likert':
      return {
        rows: [
          { type: 'likert-row', id: `${id}_row1`, alias: `${id}_row1`, rowLabel: { text: 'Erste Zeile' }, columnCount: 3 },
          { type: 'likert-row', id: `${id}_row2`, alias: `${id}_row2`, rowLabel: { text: 'Zweite Zeile' }, columnCount: 3 }
        ],
        columns: options(['stimmt', 'teils', 'stimmt nicht'])
      };
    case 'likert-row':
      return { rowLabel: { text: 'Einzelne Zeile' }, columnCount: 3 };
    case 'image':
      return { src: PNG };
    case 'audio':
      return { src: WAV, fileName: 'ton.wav' };
    case 'video':
      return { src: MP4, fileName: 'film.mp4' };
    case 'hotspot-image':
      return {
        src: PNG,
        value: [{
          id: `${id}_spot`, left: 10, top: 10, width: 40, height: 40, shape: 'rectangle',
          borderColor: '#000000', backgroundColor: '#ffffff', rotation: 0, readOnly: false
        }]
      };
    case 'drop-list':
      return {
        value: [1, 2, 3].map(index => ({
          text: `Ablegeteil ${index}`,
          id: `${id}_value${index}`,
          alias: `${id}_value${index}`,
          originListID: id,
          originListIndex: index - 1
        }))
      };
    case 'table':
      return {
        gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
        gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
      };
    default:
      return {};
  }
}

function buildElement(type, index, stamp, row) {
  const id = `${type}_${stamp}_${index}`;
  return {
    type,
    id,
    alias: id,
    position: { gridColumn: 1, gridRow: row, marginLeft: { value: 0, unit: 'px' } },
    ...contentFor(type, id)
  };
}

/**
 * One unit, `pages` pages, each page holding `copies` of every type in `types`.
 * `stamp` goes into every id, so two calls produce two units the player cannot confuse.
 * Narrowing `types` to one entry is how a measurement finds out which element type a growth belongs to.
 */
function buildUnit({
  stamp = 'demo', pages = 5, copies = 1, types = ELEMENT_TYPES
} = {}) {
  const builtPages = [];
  for (let page = 0; page < pages; page++) {
    const elements = [];
    types.forEach(type => {
      for (let copy = 0; copy < copies; copy++) {
        elements.push(buildElement(type, `p${page}c${copy}`, stamp, elements.length + 1));
      }
    });
    builtPages.push({ sections: [{ elements, dynamicPositioning: true }] });
  }
  return { version: '4.12.0', pages: builtPages };
}

module.exports = { buildUnit, ELEMENT_TYPES };

if (require.main === module) {
  const argument = name => {
    const at = process.argv.indexOf(`--${name}`);
    return at === -1 ? undefined : process.argv[at + 1];
  };
  const out = argument('out') ||
    path.join(__dirname, '..', 'example_data', 'measurement', 'all-elements.json');
  const unit = buildUnit({
    stamp: 'all-elements',
    pages: Number(argument('pages') || 5),
    copies: Number(argument('copies') || 1)
  });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(unit, null, 2)}\n`);
  process.stdout.write(
    `${out}: ${unit.pages.length} Seiten, ${unit.pages[0].sections[0].elements.length} Elemente je Seite\n`
  );
}

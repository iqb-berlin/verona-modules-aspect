/* eslint-disable @stylistic/max-len -- one stored form per line, as a unit holds it */

const PARAGRAPH = 'style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"';

const PICTURE = 'data:image/png;base64,AAAA';

/**
 * Texts in the forms units hold them, one feature per entry and grouped by what they exercise. Not only
 * what the editor writes today: earlier versions wrote other attributes, and texts reach a unit from
 * templates and from outside as well. `rich-text-roundtrip.characterization.spec.ts` sends each through
 * the editor and compares what comes back with the recorded baseline.
 */
export const STORED_TEXTS: Record<string, string[]> = {
  whitespace: [
    '<p>Einfacher Text</p>',
    'Text ohne Absatz',
    '<p>zwei  Leerzeichen und&nbsp;geschützt und schmal</p>',
    '<p> führend und folgend </p>',
    '<p>Zeile eins<br>Zeile zwei</p>',
    '<p>a</p>\n<p>b</p>\n\n<p>c</p>',
    '<p></p>',
    '<p></p><p></p><p>nach zwei leeren</p><p></p>',
    `<p ${PARAGRAPH}></p>`,
    '<p>a &lt; b &amp; c &gt; d "Anführung" \'einfach\' ä ö ü ß € 😀</p>'
  ],
  'foreign markup': [
    '<div>Block im div</div>',
    '<div><p>Absatz im div</p></div>',
    '<p>mit <a href="https://example.org">Link</a> und <code>Code</code></p>',
    '<pre>vorformatiert\n  eingerückt</pre>',
    '<table><tr><td>Zelle 1</td><td>Zelle 2</td></tr></table>',
    '<p>Lücke <aspect-nodeview-text-field></aspect-nodeview-text-field> im Text</p>'
  ],
  'paragraph attributes': [
    `<p ${PARAGRAPH}>Standardabsatz</p>`,
    '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indentsize="20">ohne indent</p>',
    '<p style="padding-left: 20px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="1" indentsize="20">eingerückt</p>',
    '<p style="padding-left: 60px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indent="2" indentsize="30">eingerückt 2x30</p>',
    '<p style="padding-left: 20px; text-indent: -20px; margin-bottom: 0px; margin-top: 0" indent="1" indentsize="20">hängend</p>',
    '<p style="padding-left: 20px; text-indent: -20px; margin-bottom: 0px; margin-top: 0" indent="1">hängend ohne indentsize</p>',
    '<p style="text-indent: -20px">nur text-indent</p>',
    '<p style="padding-left: 40px">nur padding</p>',
    '<p indent="3">nur indent</p>',
    '<p style="margin-bottom: 15px; margin-top: 0">nur Abstand</p>'
  ],
  alignment: [
    '<p style="margin-bottom: 0px; margin-top: 0; text-align: center">a &lt; b</p>',
    '<p style="text-align: left">links</p>',
    '<p style="text-align: right">rechts</p>',
    '<p style="text-align: center">mittig</p>',
    '<p style="text-align: justify">Blocksatz</p>',
    '<p style="text-align: start">start</p>',
    '<p style="text-align: right; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20">rechts mit allem</p>',
    '<p align="center">altes align-Attribut</p>'
  ],
  headings: [
    '<h1>Eins</h1><h2>Zwei</h2><h3>Drei</h3><h4>Vier</h4><h5>Fünf</h5><h6>Sechs</h6>',
    '<h2 style="text-align: center">mittige Überschrift</h2>',
    '<h1 style="padding-left: 20px" indent="1" indentsize="20">eingerückte Überschrift</h1>'
  ],
  marks: [
    '<p><strong>fett</strong> <b>b</b> <em>kursiv</em> <i>i</i> <u>unter</u> <s>durch</s> <del>del</del> <strike>strike</strike></p>',
    '<p>H<sub>2</sub>O und x<sup>2</sup> und <sup><sub>beides</sub></sup></p>',
    '<p><span style="font-weight: bold">span fett</span> <span style="font-style: italic">span kursiv</span> <span style="text-decoration: underline">span unter</span> <span style="text-decoration: line-through">span durch</span></p>',
    '<p><span style="font-weight: 700">700</span> <span style="font-weight: normal">normal</span></p>',
    '<p><strong><em><u><s>vier Marken</s></u></em></strong></p>',
    '<p><u><em><strong>andere Reihenfolge</strong></em></u></p>',
    '<p><strong>fett <em>und kursiv</em> weiter fett</strong> normal <em>kursiv <strong>und fett</strong></em></p>'
  ],
  'text style': [
    '<p><span style="font-size: 24px">groß</span> <span style="color: #ff0000">rot</span> <span style="color: rgb(255, 0, 0)">rgb</span> <span style="color: red; font-size: 30px">beides</span></p>',
    '<p><span style="font-size: 24px;">mit Semikolon</span> <span style="font-size:24px">ohne Leerzeichen</span> <span style="font-size: 1.5em">em</span> <span style="font-size: large">large</span></p>',
    '<p><span>span ohne Stil</span> <span class="x">span mit Klasse</span> <span style="">leerer Stil</span></p>',
    '<p><span style="font-family: Arial">Schriftart</span> <span style="font-family: Arial; font-size: 20px">Schriftart und Größe</span></p>',
    '<p><span style="line-height: 2">Zeilenhöhe</span> <span style="background-color: yellow">Hintergrund am span</span></p>',
    '<p><span style="font-size: 24px"><sup>hoch groß</sup></span><sub><span style="color: red">tief rot</span></sub></p>'
  ],
  /** The editor writes one span per run. Where spans arrive nested, the innermost one counts. */
  'nested text style': [
    '<p><span style="color: red"><span style="font-size: 24px">verschachtelt</span></span></p>',
    '<p><span style="color: red">außen <span style="font-size: 24px">innen</span> außen</span></p>',
    '<p><span style="color: red"><span style="color: blue">Farbe überschrieben</span></span></p>',
    '<p><span style="font-size: 24px"><span style="color: red"><strong>drei Ebenen</strong></span></span></p>'
  ],
  highlight: [
    '<p><mark>markiert</mark> <mark data-color="#ffff00" style="background-color: #ffff00">mit Farbe alt</mark> <mark data-color="#ffff00" style="background-color: #ffff00; color: inherit">mit Farbe neu</mark> <mark style="background-color: lightgrey">nur Stil</mark></p>',
    '<p><mark data-color="lightgrey" style="background-color: lightgrey; color: inherit"><span style="color: red; font-size: 24px"><strong><em><u>alles zusammen</u></em></strong></span></mark></p>'
  ],
  lists: [
    '<ul><li><p>eins</p></li><li><p>zwei</p></li></ul>',
    '<ul><li>ohne p</li><li>zwei</li></ul>',
    '<ul style="list-style: square;"><li><p>quadrat</p></li></ul>',
    '<ul style="list-style: circle"><li><p>kreis</p></li></ul>',
    '<ul style="list-style-type: square"><li><p>list-style-type</p></li></ul>',
    '<ol><li><p>eins</p></li><li><p>zwei</p></li></ol>',
    '<ol style="list-style: lower-latin; font-size: 24px"><li><p>a</p></li><li><p>b</p></li></ol>',
    '<ol style="list-style: upper-roman; font-size: 20px"><li><p>I</p></li></ol>',
    '<ol style="list-style: decimal"><li><p>ohne Schriftgröße</p></li></ol>',
    '<ol start="3"><li><p>drei</p></li></ol>',
    '<ol type="a"><li><p>type a</p></li></ol>',
    '<ul style="list-style: disc;"><li><p>außen</p><ul style="list-style: circle;"><li><p>innen</p><ul style="list-style: square;"><li><p>ganz innen</p></li></ul></li></ul></li><li><p>außen 2</p></li></ul>',
    '<ol style="list-style: decimal; font-size: 20px"><li><p>eins</p><ol style="list-style: lower-latin; font-size: 20px"><li><p>a</p></li></ol></li></ol>',
    '<ul><li style="padding-left: 20px" indent="1" indentsize="20"><p>Punkt mit altem Tab-Einzug</p></li></ul>',
    '<ul><li indent="0" indentsize="20"><p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20">Punkt mit Absatzattributen</p></li></ul>',
    '<ul><li><p>eins</p><p>zweiter Absatz im Punkt</p></li></ul>',
    '<ol><li><p><strong>fett</strong> im Punkt</p></li><li><p><span style="font-size: 24px">groß</span></p></li></ol>'
  ],
  'quotes and lines': [
    '<blockquote><p>Zitat</p></blockquote>',
    '<blockquote><p>Zitat eins</p><p>Zitat zwei</p></blockquote>',
    '<blockquote>Zitat ohne p</blockquote>',
    '<p>davor</p><hr><p>danach</p>',
    '<hr short="false">',
    '<hr style="width: 20%; margin-left: 0;" short="true">',
    '<hr short="true">'
  ],
  images: [
    `<p><img style="display: inline-block; height: 1em; vertical-align: middle" src="${PICTURE}"></p>`,
    `<p>Text <img style="display: inline-block; height: 1em; vertical-align: middle" src="${PICTURE}" alt="Alt" title="Titel"> Text</p>`,
    `<img src="${PICTURE}">`,
    `<img src="${PICTURE}" data-style="float: left; margin-right: 10px;" style="float: left; margin-right: 10px;">`,
    `<img src="${PICTURE}" data-style="float: right; margin-left: 10px;" style="float: right; margin-left: 10px;">`,
    `<img src="${PICTURE}" style="float: right; margin-left: 10px;">`,
    `<img src="${PICTURE}" alt="Alt" title="Titel" width="100" height="50">`,
    '<img src="https://example.org/bild.png" alt="extern">',
    `<p><img src="${PICTURE}"></p>`,
    `<p>Text <img src="${PICTURE}"> Text</p>`,
    `<img src="${PICTURE}"><p>Text nach Bild</p>`
  ],
  tooltips: [
    '<p><tooltip data-tooltip-text="Hinweis" data-tooltip-position="above" onpointerdown="x" onpointerenter="x" onpointerleave="x" onmouseleave="x" style="cursor: pointer;">Wort</tooltip></p>',
    '<p><tooltip data-tooltip-text="Hinweis" data-tooltip-position="below">Wort ohne Handler</tooltip></p>',
    '<p><tooltip data-tooltip-text="Hinweis">ohne Position</tooltip></p>',
    '<p><strong><tooltip data-tooltip-text="Hinweis" data-tooltip-position="left">fett im Tooltip</tooltip></strong> <tooltip data-tooltip-text="H" data-tooltip-position="right"><span style="font-size: 24px">groß im Tooltip</span></tooltip></p>'
  ],
  anchors: [
    '<p><aspect-anchor data-anchor-id="Wort" data-anchor-color="#dccce6" style="background-color: #dccce6;">Wort</aspect-anchor></p>',
    '<p><aspect-anchor data-anchor-id="Wort" style="background-color: rgb(220, 204, 230);">Wort ohne Farbattribut</aspect-anchor></p>',
    '<p><aspect-anchor data-anchor-id="innen" data-parent-anchor-id="aussen" data-anchor-color="#aaaaaa" data-parent-anchor-color="#dccce6" style="background-color: #aaaaaa;">verschachtelt</aspect-anchor></p>',
    '<p><aspect-anchor data-anchor-id="aussen" data-anchor-color="#dccce6" style="background-color: #dccce6;">außen </aspect-anchor><aspect-anchor data-anchor-id="innen" data-parent-anchor-id="aussen" data-anchor-color="#aaaaaa" data-parent-anchor-color="#dccce6" style="background-color: #aaaaaa;">innen</aspect-anchor><aspect-anchor data-anchor-id="aussen" data-anchor-color="#dccce6" style="background-color: #dccce6;"> außen</aspect-anchor></p>',
    '<p><aspect-anchor data-anchor-id="fett" data-anchor-color="#dccce6" style="background-color: #dccce6;"><strong>fett</strong> und <span style="color: red">rot</span></aspect-anchor></p>',
    '<p><strong><aspect-anchor data-anchor-id="fett2" data-anchor-color="#dccce6" style="background-color: #dccce6;">Anker im Fett</aspect-anchor></strong></p>'
  ],
  formulas: [
    '<p>Formel <aspect-nodeview-math-formula formula="\\frac{1}{2}" formulahtml="<span class=&quot;ML__latex&quot;>x</span>"><span><span class="ML__latex">x</span></span></aspect-nodeview-math-formula> im Text</p>',
    '<p><aspect-nodeview-math-formula formula="x^2"></aspect-nodeview-math-formula></p>',
    '<p><aspect-nodeview-math-formula formula="" formulahtml=""><span></span></aspect-nodeview-math-formula></p>',
    '<p><aspect-nodeview-math-formula formula="a &lt; b" formulahtml="<math><mi>a</mi><mo>&lt;</mo><mi>b</mi></math>"><span><math><mi>a</mi><mo>&lt;</mo><mi>b</mi></math></span></aspect-nodeview-math-formula></p>',
    '<p><strong><aspect-nodeview-math-formula formula="x"></aspect-nodeview-math-formula></strong> <span style="font-size: 30px"><aspect-nodeview-math-formula formula="y"></aspect-nodeview-math-formula></span></p>'
  ],
  'section templates': [
    `<p ${PARAGRAPH}><span style="font-size: 24px"><strong>Überschrift</strong></span></p><p ${PARAGRAPH}><span style="color: black; font-size: 20px">Hier steht die Situierung.</span></p>`
  ]
};

const PARAGRAPH_ATTRIBUTES = {
  textAlign: 'left', indent: null, indentSize: 20, hangingIndent: false, margin: 0
};

const gap = (node: string, type: string, id: string): Record<string, unknown> => ({
  type: node, attrs: { model: { type, id, alias: id } }
});

/**
 * A cloze element as a unit holds it: every kind of node the editor knows in cloze mode, and every kind
 * of gap. The child models are as short as a stored unit may have them; the rest comes from the defaults
 * on loading.
 */
export const STORED_CLOZE: Record<string, unknown> = {
  type: 'cloze',
  id: 'cloze_1',
  alias: 'cloze_1',
  document: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { textAlign: 'center', level: 2 },
        content: [{ type: 'text', text: 'Überschrift' }]
      },
      {
        type: 'paragraph',
        attrs: PARAGRAPH_ATTRIBUTES,
        content: [
          { type: 'text', text: 'Ein Feld ' },
          gap('TextField', 'text-field-simple', 'text-field-simple_1'),
          { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }], text: ' fett' },
          {
            type: 'text',
            marks: [
              { type: 'textStyle', attrs: { color: '#ff0000', fontSize: '24px' } },
              { type: 'highlight', attrs: { color: '#ffff00' } }
            ],
            text: ' farbig'
          },
          { type: 'text', marks: [{ type: 'superscript' }], text: 'hoch' },
          { type: 'text', marks: [{ type: 'subscript' }], text: 'tief' },
          { type: 'text', marks: [{ type: 'strike' }], text: 'durch' }
        ]
      },
      {
        type: 'bulletList',
        attrs: { listStyle: 'square' },
        content: [{
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              attrs: PARAGRAPH_ATTRIBUTES,
              content: [{ type: 'text', text: 'Liste ' }, gap('DropList', 'drop-list', 'drop-list_1')]
            },
            {
              type: 'orderedList',
              attrs: { listStyle: 'lower-latin', fontSize: '20px' },
              content: [{
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  attrs: PARAGRAPH_ATTRIBUTES,
                  content: [{ type: 'text', text: 'Unterpunkt ' }, gap('ToggleButton', 'toggle-button', 'toggle-button_1')]
                }]
              }]
            }
          ]
        }]
      },
      {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          attrs: {
            textAlign: 'left', indent: 1, indentSize: 20, hangingIndent: true, margin: 10
          },
          content: [
            { type: 'text', text: 'Zitat ' },
            gap('Button', 'button', 'button_1'),
            gap('Checkbox', 'checkbox', 'checkbox_1'),
            gap('Dropdown', 'dropdown', 'dropdown_1')
          ]
        }]
      },
      { type: 'horizontalRule', attrs: { short: true } },
      {
        type: 'blockImage',
        attrs: {
          src: PICTURE, alt: 'Bild', title: null, style: 'float: left; margin-right: 10px;'
        }
      },
      {
        type: 'paragraph',
        attrs: PARAGRAPH_ATTRIBUTES,
        content: [
          { type: 'inlineImage', attrs: { src: PICTURE, alt: null, title: null } },
          { type: 'math-formula', attrs: { formula: 'x^2', formulaHTML: '<span>x</span>' } },
          {
            type: 'text',
            marks: [
              {
                type: 'anchorId',
                attrs: {
                  anchorId: 'Anker', parentAnchorId: '', anchorColor: '#dccce6', parentAnchorColor: ''
                }
              },
              { type: 'tooltip', attrs: { tooltipText: 'Hinweis', tooltipPosition: 'above' } }
            ],
            text: 'Anker'
          },
          gap('TextField', 'text-field-simple', 'text-field-simple_2')
        ]
      }
    ]
  }
};

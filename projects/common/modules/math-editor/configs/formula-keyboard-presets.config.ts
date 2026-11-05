import { convertLatexToMarkup, VirtualKeyboardKeycap, VirtualKeyboardLayout } from '@iqb/mathlive';

/**
 * The shifted variant of a Greek letter key: inserts `insert` and shows the capital letter with its name
 * below it, like the lowercase key. MathLive draws a keycap's `aside` only for the unshifted key, so the
 * name has to be part of the label. The letter is typeset from `insert` with MathLive's public
 * `convertLatexToMarkup`, so the key always shows the letter it inserts; how that letter is shaped in the
 * formula is up to the formula field. This is not the internal renderer MathLive uses for a shift given as
 * plain LaTeX; `letterShapeStyle: 'tex'` keeps the capital on the key upright whatever the locale.
 *
 * The same label also fills the small shift hint (`MLK__shift`) in the corner of the lowercase key;
 * `common-styles.css` hides the `greek-capital-name` there, so the hint shows only the letter.
 */
const greekCapital = (insert: string, name: string): Partial<VirtualKeyboardKeycap> => ({
  insert,
  label: `${convertLatexToMarkup(insert, { letterShapeStyle: 'tex' })}<aside class="greek-capital-name">${name}</aside>`
});

export const FORMULA_KEYBOARD_PRESETS: Record<string, VirtualKeyboardLayout> = {
  iqbPhysics: {
    label: '123',
    labelClass: 'MLK__tex-math',
    rows: [
      [
        {
          latex: '<',
          shift: '\\le'
        },
        {
          latex: '>',
          shift: '\\ge'
        },
        '[separator-5]',
        {
          latex: '7'
        },
        {
          latex: '8'
        },
        {
          latex: '9'
        },
        {
          label: '÷',
          latex: '\\colon'
        },
        '[separator-5]',
        {
          latex: '\\frac{#@}{#?}'
        },
        {
          latex: '#@^2}'
        },
        {
          latex: '#@^#?'
        }
      ],
      [
        {
          latex: '=',
          shift: '\\ne'
        },
        {
          latex: '\\pm',
          shift: '\\leftrightarrow'
        },
        '[separator-5]',
        {
          latex: '4'
        },
        {
          latex: '5'
        },
        {
          latex: '6'
        },
        {
          label: '×',
          latex: '\\cdot'
        },
        '[separator-5]',
        {
          latex: '\\sqrt{#0}'
        },
        {
          latex: '\\overline{#@}',
          shift: '\\left\\vert#0\\right\\vert'
        },
        {
          latex: '\\overrightarrow{#@}',
          shift: {
            latex: '\\exp',
            insert: '\\exp\\left(#0\\right)'
          }
        }
      ],
      [
        {
          latex: '(',
          shift: '\\rightarrow'
        },
        {
          latex: ')',
          shift: '\\leftarrow'
        },
        '[separator-5]',
        {
          latex: '1'
        },
        {
          latex: '2'
        },
        {
          latex: '3'
        },
        {
          latex: '-'
        },
        '[separator-5]',
        {
          latex: '\\exponentialE',
          shift: '\\sin'
        },
        {
          latex: '\\pi',
          shift: '\\cos'
        },
        {
          latex: '\\infty',
          shift: '\\tan'
        }
      ],
      [
        { label: '[shift]', width: 2.0 },
        '[separator-5]',
        {
          label: '‐',
          latex: '-'
        },
        {
          latex: '0'
        },
        {
          latex: ','
        },
        {
          latex: '+'
        },
        '[separator-5]',
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
          command: 'performWithFeedback(moveToPreviousChar)'
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)'
        },
        {
          class: 'action bottom right',
          width: 1.0,
          command: 'performWithFeedback(deleteBackward)',
          label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>'
        }
      ]
    ]
  },
  iqbNumeric: {
    label: '123',
    labelClass: 'MLK__tex-math',
    rows: [
      [
        {
          label: '<',
          latex: '<'
        },
        {
          label: '>',
          latex: '>'
        },
        '[separator-5]',
        {
          latex: '7'
        },
        {
          latex: '8'
        },
        {
          latex: '9'
        },
        {
          label: '÷',
          latex: '\\colon'
        },
        '[separator-5]',
        {
          latex: '\\frac{#@}{#?}'
        },
        {
          latex: '#@^2}'
        },
        {
          latex: '#@^#?'
        }
      ],
      [
        {
          label: '≤',
          latex: '\\le'
        },
        {
          label: '≥',
          latex: '\\ge'
        },
        '[separator-5]',
        {
          latex: '4'
        },
        {
          latex: '5'
        },
        {
          latex: '6'
        },
        {
          label: '×',
          latex: '\\cdot'
        },
        '[separator-5]',
        { latex: '#@\\degree' },
        {
          latex: '\\sqrt{#0}'
        },
        {
          latex: '\\sqrt[#0]{#?}}'
        }
      ],
      [
        {
          latex: '('
        },
        {
          latex: ')'
        },
        '[separator-5]',
        {
          latex: '1'
        },
        {
          latex: '2'
        },
        {
          latex: '3'
        },
        {
          latex: '-'
        },
        '[separator-5]',
        {
          latex: '\\overline{#@}'
        },
        '\\left\\vert#0\\right\\vert',
        {
          class: 'action bottom right',
          width: 1.0,
          command: 'performWithFeedback(deleteBackward)',
          label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>'
        }
      ],
      [
        { label: '=', latex: '=' },
        { label: '≠', latex: '\\ne' },
        '[separator-5]',
        {
          label: '‐',
          latex: '-'
        },
        {
          latex: '0'
        },
        {
          latex: ','
        },
        { latex: '+' },
        '[separator-15]',
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
          command: 'performWithFeedback(moveToPreviousChar)'
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)'
        }
      ]
    ]
  },
  iqbSymbols: {
    label: '&infin;≠∈',
    labelClass: 'MLK__tex',
    rows: [
      [
        {
          latex: '\\sin',
          shift: '\\sin^{-1}'
        },
        '\\ln',
        {
          latex: '\\mathrm{abs}',
          insert: '\\mathrm{abs}\\left(#0\\right)'
        },
        {
          latex: '\\rightarrow',
          shift: '\\Rightarrow'
        },
        {
          latex: '\\exists',
          shift: '\\nexists'
        },
        { latex: '\\in', shift: '\\notin' },
        '\\cup',
        {
          latex: '\\overrightarrow{#@}',
          shift: '\\overleftarrow{#@}'
        },
        {
          class: 'small',
          latex: '\\lim_{#?}',
          shift: '\\lim_{x\\to\\infty}'
        },
        {
          class: 'small',
          latex: '\\sum',
          insert: '\\sum'
        }
      ],
      [
        {
          latex: '\\cos',
          shift: '\\cos^{-1}'
        },
        {
          latex: '\\log',
          shift: '\\log_{10}'
        },
        '\\left\\vert#0\\right\\vert',
        {
          latex: '\\larr',
          shift: '\\lArr'
        },
        {
          latex: '\\forall',
          shift: '\\lnot'
        },
        { latex: '\\ni', shift: '\\not\\owns' },
        '\\cap',
        {
          latex: '\\overline{#@}',
          shift: '\\underline{#@}'
        },
        {
          class: 'small',
          latex: '\\int',
          shift: '\\iint'
        },
        {
          latex: '\\int^{{#?}}_{#?}\\!#?\\,\\mathrm{d}x',
          class: 'small'
        }
      ],
      [
        {
          latex: '\\tan',
          shift: '\\tan^{-1}'
        },
        {
          latex: '\\exp',
          insert: '\\exp\\left(#0\\right)'
        },
        '\\left\\Vert#0\\right\\Vert',
        {
          latex: '\\lrArr',
          shift: '\\leftrightarrow'
        },
        { latex: '\\vert', shift: '!' },
        {
          latex: '#@^{\\complement}',
          aside: 'complement'
        },
        {
          latex: '\\subset',
          shift: '\\subseteq'
        },
        {
          latex: '#@^{\\prime}',
          shift: '#@^{\\doubleprime}'
        },
        {
          latex: '\\mathrm{d}',
          shift: '\\partial'
        },
        {
          latex: '\\pm',
          class: 'big-op'
        }
      ],
      [
        { label: '[shift]', width: 2.0 },
        '[separator-10]',
        {
          latex: '\\exponentialE',
          shift: '\\imaginaryI'
        },
        { latex: '\\pi', shift: '\\tau' },
        {
          latex: '\\infty',
          shift: '\\Colon'
        },
        '[separator-10]',
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
          command: 'performWithFeedback(moveToPreviousChar)'
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)'
        },
        {
          class: 'action bottom right',
          width: 1.0,
          command: 'performWithFeedback(deleteBackward)',
          label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>'
        }
      ]
    ]
  },
  iqbText: {
    label: 'abc',
    labelClass: 'MLK__tex-math',
    layers: [
      {
        rows: [
          [
            {
              label: 'q',
              class: 'hide-shift',
              shift: {
                label: 'Q'
              }
            },
            {
              label: 'w',
              class: 'hide-shift',
              shift: {
                label: 'W'
              }
            },
            {
              label: 'e',
              class: 'hide-shift',
              shift: {
                label: 'E'
              }
            },
            {
              label: 'r',
              class: 'hide-shift',
              shift: {
                label: 'R'
              }
            },
            {
              label: 't',
              class: 'hide-shift',
              shift: {
                label: 'T'
              }
            },
            {
              label: 'z',
              class: 'hide-shift',
              shift: {
                label: 'Z'
              }
            },
            {
              label: 'u',
              class: 'hide-shift',
              shift: {
                label: 'U'
              }
            },
            {
              label: 'i',
              class: 'hide-shift',
              shift: {
                label: 'I'
              }
            },
            {
              label: 'o',
              class: 'hide-shift',
              shift: {
                label: 'O'
              }
            },
            {
              label: 'p',
              class: 'hide-shift',
              shift: {
                label: 'P'
              }
            }
          ],
          [
            {
              class: 'separator',
              width: 0.5
            },
            {
              label: 'a',
              class: 'hide-shift',
              shift: {
                label: 'A'
              }
            },
            {
              label: 's',
              class: 'hide-shift',
              shift: {
                label: 'S'
              }
            },
            {
              label: 'd',
              class: 'hide-shift',
              shift: {
                label: 'D'
              }
            },
            {
              label: 'f',
              class: 'hide-shift',
              shift: {
                label: 'F'
              }
            },
            {
              label: 'g',
              class: 'hide-shift',
              shift: {
                label: 'G'
              }
            },
            {
              label: 'h',
              class: 'hide-shift',
              shift: {
                label: 'H'
              }
            },
            {
              label: 'j',
              class: 'hide-shift',
              shift: {
                label: 'J'
              }
            },
            {
              label: 'k',
              class: 'hide-shift',
              shift: {
                label: 'K'
              }
            },
            {
              label: 'l',
              class: 'hide-shift',
              shift: {
                label: 'L'
              }
            },
            {
              class: 'separator',
              width: 0.5
            }
          ],
          [
            {
              class: 'shift bottom left',
              width: 1.5,
              label: '<span class=caps-lock-indicator></span><svg class=svg-glyph><use xlink:href=#svg-shift /></svg>'
            },
            {
              label: 'y',
              class: 'hide-shift',
              shift: {
                label: 'Y'
              }
            },
            {
              label: 'x',
              class: 'hide-shift',
              shift: {
                label: 'X'
              }
            },
            {
              label: 'c',
              class: 'hide-shift',
              shift: {
                label: 'C'
              }
            },
            {
              label: 'v',
              class: 'hide-shift',
              shift: {
                label: 'V'
              }
            },
            {
              label: 'b',
              class: 'hide-shift',
              shift: {
                label: 'B'
              }
            },
            {
              label: 'n',
              class: 'hide-shift',
              shift: {
                label: 'N'
              }
            },
            {
              label: 'm',
              class: 'hide-shift',
              shift: {
                label: 'M'
              }
            },
            {
              class: 'action bottom right',
              width: 1.5,
              command: 'performWithFeedback(deleteBackward)',
              label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>'
            }
          ],
          [
            {
              label: ',',
              shift: ';'
            },
            {
              command: 'performWithFeedback(insertDecimalSeparator)',
              shift: ':',
              class: 'big-op',
              label: '.'
            },
            {
              label: ' ',
              width: 5
            },
            {
              class: 'action',
              label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
              command: 'performWithFeedback(moveToPreviousChar)'
            },
            {
              class: 'action',
              label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
              command: 'performWithFeedback(moveToNextChar)'
            }
          ]
        ],
        id: 'ML__layer_rotn9'
      }
    ]
  },
  iqbGreek: {
    label: '&alpha;&beta;&gamma;',
    labelClass: 'MLK__tex-math',
    rows: [
      [
        {
          label: '<i>&#x03c6;</i>',
          class: 'MLK__tex',
          insert: '\\varphi',
          aside: 'phi var.',
          shift: greekCapital('\\Phi', 'Phi')
        },
        {
          label: '<i>&#x03c2;</i>',
          class: 'MLK__tex',
          insert: '\\varsigma',
          aside: 'sigma var.',
          shift: greekCapital('\\Sigma', 'Sigma')
        },
        {
          label: '<i>&#x03f5;</i>',
          class: 'MLK__tex',
          insert: '\\epsilon',
          aside: 'epsilon',
          shift: greekCapital('\\char"0190', 'Epsilon')
        },
        {
          label: '<i>&rho;</i>',
          class: 'MLK__tex',
          insert: '\\rho',
          aside: 'rho',
          shift: greekCapital('\\char"3A1', 'Rho')
        },
        {
          label: '<i>&tau;</i>',
          class: 'MLK__tex',
          insert: '\\tau',
          aside: 'tau',
          shift: greekCapital('\\char"3A4', 'Tau')
        },
        {
          label: '<i>&upsilon;</i>',
          class: 'MLK__tex',
          insert: '\\upsilon',
          aside: 'upsilon',
          shift: greekCapital('\\Upsilon', 'Upsilon')
        },
        {
          label: '<i>&theta;</i>',
          class: 'MLK__tex',
          insert: '\\theta',
          aside: 'theta',
          shift: greekCapital('\\Theta', 'Theta')
        },
        {
          label: '<i>&iota;</i>',
          class: 'MLK__tex',
          insert: '\\iota',
          aside: 'iota',
          shift: greekCapital('\\char"399', 'Iota')
        },
        {
          label: '<i>&omicron;</i>',
          class: 'MLK__tex',
          insert: '\\omicron',
          aside: 'omicron',
          shift: greekCapital('\\char"39F', 'Omicron')
        },
        {
          label: '<i>&pi;</i>',
          class: 'MLK__tex',
          insert: '\\pi',
          aside: 'pi',
          shift: greekCapital('\\Pi', 'Pi')
        }
      ],
      [
        '[separator-5]',
        {
          label: '<i>&alpha;</i>',
          class: 'MLK__tex',
          insert: '\\alpha',
          aside: 'alpha',
          shift: greekCapital('\\char"391', 'Alpha')
        },
        {
          label: '<i>&sigma;</i>',
          class: 'MLK__tex',
          insert: '\\sigma',
          aside: 'sigma',
          shift: greekCapital('\\Sigma', 'Sigma')
        },
        {
          label: '<i>&delta;</i>',
          class: 'MLK__tex',
          insert: '\\delta',
          aside: 'delta',
          shift: greekCapital('\\Delta', 'Delta')
        },
        {
          latex: '\\phi',
          class: 'MLK__tex',
          insert: '\\phi',
          aside: 'phi',
          shift: greekCapital('\\Phi', 'Phi')
        },
        {
          label: '<i>&gamma;</i>',
          class: 'MLK__tex',
          insert: '\\gamma',
          aside: 'gamma',
          shift: greekCapital('\\Gamma', 'Gamma')
        },
        {
          label: '<i>&eta;</i>',
          class: 'MLK__tex',
          insert: '\\eta',
          aside: 'eta',
          shift: greekCapital('\\char"397', 'Eta')
        },
        {
          label: '<i>&xi;</i>',
          class: 'MLK__tex',
          insert: '\\xi',
          aside: 'xi',
          shift: greekCapital('\\Xi', 'Xi')
        },
        {
          label: '<i>&kappa;</i>',
          class: 'MLK__tex',
          insert: '\\kappa',
          aside: 'kappa',
          shift: greekCapital('\\Kappa', 'Kappa')
        },
        {
          label: '<i>&lambda;</i>',
          class: 'MLK__tex',
          insert: '\\lambda',
          aside: 'lambda',
          shift: greekCapital('\\Lambda', 'Lambda')
        },
        '[separator-5]'
      ],
      [
        '[shift]',
        {
          label: '<i>&zeta;</i>',
          class: 'MLK__tex',
          insert: '\\zeta',
          aside: 'zeta',
          shift: greekCapital('\\char"396', 'Zeta')
        },
        {
          label: '<i>&chi;</i>',
          class: 'MLK__tex',
          insert: '\\chi',
          aside: 'chi',
          shift: greekCapital('\\char"3A7', 'Chi')
        },
        {
          label: '<i>&psi;</i>',
          class: 'MLK__tex',
          insert: '\\psi',
          aside: 'psi',
          shift: greekCapital('\\Psi', 'Psi')
        },
        {
          label: '<i>&omega;</i>',
          class: 'MLK__tex',
          insert: '\\omega',
          aside: 'omega',
          shift: greekCapital('\\Omega', 'Omega')
        },
        {
          label: '<i>&beta;</i>',
          class: 'MLK__tex',
          insert: '\\beta',
          aside: 'beta',
          shift: greekCapital('\\char"392', 'Beta')
        },
        {
          label: '<i>&nu;</i>',
          class: 'MLK__tex',
          insert: '\\nu',
          aside: 'nu',
          shift: greekCapital('\\char"39D', 'Nu')
        },
        {
          label: '<i>&mu;</i>',
          class: 'MLK__tex',
          insert: '\\mu',
          aside: 'mu',
          shift: greekCapital('\\char"39C', 'Mu')
        },
        {
          class: 'action bottom right',
          width: 1.0,
          command: 'performWithFeedback(deleteBackward)',
          label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>'
        }
      ],
      [
        '[separator]',
        {
          label: '<i>&#x03b5;</i>',
          class: 'MLK__tex',
          insert: '\\varepsilon',
          aside: 'epsilon var.'
        },
        {
          label: '<i>&#x03d1;</i>',
          class: 'MLK__tex',
          insert: '\\vartheta',
          aside: 'theta var.'
        },
        {
          label: '<i>&#x3f0;</i>',
          class: 'MLK__tex',
          insert: '\\varkappa',
          aside: 'kappa var.'
        },
        {
          label: '<i>&#x03d6;</i>',
          class: 'MLK__tex',
          insert: '\\varpi',
          aside: 'pi var.'
        },
        {
          label: '<i>&#x03f1;</i>',
          class: 'MLK__tex',
          insert: '\\varrho',
          aside: 'rho var.'
        },

        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
          command: 'performWithFeedback(moveToPreviousChar)'
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)'
        }
      ]
    ]
  }
};

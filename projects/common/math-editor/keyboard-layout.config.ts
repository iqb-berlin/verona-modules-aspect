import { VirtualKeyboardLayout } from '@iqb/mathlive';

export const IQB_MATH_KEYBOARD_LAYOUTS: Record<string, VirtualKeyboardLayout> = {
  iqbNumeric: {
    label: '123',
    labelClass: 'MLK__tex-math',
    tooltip: 'keyboard.tooltip.numeric',
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
        // {
        //   latex: '\\exponentialE',
        //   shift: '\\ln',
        //   variants: ['\\exp', '\\times 10^{#?}', '\\ln', '\\log_{10}', '\\log']
        // },
        // {
        //   latex: '\\imaginaryI',
        //   variants: ['\\Re', '\\Im', '\\imaginaryJ', '\\Vert #0 \\Vert']
        // },
        {
          latex: '\\frac{#@}{#?}'
        },
        {
          latex: '#@^#?'
        },
        {
          latex: '\\pi'
          // shift: '\\sin',
          // variants: [
          //   '\\prod',
          //   { latex: '\\theta', aside: 'theta' },
          //   { latex: '\\rho', aside: 'rho' },
          //   { latex: '\\tau', aside: 'tau' },
          //   '\\sin',
          //   '\\cos',
          //   '\\tan'
          // ]
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
        {
          latex: '#@^2}'
        },
        // {
        //   latex: '#@^{#0}}',
        //   class: 'hide-shift',
        //   shift: '#@_{#?}'
        // },
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
        // {
        //   latex: '\\int^{\\infty}_{0}\\!#?\\,\\mathrm{d}x',
        //   class: 'small hide-shift',
        //   shift: '\\int',
        //   variants: [
        //     { latex: '\\int_{#?}^{#?}', class: 'small' },
        //     { latex: '\\int', class: 'small' },
        //     { latex: '\\iint', class: 'small' },
        //     { latex: '\\iiint', class: 'small' },
        //     { latex: '\\oint', class: 'small' },
        //     '\\mathrm{d}x',
        //     { latex: '\\dfrac{\\mathrm{d}}{\\mathrm{d} x}', class: 'small' },
        //     { latex: '\\frac{\\partial}{\\partial x}', class: 'small' },
        //
        //     '\\partial'
        //   ]
        // },
        // {
        //   class: 'hide-shift',
        //   latex: '\\forall',
        //   shift: '\\exists'
        // },
        {
          latex: '\\overline{#@}'
          // shift: '\\underline{#@}',
          // variants: [
          //   '\\overbrace{#@}',
          //   '\\overlinesegment{#@}',
          //   '\\overleftrightarrow{#@}',
          //   '\\overrightarrow{#@}',
          //   '\\overleftarrow{#@}',
          //   '\\overgroup{#@}',
          //   '\\underbrace{#@}',
          //   '\\underlinesegment{#@}',
          //   '\\underleftrightarrow{#@}',
          //   '\\underrightarrow{#@}',
          //   '\\underleftarrow{#@}',
          //   '\\undergroup{#@}'
          // ]
        },
        { latex: '#@\\degree' },
        { label: '[backspace]', width: 1.0 }
      ],
      [
        { label: '=', latex: '=' },
        { label: '≠', latex: '\\ne' },
        // { label: '[shift]', width: 2.0 },
        '[separator-5]',
        {
          latex: '0'
        },
        {
          latex: ','
        },
        '[separator-10]',
        //'[=]',
        '[+]',
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
  iqbText: {
    label: 'abc',
    labelClass: 'MLK__tex-math',
    tooltip: 'keyboard.tooltip.alphabetic',
    layers: [
      {
        rows: [
          // [
          //   {
          //     label: '1',
          //     variants: '1'
          //   },
          //   {
          //     label: '2',
          //     variants: '2'
          //   },
          //   {
          //     label: '3',
          //     variants: '3'
          //   },
          //   {
          //     label: '4',
          //     variants: '4'
          //   },
          //   {
          //     label: '5',
          //     // shift: {
          //     //   latex: '\\frac{#@}{#?}'
          //     // },
          //     variants: '5'
          //   },
          //   {
          //     label: '6',
          //     // shift: {
          //     //   latex: '#@^#?'
          //     // },
          //     variants: '6'
          //   },
          //   {
          //     label: '7',
          //     variants: '7'
          //   },
          //   {
          //     label: '8',
          //     shift: {
          //       latex: '\\times'
          //     },
          //     variants: '8'
          //   },
          //   {
          //     label: '9',
          //     shift: {
          //       label: '(',
          //       latex: '('
          //     },
          //     variants: '9'
          //   },
          //   {
          //     label: '0',
          //     shift: {
          //       label: ')',
          //       latex: ')'
          //     },
          //     variants: '0'
          //   }
          // ],
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
              class: 'action bottom right hide-shift',
              width: 1.5,
              command: 'performWithFeedback(deleteBackward)',
              label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>',
              shift: {
                class: 'action warning',
                label: '<svg class=svg-glyph><use xlink:href=#svg-trash /></svg>',
                command: 'deleteAll'
              }
            }
          ],
          [
            // {
            //   variants: [
            //     '\\pm',
            //     '\\ominus'
            //   ],
            //   latex: '-',
            //   label: '&#x2212;',
            //   shift: '\\pm',
            //   class: 'big-op hide-shift'
            // },
            // {
            //   variants: [
            //     {
            //       latex: '\\sum_{#0}^{#0}',
            //       class: 'small'
            //     },
            //     '\\oplus'
            //   ],
            //   latex: '+',
            //   label: '+',
            //   class: 'big-op hide-shift',
            //   shift: {
            //     latex: '\\sum',
            //     insert: '\\sum',
            //     class: 'small'
            //   }
            // },
            // {
            //   variants: [
            //     '\\neq',
            //     '\\equiv',
            //     '\\varpropto',
            //     '\\thickapprox',
            //     '\\lt',
            //     '\\gt',
            //     '\\le',
            //     '\\ge'
            //   ],
            //   latex: '=',
            //   label: '=',
            //   shift: {
            //     label: '≠',
            //     latex: '\\ne'
            //   },
            //   class: 'big-op hide-shift'
            // },
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
            // {
            //   label: ',',
            //   shift: ';',
            //   variants: '.',
            //   class: 'hide-shift'
            // },
            // {
            //   variants: '.',
            //   command: 'performWithFeedback(insertDecimalSeparator)',
            //   shift: ',',
            //   class: 'big-op hide-shift',
            //   label: '.'
            // },
            {
              class: 'action',
              label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
              command: 'performWithFeedback(moveToPreviousChar)',
              // shift: {
              //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-left /></svg>',
              //   command: 'performWithFeedback(extendSelectionBackward)'
              // }
            },
            {
              class: 'action',
              label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
              command: 'performWithFeedback(moveToNextChar)',
              // shift: {
              //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-right /></svg>',
              //   command: 'performWithFeedback(extendSelectionForward)'
              // }
            }
            // {
            //   class: 'action hide-shift',
            //   command: 'performWithFeedback(commit)',
            //   shift: {
            //     label: '<svg class=svg-glyph><use xlink:href=#circle-plus /></svg>',
            //     command: 'performWithFeedback(addRowAfter)'
            //   },
            //   width: 1.5,
            //   label: '<svg class=svg-glyph><use xlink:href=#svg-commit /></svg>'
            // }
          ]
        ],
        id: 'ML__layer_rotn9'
      }
    ]
  },
  iqbGreek: {
    label: '&alpha;&beta;&gamma;',
    labelClass: 'MLK__tex-math',
    tooltip: 'keyboard.tooltip.greek',
    rows: [
      [
        {
          label: '<i>&#x03c6;</i>',
          class: 'MLK__tex',
          insert: '\\varphi',
          aside: 'phi var.',
          shift: '\\Phi'
        },
        {
          label: '<i>&#x03c2;</i>',
          class: 'MLK__tex',
          insert: '\\varsigma',
          aside: 'sigma var.',
          shift: '\\Sigma'
        },
        {
          label: '<i>&#x03f5;</i>',
          class: 'MLK__tex',
          insert: '\\epsilon',
          aside: 'epsilon',
          shift: '\\char"0190'
        },
        {
          label: '<i>&rho;</i>',
          class: 'MLK__tex',
          insert: '\\rho',
          aside: 'rho',
          shift: '\\char"3A1'
        },
        {
          label: '<i>&tau;</i>',
          class: 'MLK__tex',
          insert: '\\tau',
          aside: 'tau',
          shift: '\\char"3A4'
        },
        {
          label: '<i>&upsilon;</i>',
          class: 'MLK__tex',
          insert: '\\upsilon',
          aside: 'upsilon',
          shift: '\\Upsilon'
        },
        {
          label: '<i>&theta;</i>',
          class: 'MLK__tex',
          insert: '\\theta',
          aside: 'theta',
          shift: '\\Theta'
        },
        {
          label: '<i>&iota;</i>',
          class: 'MLK__tex',
          insert: '\\iota',
          aside: 'iota',
          shift: '\\char"399'
        },
        {
          label: '<i>&omicron;</i>',
          class: 'MLK__tex',
          insert: '\\omicron',
          aside: 'omicron',
          shift: '\\char"39F'
        },
        {
          label: '<i>&pi;</i>',
          class: 'MLK__tex',
          insert: '\\pi',
          aside: 'pi',
          shift: '\\Pi'
        }
      ],
      [
        '[separator-5]',
        {
          label: '<i>&alpha;</i>',
          class: 'MLK__tex',
          insert: '\\alpha',
          aside: 'alpha',
          shift: '\\char"391'
        },
        {
          label: '<i>&sigma;</i>',
          class: 'MLK__tex',
          insert: '\\sigma',
          aside: 'sigma',
          shift: '\\Sigma'
        },
        {
          label: '<i>&delta;</i>',
          class: 'MLK__tex',
          insert: '\\delta',
          aside: 'delta',
          shift: '\\Delta'
        },
        {
          latex: '\\phi',
          class: 'MLK__tex',
          insert: '\\phi',
          aside: 'phi',
          shift: '\\Phi'
        },
        {
          label: '<i>&gamma;</i>',
          class: 'MLK__tex',
          insert: '\\gamma',
          aside: 'gamma',
          shift: '\\Gamma'
        },
        {
          label: '<i>&eta;</i>',
          class: 'MLK__tex',
          insert: '\\eta',
          aside: 'eta',
          shift: '\\char"397'
        },
        {
          label: '<i>&xi;</i>',
          class: 'MLK__tex',
          insert: '\\xi',
          aside: 'xi',
          shift: '\\Xi'
        },
        {
          label: '<i>&kappa;</i>',
          class: 'MLK__tex',
          insert: '\\kappa',
          aside: 'kappa',
          shift: '\\Kappa'
        },
        {
          label: '<i>&lambda;</i>',
          class: 'MLK__tex',
          insert: '\\lambda',
          aside: 'lambda',
          shift: '\\Lambda'
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
          shift: '\\char"396'
        },
        {
          label: '<i>&chi;</i>',
          class: 'MLK__tex',
          insert: '\\chi',
          aside: 'chi',
          shift: '\\char"3A7'
        },
        {
          label: '<i>&psi;</i>',
          class: 'MLK__tex',
          insert: '\\psi',
          aside: 'zeta',
          shift: '\\Psi'
        },
        {
          label: '<i>&omega;</i>',
          class: 'MLK__tex',
          insert: '\\omega',
          aside: 'omega',
          shift: '\\Omega'
        },
        {
          label: '<i>&beta;</i>',
          class: 'MLK__tex',
          insert: '\\beta',
          aside: 'beta',
          shift: '\\char"392'
        },
        {
          label: '<i>&nu;</i>',
          class: 'MLK__tex',
          insert: '\\nu',
          aside: 'nu',
          shift: '\\char"39D'
        },
        {
          label: '<i>&mu;</i>',
          class: 'MLK__tex',
          insert: '\\mu',
          aside: 'mu',
          shift: '\\char"39C'
        },

        '[backspace]'
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
          command: 'performWithFeedback(moveToPreviousChar)',
          // shift: {
          //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-left /></svg>',
          //   command: 'performWithFeedback(extendSelectionBackward)'
          // }
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)',
          // shift: {
          //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-right /></svg>',
          //   command: 'performWithFeedback(extendSelectionForward)'
          // }
        },
      ]
    ]
  },
  iqbSymbols: {
    label: '&infin;≠∈',
    labelClass: 'MLK__tex',
    tooltip: 'keyboard.tooltip.symbols',
    rows: [
      [
        {
          latex: '\\sin',
          shift: '\\sin^{-1}',
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
          shift: '\\overleftarrow{#@}' },
        {
          class: 'small',
          latex: '\\lim_{#?}',
          shift: '\\lim_{x\\to\\infty}'
        },
        // '\\exponentialE'
        {
          // variants: [
          //   {
          //     latex: '\\sum_{#0}^{#0}',
          //     class: 'small'
          //   },
          //   '\\oplus'
          // ],
          // latex: '+',
          // label: '+',
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
        // { latex: '\\pi', shift: '\\tau', variants: ['\\tau'] }
        {
          latex: '\\int^{\\infty}_{0}\\!#?\\,\\mathrm{d}x',
          class: 'small'
          // shift: '\\int',
          // variants: [
          //   { latex: '\\int_{#?}^{#?}', class: 'small' },
          //   { latex: '\\int', class: 'small' },
          //   { latex: '\\iint', class: 'small' },
          //   { latex: '\\iiint', class: 'small' },
          //   { latex: '\\oint', class: 'small' },
          //   '\\mathrm{d}x',
          //   { latex: '\\dfrac{\\mathrm{d}}{\\mathrm{d} x}', class: 'small' },
          //   { latex: '\\frac{\\partial}{\\partial x}', class: 'small' },
          //
          //   '\\partial'
          // ]
        },
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
        // {
        //   latex: '\\infty',
        //   variants: ['\\aleph_0', '\\aleph_1', '\\omega', '\\mathfrak{m}']
        // }
        {
          //latex: '-',
          //label: '&#x2212;',
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






        // {
        //   class: 'box',
        //   latex: ',',
        //   shift: ';',
        //   variants: [';', '?']
        // },
        // {
        //   class: 'box',
        //   latex: '\\colon',
        //   shift: '\\Colon',
        //   variants: [
        //     { latex: '\\Colon', aside: 'such that', class: 'box' },
        //     { latex: ':', aside: 'ratio', class: 'box' },
        //     { latex: '\\vdots', aside: '', class: 'box' },
        //     { latex: '\\ddots', aside: '', class: 'box' },
        //     { latex: '\\ldotp', aside: 'low dot', class: 'box' },
        //     { latex: '\\cdotp', aside: 'center dot', class: 'box' },
        //     { latex: '\\ldots', aside: 'low ellipsis', class: 'box' },
        //     { latex: '\\cdots', aside: 'center ellipsis', class: 'box' },
        //     { latex: '\\therefore', aside: 'therefore', class: 'box' },
        //     { latex: '\\because', aside: 'because', class: 'box' }
        //   ]
        // },
        // {
        //   class: 'box',
        //   latex: '\\cdot',
        //   aside: 'centered dot',
        //   shift: '\\ast',
        //   variants: [
        //     '\\circ',
        //     '\\bigcirc',
        //     '\\bullet',
        //     '\\odot',
        //     '\\oslash',
        //     '\\circledcirc',
        //     '\\ast',
        //     '\\star',
        //     '\\times',
        //     '\\doteq',
        //     '\\doteqdot'
        //   ]
        // },
        '[separator-10]',
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
          command: 'performWithFeedback(moveToPreviousChar)',
          // shift: {
          //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-left /></svg>',
          //   command: 'performWithFeedback(extendSelectionBackward)'
          // }
        },
        {
          class: 'action',
          label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
          command: 'performWithFeedback(moveToNextChar)',
          // shift: {
          //   label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-right /></svg>',
          //   command: 'performWithFeedback(extendSelectionForward)'
          // }
        },
        {
          label: '[backspace]',
          width: 1.0,
          class: 'action'
        },
        // { label: '[action]', width: 1.0 }
      ]
    ]
  }
};

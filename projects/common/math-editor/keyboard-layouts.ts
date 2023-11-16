import { VirtualKeyboardLayout } from 'mathlive';

export class KeyboardLayouts {
  static createFormulaKeyboardLayout(): VirtualKeyboardLayout {
    return {
      label: 'Formel',
      labelClass: 'MLK__tex-math',
      rows: [
        [
          { label: '7', key: '7' },
          { label: '8', key: '8' },
          { label: '9', key: '9' },
          { class: 'separator w5' },
          { latex: '+' },
          { class: 'separator w5' },
          { latex: '<' },
          { latex: '>' },
          { latex: '\\ne' },
          { class: 'separator w5' },
          { latex: '€' },
          { class: 'separator w5' },
          { label: '<span><i>x</i>&thinsp;²</span>', insert: '$$#@^{2}$$' },
          { latex: '$$#@^{#?}' },
          { latex: '$$#@_{#?}' }
        ],
        [
          { label: '4', latex: '4' },
          { label: '5', key: '5' },
          { label: '6', key: '6' },
          { class: 'separator w5' },
          { latex: '-' },
          { class: 'separator w5' },
          { latex: '\\le' },
          { latex: '\\ge' },
          { latex: '\\approx' },
          { class: 'separator w5' },
          { latex: '\\%' },
          { class: 'separator w5' },
          { class: 'small', latex: '\\frac{#0}{#0}' },
          { latex: '\\sqrt{#0}', insert: '$$\\sqrt{#0}$$' },
          { class: 'separator' }
        ],
        [
          { label: '1', key: '1' },
          { label: '2', key: '2' },
          { label: '3', key: '3' },
          { class: 'separator w5' },
          { latex: '\\times' },
          { class: 'separator w5' },
          { latex: '(' },
          { latex: ')' },
          { latex: '\\Rightarrow' },
          { class: 'separator w5' },
          { latex: '°' },
          { class: 'separator w5' },
          { latex: '\\overline' },
          { class: 'separator' },
          { class: 'separator' }
        ],
        [
          { label: '0', key: '0' },
          { latex: ',' },
          { latex: '=' },
          { class: 'separator w5' },
          { latex: '\\div' },
          { class: 'separator w5' },
          { latex: '[' },
          { latex: ']' },
          { latex: '\\Leftrightarrow' },
          { class: 'separator w5' },
          { latex: '\\mid' },
          { class: 'separator w5' },
          { class: 'separator w20' },
          {
            class: 'action font-glyph bottom right',
            label: '&#x232b;',
            command: ['performWithFeedback', 'deleteBackward']
          }
        ]
      ]
    };
  }

  static createAlphabeticKeyboardLayout(): VirtualKeyboardLayout {
    return {
      label: 'abc',
      labelClass: 'MLK__tex-math',
      rows: [
        [
          {
            label: 'q',
            class: 'hide-shift',
            shift: {
              label: 'Q'
            },
            variants: 'q'
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
            },
            variants: 'e'
          },
          {
            label: 'r',
            class: 'hide-shift',
            shift: {
              label: 'R'
            },
            variants: 'r'
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
            },
            variants: 'z'
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
            },
            variants: 'i'
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
            },
            variants: 'p'
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
            },
            variants: 'a'
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
            },
            variants: 'd'
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
            },
            variants: 'g'
          },
          {
            label: 'h',
            class: 'hide-shift',
            shift: {
              label: 'H'
            },
            variants: 'h'
          },
          {
            label: 'j',
            class: 'hide-shift',
            shift: {
              label: 'J'
            },
            variants: 'j'
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
            },
            variants: 'l'
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
            },
            variants: 'c'
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
            },
            variants: 'b'
          },
          {
            label: 'n',
            class: 'hide-shift',
            shift: {
              label: 'N'
            },
            variants: 'n'
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
            command: [
              'performWithFeedback',
              'deleteBackward'
            ],
            label: '<svg class=svg-glyph><use xlink:href=#svg-delete-backward /></svg>',
            shift: {
              class: 'action warning',
              label: '<svg class=svg-glyph><use xlink:href=#svg-trash /></svg>',
              command: 'deleteAll'
            }
          }
        ],
        [
          {
            variants: [
              '\\pm',
              '\\ominus'
            ],
            latex: '-',
            label: '&#x2212;',
            shift: '\\pm',
            class: 'big-op hide-shift'
          },
          {
            variants: [
              {
                latex: '\\sum_{#0}^{#0}',
                class: 'small'
              },
              '\\oplus'
            ],
            latex: '+',
            label: '+',
            class: 'big-op hide-shift',
            shift: {
              latex: '\\sum',
              insert: '\\sum',
              class: 'small'
            }
          },
          {
            variants: [
              '\\neq',
              '\\equiv',
              '\\varpropto',
              '\\thickapprox',
              '\\lt',
              '\\gt',
              '\\le',
              '\\ge'
            ],
            latex: '=',
            label: '=',
            shift: {
              label: '≠',
              latex: '\\ne'
            },
            class: 'big-op hide-shift'
          },
          {
            label: ' ',
            width: 1.5
          },
          {
            label: ',',
            shift: ';',
            variants: '.',
            class: 'hide-shift'
          },
          {
            variants: '.',
            command: [
              'performWithFeedback',
              'insertDecimalSeparator'
            ],
            shift: ',',
            class: 'big-op hide-shift',
            label: '.'
          },
          {
            class: 'action hide-shift',
            label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-left /></svg>',
            command: [
              'performWithFeedback',
              'moveToPreviousChar'
            ],
            shift: {
              label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-left /></svg>',
              command: [
                'performWithFeedback',
                'extendSelectionBackward'
              ]
            }
          },
          {
            class: 'action hide-shift',
            label: '<svg class=svg-glyph><use xlink:href=#svg-arrow-right /></svg>',
            command: [
              'performWithFeedback',
              'moveToNextChar'
            ],
            shift: {
              label: '<svg class=svg-glyph><use xlink:href=#svg-angle-double-right /></svg>',
              command: [
                'performWithFeedback',
                'extendSelectionForward'
              ]
            }
          },
          {
            class: 'action hide-shift',
            command: [
              'performWithFeedback',
              'commit'
            ],
            shift: {
              label: '<svg class=svg-glyph><use xlink:href=#circle-plus /></svg>',
              command: [
                'performWithFeedback',
                'addRowAfter'
              ]
            },
            width: 1.5,
            label: '<svg class=svg-glyph><use xlink:href=#svg-commit /></svg>'
          }
        ]
      ]
    };
  }

  static createGreekKeyboardLayout(): VirtualKeyboardLayout {
    return {
      label: '&alpha;&beta;&gamma;',
      labelClass: 'MLK__tex-math',
      rows: [
        [
          {
            label: '<i>&#x03c6;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\varphi',
            aside: 'phi var.',
            shift: '\\Phi'
          },
          {
            label: '<i>&#x03c2;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\varsigma',
            aside: 'sigma var.',
            shift: '\\Sigma'
          },
          {
            label: '<i>&#x03f5;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\epsilon',
            aside: 'espilon',
            shift: '\\char"0190'
          },
          {
            label: '<i>&rho;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\rho',
            aside: 'rho',
            shift: '\\char"3A1'
          },
          {
            label: '<i>&tau;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\tau',
            aside: 'tau',
            shift: '\\char"3A4'
          },
          {
            label: '<i>&upsilon;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\upsilon',
            aside: 'upsilon',
            shift: '\\Upsilon'
          },
          {
            label: '<i>&theta;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\theta',
            aside: 'theta',
            shift: '\\Theta'
          },
          {
            label: '<i>&iota;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\iota',
            aside: 'iota',
            shift: '\\char"399'
          },
          {
            label: '<i>&omicron;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\omicron',
            aside: 'omicron',
            shift: '\\char"39F'
          },
          {
            label: '<i>&pi;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\pi',
            aside: 'pi',
            shift: '\\Pi'
          }
        ],
        [
          '[separator-5]',
          {
            label: '<i>&alpha;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\alpha',
            aside: 'alpha',
            shift: '\\char"391'
          },
          {
            label: '<i>&sigma;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\sigma',
            aside: 'sigma',
            shift: '\\Sigma'
          },
          {
            label: '<i>&delta;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\delta',
            aside: 'delta',
            shift: '\\Delta'
          },
          {
            label: '<i>&phi;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\phi',
            aside: 'phi',
            shift: '\\Phi'
          },
          {
            label: '<i>&gamma;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\gamma',
            aside: 'gamma',
            shift: '\\Gamma'
          },
          {
            label: '<i>&eta;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\eta',
            aside: 'eta',
            shift: '\\char"397'
          },
          {
            label: '<i>&xi;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\xi',
            aside: 'xi',
            shift: '\\Xi'
          },
          {
            label: '<i>&kappa;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\kappa',
            aside: 'kappa',
            shift: '\\Kappa'
          },
          {
            label: '<i>&lambda;</i>',
            class: 'MLK__tex hide-shift',
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
            class: 'MLK__tex hide-shift',
            insert: '\\zeta',
            aside: 'zeta',
            shift: '\\char"396'
          },
          {
            label: '<i>&chi;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\chi',
            aside: 'chi',
            shift: '\\char"3A7'
          },
          {
            label: '<i>&psi;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\psi',
            aside: 'zeta',
            shift: '\\Psi'
          },
          {
            label: '<i>&omega;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\omega',
            aside: 'omega',
            shift: '\\Omega'
          },
          {
            label: '<i>&beta;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\beta',
            aside: 'beta',
            shift: '\\char"392'
          },
          {
            label: '<i>&nu;</i>',
            class: 'MLK__tex hide-shift',
            insert: '\\nu',
            aside: 'nu',
            shift: '\\char"39D'
          },
          {
            label: '<i>&mu;</i>',
            class: 'MLK__tex hide-shift',
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
            aside: 'espilon var.'
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

          '[left]',
          '[right]',
          '[action]'
        ]
      ]
    };
  }
}

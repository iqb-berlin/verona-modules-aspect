import { InputAssistancePreset } from 'common/models/input-element-interfaces';

/* The arrow keys the keypad offers and the restriction lets through -- one list, so a key the
   keypad renders cannot be one the restriction blocks. */
export const ARROW_KEYS: string[] = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

export interface KeyInputLayout {
  default: string[][],
  shift: string[][],
  additional: string[][]
}

export class KeyLayout {
  static get = (
    preset: InputAssistancePreset | 'keyboard',
    customKeys: string = '',
    hasBackspaceKey: boolean = false
  ): KeyInputLayout => {
    switch (preset) {
      case 'french': {
        return {
          default: [
            ['â', 'à', 'æ', 'ê', 'è', 'é', 'ë', 'î'],
            ['ï', 'ô', 'ò', 'œ', 'û', 'ù', 'ü', 'ç'],
            ['Shift']
          ],
          shift: [
            ['Â', 'À', 'Æ', 'Ê', 'È', 'É', 'Ë', 'Î'],
            ['Ï', 'Ô', 'ò', 'Œ', 'Û', 'ù', 'Ü', 'Ç'],
            ['ShiftUp']
          ],
          additional: [[]]
        };
      }
      case 'comparisonOperators': {
        return {
          default: [
            ['<', '=', '>'],
            ['Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'numbersAndOperators': {
        return {
          default: [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['0', 'Backspace']
          ],
          shift: [[]],
          additional: [
            ['+', '-'],
            ['·', ':'], // '·' = U+00B7
            ['=']
          ]
        };
      }
      case 'numbersAndBasicOperators': {
        return {
          default: [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['0', 'Backspace']
          ],
          shift: [[]],
          additional: [
            ['+', '-'],
            ['·', ':'] // '·' = U+00B7
          ]
        };
      }
      case 'chemicalEquation': {
        return {
          default: [
            ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇'],
            ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷'],
            ['⁺', '⁻', '→', '↔', '⇌', '+', '(', ')']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'squareDashDot': {
        return {
          default: [
            ['⬜', '❘', '∙'], // U+2B1C, U+2758, U+2219
            ['Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'placeValue': {
        return {
          default: [
            ['•', 'Backspace'] // U+2022
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'decimals': {
        return {
          default: [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['-', '0', ','],
            ['Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'numbers': {
        return {
          default: [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['0', 'Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'space': {
        return {
          default: [
            [' ', 'Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'comma': {
        return {
          default: [
            [',', 'Backspace']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'keyboard': {
        return {
          default: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', 'Backspace'],
            ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', 'Return'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
            ['Shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-', 'Shift'],
            ['Space', 'close']
          ],
          shift: [
            ['!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', 'Backspace'],
            ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', 'Return'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
            ['ShiftUp', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':', '_', 'ShiftUp'],
            ['Space', 'close']
          ],
          additional: [[]]
        };
      }
      default: { // custom
        const keys = hasBackspaceKey ? customKeys.split('').concat('Backspace') : customKeys.split('');
        return {
          default: [
            keys
          ],
          shift: [[]],
          additional: [[]]
        };
      }
    }
  };

  /* Which keys a preset may produce. Every layer counts, the shift layer included: the keypad offers
     its uppercase characters, so they have to be as typeable and as deletable as the lowercase ones
     -- otherwise one of them lands in the field and no backspace gets it out again (#1291). Only the
     multi character entries drop out ('Shift', 'Backspace'): those are commands, not characters. */
  static getAllowedKeys = (
    preset: InputAssistancePreset | 'keyboard',
    customKeys: string = '',
    hasBackspaceKey: boolean = false,
    hasReturnKey: boolean = false
  ): string[] => {
    const layout = KeyLayout.get(preset, customKeys, hasBackspaceKey);
    const keys = [...layout.default, ...layout.shift, ...layout.additional]
      .flat()
      .filter(key => key.length === 1);
    return [...new Set(hasReturnKey ? [...keys, '\n'] : keys)];
  };
}

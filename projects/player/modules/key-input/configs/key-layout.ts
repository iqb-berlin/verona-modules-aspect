import { InputAssistancePreset } from 'common/models/elements/element';

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
            ['Ï', 'Ô', 'Ò', 'Œ', 'Û', 'Ù', 'Ü', 'Ç'],
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
            ['Space']
          ],
          shift: [
            ['!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', 'Backspace'],
            ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', 'Return'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
            ['ShiftUp', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':', '_', 'ShiftUp'],
            ['Space']
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
}

import { InputAssistancePreset } from '../../../../common/interfaces/elements';

export class KeyLayout {
  static get = (preset: InputAssistancePreset): { default: string[][], shift: string[][], additional: string[][] } => {
    switch (preset) {
      case 'french': {
        return {
          default: [
            ['â', 'à', 'æ', 'ê', 'è', 'é', 'ë', 'î'],
            ['ï', 'ô', 'ò', 'œ', 'û', 'ù', 'ü', 'ç']
          ],
          shift: [
            ['Â', 'À', 'Æ', 'Ê', 'È', 'É', 'Ë', 'Î'],
            ['Ï', 'Ô', 'Ò', 'Œ', 'Û', 'Ù', 'Ü', 'Ç']
          ],
          additional: [[]]
        };
      }
      case 'comparisonOperators': {
        return {
          default: [
            ['<', '=', '>']
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
            ['0']
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
            ['0']
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
            ['⬜', '❘', '∙'] // U+2B1C, U+2758, U+2219
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      case 'placeValue': {
        return {
          default: [
            ['•'] // U+2022
          ],
          shift: [[]],
          additional: [[]]
        };
      }
      default: { // numbers
        return {
          default: [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
            ['0']
          ],
          shift: [[]],
          additional: [[]]
        };
      }
    }
  };
}

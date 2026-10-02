import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoIssue, VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';
import { IdReplacement } from 'editor/src/app/utils/id-replacement';

function issue(part: 'id' | 'alias', value: string, code: VariableInfoIssueCode): VariableInfoIssue {
  return {
    index: 0, part, value, code
  };
}

function elementFinding(element: UIElement, issues: VariableInfoIssue[], subValue?: string): VariableInfoFinding {
  return {
    origin: {
      info: {} as VariableInfo,
      location: {
        pageIndex: 0, sectionIndex: 0, element, navigationElement: element
      },
      property: subValue === undefined ? 'alias' : 'trackedVariables',
      ...(subValue === undefined ? {} : { subValue })
    },
    issues,
    holdsBackList: issues.some(found => found.part === 'alias')
  };
}

describe('IdReplacement', () => {
  const element = (id: string): UIElement => ({ id, alias: 'alias', type: 'text-field' } as UIElement);

  describe('which finding replacing an id clears', () => {
    it('should offer an element whose own id breaks the pattern', () => {
      const field = element('Aufgabe 1');

      expect(IdReplacement.targetOf(elementFinding(field, [issue('id', 'Aufgabe 1', 'INVALID_CHARACTERS')])))
        .toEqual({ element: field });
    });

    it('should offer an element whose own id is a duplicate', () => {
      const field = element('Text_1');

      expect(IdReplacement.targetOf(elementFinding(field, [issue('id', 'Text_1', 'DUPLICATE_ID')])))
        .toEqual({ element: field });
    });

    it('should offer a state variable with a finding at its id', () => {
      const stateVariable = new StateVariable('März', 'maerz', '');
      const finding: VariableInfoFinding = {
        origin: { info: {} as VariableInfo, stateVariable, property: 'alias' },
        issues: [issue('id', 'März', 'INVALID_CHARACTERS')],
        holdsBackList: false
      };

      expect(IdReplacement.targetOf(finding)).toEqual({ stateVariable });
    });

    it('should offer the element of a GeoGebra variable whose fault lies in the element id', () => {
      const geometry = element('Geo 1');

      expect(IdReplacement.targetOf(elementFinding(geometry, [issue('id', 'Geo 1_A', 'INVALID_CHARACTERS')], 'A')))
        .toEqual({ element: geometry });
    });

    /* A new element id would not help: the name has to be changed in GeoGebra. */
    it('should not offer anything for a fault in the GeoGebra name', () => {
      const geometry = element('geometry_1');

      expect(IdReplacement.targetOf(elementFinding(geometry, [
        issue('id', 'geometry_1_größe', 'INVALID_CHARACTERS'), issue('alias', 'ggb_größe', 'INVALID_CHARACTERS')
      ], 'größe'))).toBeNull();
    });

    it('should not offer anything for a finding at the alias only', () => {
      const finding = elementFinding(element('text-field_1'), [issue('alias', 'März', 'INVALID_CHARACTERS')]);

      expect(IdReplacement.targetOf(finding)).toBeNull();
    });
  });

  /* Asked right before each replacement: of two ids that differ only in letter case one replacement is enough. */
  describe('whether an id still needs replacing', () => {
    it('should say so for an id that breaks the pattern', () => {
      expect(IdReplacement.needsReplacement('Aufgabe 1', [])).toBe(true);
    });

    it('should say so while another id differs only in letter case', () => {
      expect(IdReplacement.needsReplacement('Text_1', ['text_1'])).toBe(true);
    });

    it('should say no once the id stands alone and follows the pattern', () => {
      expect(IdReplacement.needsReplacement('Text_1', ['text-field_2'])).toBe(false);
    });
  });
});

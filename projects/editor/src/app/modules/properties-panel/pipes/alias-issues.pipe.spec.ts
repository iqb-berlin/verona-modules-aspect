import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UIElement } from 'common/models/elements/element';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoIssue } from 'editor/src/app/utils/variable-info-validator';
import { AliasIssuesPipe } from 'editor/src/app/modules/properties-panel/pipes/alias-issues.pipe';

describe('AliasIssuesPipe', () => {
  const pipe = new AliasIssuesPipe();
  const element = { id: 'text-field_3', alias: 'März' } as UIElement;
  const finding = (issues: VariableInfoIssue[], subValue?: string): VariableInfoFinding => ({
    origin: {
      info: {} as VariableInfo,
      location: {
        pageIndex: 1, sectionIndex: 0, element, navigationElement: element
      },
      property: subValue === undefined ? 'alias' : 'trackedVariables',
      ...(subValue === undefined ? {} : { subValue })
    },
    issues,
    isCorrectable: true
  });
  const issue = (part: 'id' | 'alias', code: VariableInfoIssue['code']): VariableInfoIssue => ({
    index: 0, part, value: 'März', code
  });

  /* Stored that way, the name stood in the field unremarked while the validation area listed it (#1129). */
  it('should name why the alias of the element breaks the contract, each reason once', () => {
    const findings = [finding([issue('id', 'INVALID_CHARACTERS'), issue('alias', 'INVALID_CHARACTERS')]),
      finding([issue('alias', 'DUPLICATE_ALIAS'), issue('alias', 'INVALID_CHARACTERS')])];

    expect(pipe.transform(findings, 'text-field_3')).toEqual(['INVALID_CHARACTERS', 'DUPLICATE_ALIAS']);
  });

  it('should say nothing about another element, or about the id, which the field does not change', () => {
    expect(pipe.transform([finding([issue('alias', 'INVALID_CHARACTERS')])], 'text-field_1')).toEqual([]);
    expect(pipe.transform([finding([issue('id', 'INVALID_CHARACTERS')])], 'text-field_3')).toEqual([]);
  });

  it('should leave a GeoGebra name to GeoGebra', () => {
    expect(pipe.transform([finding([issue('alias', 'INVALID_CHARACTERS')], 'fistgewählt')], 'text-field_3'))
      .toEqual([]);
  });

  it('should cope with no findings yet', () => {
    expect(pipe.transform(null, 'text-field_3')).toEqual([]);
  });
});

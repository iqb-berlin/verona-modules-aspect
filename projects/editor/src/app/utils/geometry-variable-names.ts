import { GeometryVariable } from 'common/models/geometry-interfaces';
import { VariableAlias } from 'common/utils/variable-alias';

/** What is wrong with a GeoGebra object name as part of a variable identifier. */
export type GeometryVariableNameIssue = 'INVALID_CHARACTERS' | 'DUPLICATE_ALIAS';

/**
 * The rule for GeoGebra object names that become part of a variable identifier (`<alias>_<name>`). GeoGebra allows
 * umlauts, Greek letters and primes, and tells `A` from `a`; the Verona contract allows neither (#1129). Two names
 * of one element that differ only in letter case give two identifiers that do, which is why the chosen names of the
 * element are all this needs to know -- the comparison itself is `VariableAlias.toComparable`, as everywhere else.
 */
export abstract class GeometryVariableNames {
  static findIssue(name: string, chosen: GeometryVariable[]): GeometryVariableNameIssue | null {
    if (VariableAlias.check(name)) return 'INVALID_CHARACTERS';
    const comparable = VariableAlias.toComparable(name);
    return chosen.some(variable => variable.id !== name && VariableAlias.toComparable(variable.id) === comparable) ?
      'DUPLICATE_ALIAS' :
      null;
  }
}

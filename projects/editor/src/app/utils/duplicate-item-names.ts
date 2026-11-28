import { Unit } from 'common/models/unit';
import { DropListElement } from 'common/models/elements/drop-list';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { VariableAlias } from 'common/utils/variable-alias';
import { ElementLocator } from 'editor/src/app/utils/element-locator';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';

/** A drop-list item whose name another item of the unit carries as well, and where its list sits. */
export interface DuplicateItemName {
  location: VariableInfoLocation;
  item: DragNDropValueObject;
}

/**
 * Finds the drop-list items whose name (`alias`) another item of the unit carries as well (#1741). A response stores
 * the name of the item, and a list takes the items of the lists connected to it as its values: two items under one
 * name are two answers nobody can tell apart. The variable list's spec asks for no unique values, so this is a hint
 * of its own rather than a finding about a variable. Names are compared as the registry compares them, regardless of
 * letter case; an item's name equal to an element's is left out, as it makes no response ambiguous.
 */
export abstract class DuplicateItemNames {
  /** Every item that shares its name, each of them, in the order of the unit. */
  static collect(unit: Unit): DuplicateItemName[] {
    const entries = (unit.getAllElements('drop-list') as DropListElement[])
      .flatMap(dropList => dropList.value.map(item => ({ dropList, item })))
      // An item without a name has none to share; asked on every change, it must not throw either.
      .filter(({ item }) => !!item.alias);
    const counts = new Map<string, number>();
    entries.forEach(({ item }) => {
      const name = VariableAlias.toComparable(item.alias);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return entries
      .filter(({ item }) => (counts.get(VariableAlias.toComparable(item.alias)) ?? 0) > 1)
      .map(({ dropList, item }) => ({ location: ElementLocator.locate(unit, dropList), item }))
      .filter((duplicate): duplicate is DuplicateItemName => duplicate.location !== null);
  }
}

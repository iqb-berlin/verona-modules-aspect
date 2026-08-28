import { DropListComponent } from 'common/components/elements/drop-list/drop-list.component';
import { DragNDropValueObject } from 'common/models/label-interfaces';

/**
 * Whether a drop is allowed, decided on `DropListMock`s rather than on the components themselves --
 * which is what makes this logic testable without rendering a list.
 */
export class DropLogic {
  /**
   * A snapshot of what a list currently holds and what it permits. The item array and the connection
   * list are copied, so a later drop does not change the snapshot -- but the dragged items inside the
   * array are the components' own objects, not copies.
   */
  static createDropListMock(dropListComp: DropListComponent): DropListMock {
    return {
      id: dropListComp.elementModel.id,
      value: [...dropListComp.elementFormControl.value],
      isSortList: dropListComp.elementModel.isSortList,
      onlyOneItem: dropListComp.elementModel.onlyOneItem,
      connectedTo: [...dropListComp.elementModel.connectedTo],
      copyOnDrop: dropListComp.elementModel.copyOnDrop,
      allowReplacement: dropListComp.elementModel.allowReplacement,
      permanentPlaceholders: dropListComp.elementModel.permanentPlaceholders
    };
  }

  /** One snapshot per list, keyed as the source was -- the whole board a single drop is judged against. */
  static createDropListMocks(source: { [id: string]: DropListComponent }): { [id: string]: DropListMock } {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => [
        key,
        DropLogic.createDropListMock(value)
      ])
    );
  }

  /**
   * Whether this item may be dropped from the source list into the target list. All four conditions
   * have to hold: the target is another list (or the same one, if it sorts), the two are connected,
   * a target that takes only one item is empty or can have its item replaced, and a copy list or one
   * with permanent placeholders only takes back what came from it.
   *
   * `allLists` has to hold the source and the target; a missing entry is not caught here. Set
   * `ignoreConnection` to skip the connection check -- `isReplace` uses it to ask whether the item
   * being pushed out could go home.
   */
  static isDropAllowed(draggedItem: DragNDropValueObject,
                       sourceListID: string,
                       targetListID: string,
                       allLists: { [id: string]: DropListMock },
                       ignoreConnection: boolean = false): boolean {
    const sourceList = allLists[sourceListID];
    const targetList = allLists[targetListID];
    return DropLogic.checkIsSourceList(sourceList, targetList) &&
      DropLogic.checkConnected(sourceList, targetList, ignoreConnection) &&
      DropLogic.checkOnlyOneItem(draggedItem, targetList, allLists) &&
      DropLogic.checkAddForeignItemToCopyOrCCList(draggedItem, targetList);
  }

  /** Only allow drops in other lists, except for sortlists. */
  private static checkIsSourceList(sourceList: DropListMock, targetList: DropListMock): boolean {
    return (sourceList.id === targetList.id && sourceList.isSortList) ||
    sourceList.id !== targetList.id;
  }

  /** Check list connection, sortlist is an exception since source and target can be the same. */
  private static checkConnected(sourceList: DropListMock,
                                targetList: DropListMock, ignoreConnection: boolean = false): boolean {
    return ignoreConnection ||
      (sourceList.id === targetList.id && sourceList.isSortList) ||
      sourceList.connectedTo.includes(targetList.id);
  }

  // ### Only One Item ###

  /** Return false, when drop is not allowed */
  private static checkOnlyOneItem(draggedItem: DragNDropValueObject, targetList: DropListMock,
                                  allLists: { [id: string]: DropListMock }): boolean {
    return !(targetList.onlyOneItem &&
      targetList.value.length > 0 &&
      !DropLogic.isReplace(draggedItem, targetList, allLists));
  }

  /**
   * Whether dropping onto a full one-item list would replace its item instead of being refused. True
   * only if the list allows replacement, holds exactly one item that is not at home in it, and that
   * item may go back where it came from.
   *
   * Leaves every list it is given as it found it, so the same board can be judged again and answers the
   * same -- which is what `DragOperation` would need to build its board once per drag rather than once
   * per candidate.
   */
  static isReplace(draggedItem: DragNDropValueObject, targetList: DropListMock,
                   allLists: { [id: string]: DropListMock }): boolean {
    if (!(targetList.onlyOneItem && targetList.value.length === 1 && targetList.allowReplacement)) {
      return false;
    }
    // Item is already in it's origin
    if (targetList.value[0].originListID === targetList.id) {
      return false;
    }

    /* The swap is what ends the recursion, not a shortcut: two lists holding each other's items would
       otherwise ask each other the same question forever -- `doesnt enter endless loop when replacing
       items` in the spec is that case. While the question below is being answered, this list therefore
       holds the dragged item, and the displaced one is out of the way. Putting it back afterwards is
       what keeps the answer from changing the board it was asked about (#1381). */
    const rest = targetList.value.splice(0, 1, draggedItem)[0];
    try {
      return DropLogic.isDropAllowed(
        rest,
        targetList.id,
        allLists[rest.originListID].id,
        allLists,
        true
      );
    } finally {
      // in a finally, because the lookup above throws for an item whose origin list is not on the board
      targetList.value.splice(0, 1, rest);
    }
  }

  // ### Copy List ###

  /**
   * Whether the item is returning to the copy list it came from. `DragOperatorService.addItem` then
   * adds nothing: the original never left the list, so the copy being dragged simply disappears
   * instead of doubling an entry.
   */
  static isPutBack(draggedItem: DragNDropValueObject, targetList: DropListMock): boolean {
    return targetList.copyOnDrop && draggedItem.originListID === targetList.id;
  }

  /** Don't allow moving item into copy or CC list that does not originate from there. */
  private static checkAddForeignItemToCopyOrCCList(draggedItem: DragNDropValueObject | undefined,
                                                   targetList: DropListMock): boolean {
    return !((targetList.copyOnDrop || targetList.permanentPlaceholders) &&
      draggedItem?.originListID !== targetList.id);
  }
}

export interface DropListMock {
  id: string;
  value: DragNDropValueObject[];
  isSortList: boolean;
  onlyOneItem: boolean;
  connectedTo: string[];
  copyOnDrop: boolean;
  allowReplacement: boolean;
  permanentPlaceholders: boolean;
}

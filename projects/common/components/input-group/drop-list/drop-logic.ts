import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { DragNDropValueObject } from 'common/interfaces';

export class DropLogic {
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

  static createDropListMocks(source: { [id: string]: DropListComponent }): { [id: string]: DropListMock } {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => [
        key,
        DropLogic.createDropListMock(value)
      ])
    );
  }

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

  /* Only allow drops in other lists, except for sortlists. */
  private static checkIsSourceList(sourceList: DropListMock, targetList: DropListMock): boolean {
    return (sourceList.id === targetList.id && sourceList.isSortList) ||
    sourceList.id !== targetList.id;
  }

  /* Check list connection, sortlist is an exception since source and target can be the same. */
  private static checkConnected(sourceList: DropListMock,
                                targetList: DropListMock, ignoreConnection: boolean = false): boolean {
    return ignoreConnection ||
      (sourceList.id === targetList.id && sourceList.isSortList) ||
      sourceList.connectedTo.includes(targetList.id);
  }

  // ### Only One Item ###

  /* Return false, when drop is not allowed */
  private static checkOnlyOneItem(draggedItem: DragNDropValueObject, targetList: DropListMock,
                                  allLists: { [id: string]: DropListMock }): boolean {
    return !(targetList.onlyOneItem &&
      targetList.value.length > 0 &&
      !DropLogic.isReplace(draggedItem, targetList, allLists));
  }

  static isReplace(draggedItem: DragNDropValueObject, targetList: DropListMock,
                   allLists: { [id: string]: DropListMock }): boolean {
    if (!(targetList.onlyOneItem && targetList.value.length === 1 && targetList.allowReplacement)) {
      return false;
    }
    // Item is already in it's origin
    if (targetList.value[0].originListID === targetList.id) {
      return false;
    }

    const rest = targetList.value.splice(0, 1, draggedItem)[0];
    return DropLogic.isDropAllowed(
      rest,
      targetList.id,
      allLists[rest.originListID].id,
      allLists,
      true
    );
  }

  // ### Copy List ###

  static isPutBack(draggedItem: DragNDropValueObject, targetList: DropListMock): boolean {
    return targetList.copyOnDrop && draggedItem.originListID === targetList.id;
  }

  /* Don't allow moving item into copy or CC list that does not originate from there. */
  private static checkAddForeignItemToCopyOrCCList(draggedItem: DragNDropValueObject | undefined,
                                                   targetList: DropListMock): boolean {
    return !((targetList.copyOnDrop || targetList.permanentPlaceholders) && draggedItem?.originListID !== targetList.id);
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

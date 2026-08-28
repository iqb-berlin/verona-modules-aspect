import { DropListMock, DropLogic } from 'common/utils/drop-logic';
import { DragNDropValueObject } from 'common/models/label-interfaces';

describe('DropLogic', () => {
  const dragItemPreset: DragNDropValueObject = {
    id: 'testID',
    alias: 'testAlias',
    text: 'bla',
    originListID: 'droplist_1',
    originListIndex: 0,
    imgSrc: null,
    imgFileName: '',
    audioSrc: null,
    audioFileName: '',
    imgPosition: 'above'
  };

  let allListsPreset: { [id: string]: DropListMock } = {
    droplist_1: {
      id: 'droplist_1',
      value: [dragItemPreset],
      isSortList: false,
      onlyOneItem: false,
      connectedTo: ['droplist_2'],
      copyOnDrop: false,
      allowReplacement: false,
      permanentPlaceholders: false
    },
    droplist_2: {
      id: 'droplist_2',
      value: [],
      isSortList: false,
      onlyOneItem: false,
      connectedTo: [],
      copyOnDrop: false,
      allowReplacement: false,
      permanentPlaceholders: false
    }
  };

  beforeEach(() => {
    allListsPreset = {
      droplist_1: {
        id: 'droplist_1',
        value: [dragItemPreset],
        isSortList: false,
        onlyOneItem: false,
        connectedTo: ['droplist_2'],
        copyOnDrop: false,
        allowReplacement: false,
        permanentPlaceholders: false
      },
      droplist_2: {
        id: 'droplist_2',
        value: [],
        isSortList: false,
        onlyOneItem: false,
        connectedTo: [],
        copyOnDrop: false,
        allowReplacement: false,
        permanentPlaceholders: false
      }
    };
  });

  it('fail if dropping into startlist', () => {
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_1', allListsPreset))
      .toBe(false);
  });

  it('allow dropping into startlist if it is a sortlist', () => {
    const allLists = { ...allListsPreset };
    allLists.droplist_1.isSortList = true;
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_1', allLists))
      .toBe(true);
  });

  it('fail if dropping into NOT connected list', () => {
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_2', 'droplist_1', allListsPreset))
      .toBe(false);
  });

  it('pass if dropping into another connected list', () => {
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allListsPreset))
      .toBe(true);
  });

  // ### Put back (Copy-lists) ###

  it('pass if putting a copied item back to its origin', () => {
    const draggedItem = { ...dragItemPreset, originListID: 'droplist_1' };
    const allLists = { ...allListsPreset };
    allLists.droplist_1.copyOnDrop = true;
    expect(DropLogic.isPutBack(draggedItem, allLists.droplist_1)).toBe(true);
  });

  it('fail if moving a foreign item to a copy-list', () => {
    const draggedItem = { ...dragItemPreset, originListID: 'droplist_2' };
    const allLists = { ...allListsPreset };
    allLists.droplist_1.copyOnDrop = true;
    expect(DropLogic.isPutBack(draggedItem, allLists.droplist_1)).toBe(false);
  });

  // ### Only One Item ###

  it('pass if putting an item to an empty only-one list', () => {
    const allLists = { ...allListsPreset };
    allLists.droplist_2.onlyOneItem = true;
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allLists))
      .toBe(true);
  });

  it('fail if putting an item to a only-one list which contains an item', () => {
    // const targetList = { ...testList2, onlyOneItem: true, value: [dragItemPreset] };
    const allLists = { ...allListsPreset };
    allLists.droplist_2.onlyOneItem = true;
    allLists.droplist_2.value = [dragItemPreset];
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allLists))
      .toBe(false);
  });

  it('pass if putting an item to an only-one list, where item is replaceable', () => {
    const allLists = { ...allListsPreset };
    allLists.droplist_2.onlyOneItem = true;
    allLists.droplist_2.allowReplacement = true;
    allLists.droplist_2.value = [dragItemPreset];
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allLists))
      .toBe(true);
  });

  it('fail if putting an item to an only-one list, where item is replaceable, but already in its origin', () => {
    const allLists = { ...allListsPreset };
    allLists.droplist_2.onlyOneItem = true;
    allLists.droplist_2.allowReplacement = true;
    allLists.droplist_2.value = [{ ...dragItemPreset, originListID: 'droplist_2' }];
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allLists))
      .toBe(false);
  });

  it('doesnt enter endless loop when replacing items', () => {
    const dragItem = { ...dragItemPreset, id: 'testID3', originListID: 'droplist_3' };
    const list1 = {
      id: 'droplist_1',
      connectedTo: ['droplist_2', 'droplist_3'],
      onlyOneItem: true,
      allowReplacement: true,
      value: [{ ...dragItemPreset, id: 'testID2', originListID: 'droplist_2' }],
      isSortList: false,
      copyOnDrop: false,
      permanentPlaceholders: false
    };
    const list2 = {
      id: 'droplist_2',
      connectedTo: ['droplist_1', 'droplist_3'],
      onlyOneItem: true,
      allowReplacement: true,
      value: [{ ...dragItemPreset, id: 'testID1', originListID: 'droplist_1' }],
      isSortList: false,
      copyOnDrop: false,
      permanentPlaceholders: false
    };
    const list3 = {
      id: 'droplist_3',
      connectedTo: ['droplist_1', 'droplist_2'],
      onlyOneItem: true,
      allowReplacement: true,
      value: [dragItem],
      isSortList: false,
      copyOnDrop: false,
      permanentPlaceholders: false
    };

    const allLists: { [id: string]: DropListMock } = {
      droplist_1: list1,
      droplist_2: list2,
      droplist_3: list3
    };
    expect(DropLogic.isDropAllowed(dragItem, 'droplist_3', 'droplist_2', allLists)).toBe(false);
  });

  /*
   * The check swaps the dragged item into the target list to end the recursion of the case above, and
   * has to put the displaced one back. Two lists holding each other's items make the swap reach every
   * list on the board (#1381).
   */
  it('leaves the lists it was given as it found them', () => {
    const dragItem = { ...dragItemPreset, id: 'testID3', originListID: 'droplist_3' };
    const inList1 = { ...dragItemPreset, id: 'testID2', originListID: 'droplist_2' };
    const inList2 = { ...dragItemPreset, id: 'testID1', originListID: 'droplist_1' };
    const oneItemList = (id: string, connectedTo: string[], value: DragNDropValueObject[]): DropListMock => ({
      id,
      connectedTo,
      value,
      onlyOneItem: true,
      allowReplacement: true,
      isSortList: false,
      copyOnDrop: false,
      permanentPlaceholders: false
    });
    const allLists: { [id: string]: DropListMock } = {
      droplist_1: oneItemList('droplist_1', ['droplist_2', 'droplist_3'], [inList1]),
      droplist_2: oneItemList('droplist_2', ['droplist_1', 'droplist_3'], [inList2]),
      droplist_3: oneItemList('droplist_3', ['droplist_1', 'droplist_2'], [dragItem])
    };

    DropLogic.isDropAllowed(dragItem, 'droplist_3', 'droplist_1', allLists);

    expect(allLists.droplist_1.value).toEqual([inList1]);
    expect(allLists.droplist_2.value).toEqual([inList2]);
    expect(allLists.droplist_3.value).toEqual([dragItem]);
  });

  /*
   * Which is what lets one board answer for a whole drag instead of one per candidate -- the state
   * `DragOperation` builds inside its filter callback today, with a performance TODO next to it.
   */
  it('judges a candidate on a used board as it would on a fresh one', () => {
    const dragItem = { ...dragItemPreset, id: 'testID3', originListID: 'droplist_3' };
    const oneItemList = (id: string, connectedTo: string[], value: DragNDropValueObject[]): DropListMock => ({
      id,
      connectedTo,
      value,
      onlyOneItem: true,
      allowReplacement: true,
      isSortList: false,
      copyOnDrop: false,
      permanentPlaceholders: false
    });
    // droplist_3 is the plain source the item is dragged out of; 1 and 2 hold each other's items.
    const buildBoard = (): { [id: string]: DropListMock } => ({
      droplist_1: oneItemList('droplist_1', ['droplist_2', 'droplist_3'],
                              [{ ...dragItemPreset, id: 'testID2', originListID: 'droplist_2' }]),
      droplist_2: oneItemList('droplist_2', ['droplist_1', 'droplist_3'],
                              [{ ...dragItemPreset, id: 'testID1', originListID: 'droplist_1' }]),
      droplist_3: {
        id: 'droplist_3',
        connectedTo: ['droplist_1', 'droplist_2'],
        value: [dragItem],
        onlyOneItem: false,
        allowReplacement: false,
        isSortList: false,
        copyOnDrop: false,
        permanentPlaceholders: false
      }
    });

    const onFreshBoard = DropLogic.isDropAllowed(dragItem, 'droplist_3', 'droplist_2', buildBoard());

    const usedBoard = buildBoard();
    DropLogic.isDropAllowed(dragItem, 'droplist_3', 'droplist_1', usedBoard);
    const onUsedBoard = DropLogic.isDropAllowed(dragItem, 'droplist_3', 'droplist_2', usedBoard);

    expect(onUsedBoard).toBe(onFreshBoard);
  });

  it('fail if moving a foreign item to a CC list', () => {
    const allLists = { ...allListsPreset };
    allLists.droplist_2.permanentPlaceholders = true;
    allLists.droplist_2.value = [dragItemPreset];
    expect(DropLogic.isDropAllowed(dragItemPreset, 'droplist_1', 'droplist_2', allLists))
      .toBe(false);
  });

  it('passes if moving a CC\'d item to a CC list', () => {
    const allLists = { ...allListsPreset };
    const draggedItem = { ...dragItemPreset, originListID: 'droplist_2' };
    allLists.droplist_2.permanentPlaceholders = true;
    allLists.droplist_2.value = [dragItemPreset];
    expect(DropLogic.isDropAllowed(draggedItem, 'droplist_1', 'droplist_2', allLists))
      .toBe(true);
    expect(DropLogic.isDropAllowed(draggedItem, 'droplist_1', 'droplist_1', allLists))
      .toBe(false);
  });
});

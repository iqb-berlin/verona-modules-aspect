import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { DropLogic } from 'common/components/input-elements/drop-list/drop-logic';

export class DragOperation {
  sourceElement: HTMLElement;
  draggedItem: DragNDropValueObject;
  sourceComponent: DropListComponent;
  sourceIndex: number;
  targetComponent: DropListComponent | undefined;
  dragType: 'mouse' | 'touch';
  sortingPlaceholderIndex: number | undefined;
  isForeignPlaceholderActive: boolean = false;
  placeholderElement: HTMLElement | undefined;
  eligibleTargetListsIDs: string[]; // helper list for better performance

  constructor(sourceElement: HTMLElement, sourceListComponent: DropListComponent, sourceIndex: number,
              item: DragNDropValueObject, dragType: 'mouse' | 'touch',
              allDropLists: { [id: string]: DropListComponent }) {
    this.sourceElement = sourceElement;
    this.draggedItem = item;
    this.sourceComponent = sourceListComponent;
    this.sourceIndex = sourceIndex;
    this.dragType = dragType;
    if (this.sourceComponent.elementModel.isSortList) this.sortingPlaceholderIndex = sourceIndex;
    this.targetComponent = sourceListComponent;

    this.eligibleTargetListsIDs = Object.values(allDropLists)
      .filter(dropList => (DropLogic.isDropAllowed( // TODO performance!
        this.draggedItem,
        sourceListComponent.elementModel.id,
        allDropLists[dropList.elementModel.id].elementModel.id,
        DropLogic.createDropListMocks(allDropLists))
      ))
      .map(droplist => droplist.elementModel.id);
  }
}

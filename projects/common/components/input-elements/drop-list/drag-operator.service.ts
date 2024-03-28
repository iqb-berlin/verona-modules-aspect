import { Injectable } from '@angular/core';
import { DropListComponent } from 'common/components/input-elements/drop-list/drop-list.component';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';
import { DragOperation } from 'common/components/input-elements/drop-list/drag-operation';

@Injectable({
  providedIn: 'root'
})
export class DragOperatorService {
  dropLists: { [id: string]: DropListComponent } = {};
  dragOperation: DragOperation | undefined;
  isDragActive = false;

  registerComponent(comp: DropListComponent): void {
    this.dropLists[comp.elementModel.id] = comp;
  }

  startDrag(sourceElement: HTMLElement, sourceListComponent: DropListComponent, sourceIndex: number,
            item: DragNDropValueObject, dragType: 'mouse' | 'touch') {
    this.dragOperation =
      new DragOperation(sourceElement, sourceListComponent, sourceIndex, item, dragType, this.dropLists);
    this.isDragActive = true;

    this.initDrag();
  }

  initDrag(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    this.dragOperation.sourceElement?.classList.add('show-as-placeholder');
    this.dragOperation.sourceElement.style.pointerEvents = 'none';

    this.dragOperation.sourceComponent.isHovered = true;

    if (this.dragOperation.sourceComponent.elementModel.highlightReceivingDropList) {
      this.dragOperation.eligibleTargetListsIDs.forEach(listID => {
        this.dropLists[listID].isHighlighted = true; // TODO kapseln
        this.dropLists[listID].cdr.detectChanges();
      });
    }
  }

  endDrag(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    this.isDragActive = false;
    this.dragOperation.sourceElement.classList.remove('show-as-placeholder');
    this.dragOperation.sourceElement.style.pointerEvents = 'auto';
    this.dragOperation.placeholderElement?.classList.remove('show-as-placeholder');
    this.resetListEffects();
  }

  private resetListEffects(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    [...this.dragOperation.eligibleTargetListsIDs, this.dragOperation.sourceComponent.elementModel.id]
      .forEach(listID => {
        this.dropLists[listID].isHovered = false;
        this.dropLists[listID].isHighlighted = false;
        this.dropLists[listID].cdr.detectChanges();
      });
  }

  setTargetList(listId: string): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    const targetListComp = this.dropLists[listId];
    this.dragOperation.targetComponent = targetListComp;
    this.isListHovered = true;
    if (targetListComp.elementModel.isSortList) {
      if (this.dragOperation.sourceComponent !== targetListComp) {
        this.addSortPlaceholder();
      } else {
        this.dragOperation.sortingPlaceholderIndex = this.dragOperation.sourceIndex;
      }
    }
  }

  addSortPlaceholder(): void {
    if (!this.dragOperation?.targetComponent) throw new Error('dragOP undefined');
    this.dragOperation.isForeignPlaceholderActive = true;
    this.dragOperation.sortingPlaceholderIndex =
      this.dragOperation.targetComponent.viewModel.push(this.dragOperation.draggedItem) - 1;
    this.dragOperation.targetComponent.cdr.detectChanges();
    this.dragOperation.placeholderElement =
      this.dragOperation.targetComponent.droplistItems?.toArray()[this.dragOperation.sortingPlaceholderIndex]
        .nativeElement as HTMLElement;
    this.dragOperation.placeholderElement.classList.add('show-as-placeholder');
  }

  unSetTargetList(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    this.dragOperation.targetComponent = undefined;
    this.dragOperation.sortingPlaceholderIndex = undefined;
    this.isListHovered = false;
  }

  positionSortPlaceholder(targetIndex: number): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    const list = this.dragOperation.targetComponent!.viewModel;
    const sourceIndex = this.dragOperation.sortingPlaceholderIndex!;
    const item = list.splice(sourceIndex, 1)[0];
    list.splice(targetIndex, 0, item);
    this.dragOperation.sortingPlaceholderIndex = targetIndex;
  }

  isListEligible(listID: string): boolean {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    return this.dragOperation.eligibleTargetListsIDs.includes(listID);
  }

  handleDrop(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    if (this.dragOperation.sourceComponent && this.dragOperation.targetComponent &&
      DragOperatorService.isDropAllowed(this.dragOperation.draggedItem,
        this.dragOperation.sourceComponent,
        this.dragOperation.targetComponent,
        this.dropLists)) {
      if (this.dragOperation.sourceComponent === this.dragOperation.targetComponent) {
        if (!this.dragOperation.targetComponent.elementModel.isSortList) return;
        const item =
          this.dragOperation.targetComponent!.elementFormControl.value.splice(this.dragOperation.sourceIndex, 1)[0];
        this.dragOperation.targetComponent!.elementFormControl.value
          .splice(this.dragOperation.sortingPlaceholderIndex, 0, item);
      } else {
        this.moveItem(this.dragOperation.draggedItem,
          this.dragOperation.sourceComponent,
          this.dragOperation.sourceIndex,
          this.dragOperation.targetComponent);
      }
      this.dragOperation.sourceComponent?.updateFormvalue();
      this.dragOperation.targetComponent?.updateFormvalue();
      this.dragOperation.sourceComponent?.refreshViewModel();
      this.dragOperation.targetComponent?.refreshViewModel();
    }
  }

  moveItem(item: DragNDropValueObject | undefined,
           sourceList: DropListComponent,
           sourceListIndex: number,
           targetList: DropListComponent): void {
    DragOperatorService.removeItem(sourceList, sourceListIndex);
    this.addItem(item as DragNDropValueObject, targetList);
  }

  static removeItem(list: DropListComponent, index: number): DragNDropValueObject {
    return list.elementModel.copyOnDrop ?
      list.elementFormControl.value[index] :
      list.elementFormControl.value.splice(index, 1)[0];
  }

  addItem(item: DragNDropValueObject, targetList: DropListComponent): void {
    if (DragOperatorService.isPutBack(item, targetList)) {
      return;
    }
    if (DragOperatorService.isReplace(targetList, this.dropLists)) {
      const originList = this.dropLists[targetList.elementFormControl.value[0].originListID];
      this.moveItem(targetList.elementFormControl.value[0], targetList, 0, originList);
      originList.updateFormvalue();
      originList.refreshViewModel();
      originList.cdr.detectChanges();
    }
    // TODO haut logisch noch nicht ganz hin mit den festen Indize
    const targetIndex = this.dragOperation?.sortingPlaceholderIndex !== undefined ?
      this.dragOperation?.sortingPlaceholderIndex :
      targetList.elementFormControl.value.length;
    targetList.elementFormControl.value.splice(targetIndex, 0, item);
  }

  isListHovered = true;

  checkHoveredListOrElement(x: number, y: number): void {
    const el = document.elementFromPoint(x, y);
    const hoveredListID = (el as HTMLElement).closest('.drop-list')?.id;

    if (hoveredListID &&
        this.dragOperation?.eligibleTargetListsIDs.includes(this.dropLists[hoveredListID].elementModel.id)) {
      if (!this.isListHovered) {
        this.dropLists[hoveredListID].dragEnter();
      }
      this.isListHovered = true;
      if (this.dropLists[hoveredListID].elementModel.isSortList) this.checkHoveredListItem(el);
    } else {
      if (this.isListHovered) {
        this.dragOperation?.targetComponent?.dragLeave();
      }
      this.isListHovered = false;
    }
  }

  private checkHoveredListItem(el: Element | null): void {
    const hoveredListItem = el?.closest('.drop-list-item');
    if (hoveredListItem) {
      const targetIndex = Array.from((hoveredListItem.parentNode as HTMLElement).children).indexOf(hoveredListItem);
      this.positionSortPlaceholder(targetIndex);
    }
  }

  static isDropAllowed(draggedItem: DragNDropValueObject | undefined,
                       sourceList: DropListComponent,
                       targetList: DropListComponent,
                       allLists: { [id: string]: DropListComponent },
                       ignoreConnection: boolean = false): boolean {
    return DragOperatorService.checkIsSourceList(sourceList, targetList) &&
      DragOperatorService.checkConnected(sourceList, targetList, ignoreConnection) &&
      DragOperatorService.checkOnlyOneItem(targetList, allLists) &&
      DragOperatorService.checkAddForeignItemToCopyList(draggedItem, targetList);
  }

  /* Only allow drops in other lists, except for sortlists. */
  private static checkIsSourceList(sourceList: DropListComponent, targetList: DropListComponent): boolean {
    return (sourceList.elementModel.id === targetList.elementModel.id && sourceList.elementModel.isSortList) ||
      sourceList.elementModel.id !== targetList.elementModel.id;
  }

  /* Check list connection, sortlist is an exception since source and target can be the same. */
  private static checkConnected(sourceList: DropListComponent, targetList: DropListComponent, ignoreConnection: boolean = false): boolean {
    return ignoreConnection ||
      (sourceList.elementModel.id === targetList.elementModel.id && sourceList.elementModel.isSortList) ||
      sourceList.elementModel.connectedTo.includes(targetList.elementModel.id);
  }

  /* Return false, when drop is not allowed */
  private static checkOnlyOneItem(targetList: DropListComponent,
                                  allLists: { [id: string]: DropListComponent }): boolean {
    return !(targetList.elementModel.onlyOneItem &&
      targetList.elementFormControl.value.length > 0 &&
      !DragOperatorService.isReplace(targetList, allLists));
  }

  /* Don't allow moving item into copy list that not originate from there. */
  private static checkAddForeignItemToCopyList(draggedItem: DragNDropValueObject | undefined,
                                               targetList: DropListComponent): boolean {
    return !(targetList.elementModel.copyOnDrop && draggedItem?.originListID !== targetList.elementModel.id);
  }

  static isPutBack(draggedItem: DragNDropValueObject | undefined, targetList: DropListComponent): boolean {
    return targetList.elementModel.copyOnDrop && draggedItem?.originListID === targetList.elementModel.id;
  }

  static isReplace(targetList: DropListComponent,
                   allLists: { [id: string]: DropListComponent }): boolean {
    return targetList.elementModel.onlyOneItem &&
      targetList.elementFormControl.value.length === 1 &&
      targetList.elementModel.allowReplacement &&
      DragOperatorService.isDropAllowed(
        targetList.elementFormControl.value[0],
        targetList,
        allLists[targetList.elementFormControl.value[0].originListID],
        allLists,
        true
      );
  }
}

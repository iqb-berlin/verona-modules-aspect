import { Injectable } from '@angular/core';
import { DropListComponent } from 'common/components/elements/drop-list/drop-list.component';
import { DragOperation } from 'common/classes/drag-operation';
import { DropLogic } from 'common/utils/drop-logic';
import { DragNDropValueObject } from 'common/models/label-interfaces';

/**
 * Runs a drag from one drop list to another: it knows every list of the unit, holds the one drag that
 * is under way, and moves the item when it is dropped.
 *
 * The player draws the drag itself rather than leaving it to the CDK, so the steps are explicit --
 * `startDrag`, a target list entering and leaving as the pointer travels, `handleDrop`, `endDrag`.
 * Whether a drop is allowed at all is not decided here but in `DropLogic`.
 */
@Injectable({
  providedIn: 'root'
})
export class DragOperatorService {
  dropLists: { [id: string]: DropListComponent } = {};
  /**
   * The drag under way -- and, once one has ended, the last one: nothing ever sets this back to
   * `undefined`. The `if (!this.dragOperation) throw` guards below therefore only cover the state before
   * the first drag.
   */
  dragOperation: DragOperation | undefined;
  /** What actually says whether a drag is running; the drop lists guard their handlers on it. */
  isDragActive = false;

  /** Adds a list to the board every drag is judged against. A list registers itself when it is created
      and gives itself back when it is destroyed. */
  registerComponent(comp: DropListComponent): void {
    this.dropLists[comp.elementModel.id] = comp;
  }

  /**
   * Takes a destroyed list off the board. Guarded on identity rather than on the id alone: the service
   * outlives the task, so a list of the task being built may already hold the id of one being torn
   * down, and dropping that entry would leave a live list out of every drag.
   *
   * Without this the service kept every list ever created, and with it the whole form of each task
   * left behind -- around 3.150 DOM nodes per task, and a drag that grew quadratically because
   * `createDropListMocks` runs once per candidate list (#1384).
   */
  unregisterComponent(comp: DropListComponent): void {
    if (this.dropLists[comp.elementModel.id] === comp) {
      delete this.dropLists[comp.elementModel.id];
    }
  }

  /**
   * Opens a drag: builds the `DragOperation` -- which works out on the spot which lists could receive
   * this item -- and marks the source list as the one under the pointer.
   */
  startDrag(sourceElement: HTMLElement, sourceListComponent: DropListComponent, sourceIndex: number,
            item: DragNDropValueObject, dragType: 'mouse' | 'touch') {
    this.dragOperation =
      new DragOperation(sourceElement, sourceListComponent, sourceIndex, item, dragType, this.dropLists);
    this.isDragActive = true;
    /* The pointer is on the source list when a drag begins. Recorded as the list it is, not as a
       plain "something is hovered": that flag carried over from the previous drag - true on the very
       first one - so `checkHoveredListOrElement` took the first move over a different list for one
       that had already entered it, skipped `dragEnter`, and left the source list as the target
       (#1322). Keeping the source list here also keeps what the flag did for the mouse path: a
       stray mouseenter on the list the drag started in is still ignored (e3dbfe27). */
    this.hoveredListID = sourceListComponent.elementModel.id;

    this.initDrag();
  }

  /**
   * Puts the drag on screen: the item left behind is shown as a placeholder -- unless the list copies
   * on drop, where the original stays and therefore keeps looking normal -- and, if the source list
   * asks for it, every list that could receive the item is highlighted.
   */
  initDrag(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    // placeholder signals that item will be removed on drop. When item is copied it looks
    // normal while dragging to signal that it will stay after drop.
    if (!this.dragOperation.sourceComponent.elementModel.copyOnDrop) {
      this.dragOperation.sourceElement?.classList.add('show-as-placeholder');
    }
    this.dragOperation.sourceElement.style.pointerEvents = 'none';

    this.dragOperation.sourceComponent.isHovered = true;

    if (this.dragOperation.sourceComponent.elementModel.highlightReceivingDropList) {
      this.dragOperation.eligibleTargetListsIDs.forEach(listID => {
        this.dropLists[listID].isHighlighted = true; // TODO kapseln
        this.dropLists[listID].cdr.detectChanges();
      });
    }
  }

  /** Takes the drag off the screen -- placeholders, highlights, hover states. The drop itself has
      happened before this, in `handleDrop`; this only tidies up what `initDrag` set. */
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
        /* The ids are the ones that were registered when the drag began, and since `unregisterComponent`
           a list can be gone by the time it ends: the mouse handler lives on the document, so a drag
           outlives its lists when the host starts a new task while the button is held. Reaching through
           a missing entry would throw here and leave `dragging-active` on the body -- a cursor stuck as
           a grabbing hand. */
        const dropList = this.dropLists[listID];
        if (!dropList) return;
        dropList.isHovered = false;
        dropList.isHighlighted = false;
        dropList.cdr.detectChanges();
      });
  }

  /**
   * Names the list the item would be dropped into now. A sort list also gets a place for it: dragging
   * within the same list keeps the item's own index, dragging in from elsewhere appends a placeholder
   * the pointer can then move around.
   */
  setTargetList(listId: string): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    const targetListComp = this.dropLists[listId];
    this.dragOperation.targetComponent = targetListComp;
    this.hoveredListID = listId;
    if (targetListComp.elementModel.isSortList) {
      if (this.dragOperation.sourceComponent !== targetListComp) {
        this.addSortPlaceholder();
      } else {
        this.dragOperation.sortingPlaceholderIndex = this.dragOperation.sourceIndex;
      }
    }
  }

  /** Appends the dragged item to the target sort list as a placeholder, so the reader sees where it
      would land and can move it from there. */
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

  /** Forgets the target list when the pointer leaves it. A drop from here on does nothing, since
      `handleDrop` needs a target. */
  unSetTargetList(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    this.dragOperation.targetComponent = undefined;
    this.dragOperation.sortingPlaceholderIndex = undefined;
    this.hoveredListID = undefined;
  }

  /** Moves the placeholder to another position in the sort list -- the reordering the reader sees while
      dragging. Works on the view model only; the answer changes at the drop. */
  positionSortPlaceholder(targetIndex: number): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    if (!this.dragOperation.targetComponent) throw new Error('targetComponent undefined');
    /* Every caller reaching here has just had setTargetList run for a sort list, which is what sets
       both. Said out loud rather than left to the type: an undefined index does not throw on its own
       here - splice reads it as 0 - which is how a touch drag ended up sorting the list it came
       from (#1322). */
    if (this.dragOperation.sortingPlaceholderIndex === undefined) {
      throw new Error('sortingPlaceholderIndex undefined');
    }
    const list = this.dragOperation.targetComponent.viewModel;
    const sourceIndex = this.dragOperation.sortingPlaceholderIndex;
    const item = list.splice(sourceIndex, 1)[0];
    list.splice(targetIndex, 0, item);
    this.dragOperation.sortingPlaceholderIndex = targetIndex;
  }

  /** Whether this list was found able to receive the item when the drag began. The set is worked out
      once, at `startDrag`, and does not change while the drag runs. */
  isListEligible(listID: string): boolean {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    return this.dragOperation.eligibleTargetListsIDs.includes(listID);
  }

  /**
   * Carries out the drop, if `DropLogic` allows it -- otherwise nothing happens at all and the item
   * stays where it was.
   *
   * Dropping into the source list is a reorder, and only a sort list has one; for any other list it is
   * a no-op. Both lists then rebuild their form value and their view.
   */
  handleDrop(): void {
    if (!this.dragOperation) throw new Error('dragOP undefined');
    if (this.dragOperation.sourceComponent && this.dragOperation.targetComponent &&
      DropLogic.isDropAllowed(this.dragOperation.draggedItem,
                              this.dragOperation.sourceComponent.elementModel.id,
                              this.dragOperation.targetComponent.elementModel.id,
                              DropLogic.createDropListMocks(this.dropLists))) {
      if (this.dragOperation.sourceComponent === this.dragOperation.targetComponent) {
        if (!this.dragOperation.targetComponent.elementModel.isSortList) return;
        const item =
          this.dragOperation.targetComponent.elementFormControl.value.splice(this.dragOperation.sourceIndex, 1)[0];
        this.dragOperation.targetComponent.elementFormControl.value
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

  /** Moves one item between two lists: out of the source -- unless it copies -- and into the target.
      Neither list's form value is rebuilt here; the caller does that. */
  moveItem(item: DragNDropValueObject | undefined,
           sourceList: DropListComponent,
           sourceListIndex: number,
           targetList: DropListComponent): void {
    DragOperatorService.removeItem(sourceList, sourceListIndex);
    this.addItem(item as DragNDropValueObject, targetList);
  }

  /** Takes the item out of the list, or -- for a list that copies on drop -- reads it without taking
      it out, which is what leaves the original in place. */
  static removeItem(list: DropListComponent, index: number): DragNDropValueObject {
    return list.elementModel.copyOnDrop ?
      list.elementFormControl.value[index] :
      list.elementFormControl.value.splice(index, 1)[0];
  }

  /**
   * Puts the item into the target list, at the sorting placeholder if there is one and at the end
   * otherwise. Two cases end differently: an item returning to the copy list it came from is not added
   * at all, and a one-item list that allows replacement first sends its current item home.
   */
  addItem(item: DragNDropValueObject, targetList: DropListComponent): void {
    if (DropLogic.isPutBack(item, DropLogic.createDropListMock(targetList))) {
      return;
    }
    if (DropLogic.isReplace(
      item, DropLogic.createDropListMock(targetList), DropLogic.createDropListMocks(this.dropLists)
    )) {
      const originList = this.dropLists[targetList.elementFormControl.value[0].originListID];
      this.moveItem(targetList.elementFormControl.value[0], targetList, 0, originList);
      originList.updateFormvalue();
      originList.refreshViewModel();
      originList.cdr.detectChanges();
    }

    // Try to put the item in its original index
    const targetIndex = this.dragOperation?.sortingPlaceholderIndex !== undefined ?
      this.dragOperation?.sortingPlaceholderIndex :
      targetList.elementFormControl.value.length;
    targetList.elementFormControl.value.splice(targetIndex, 0, item);
  }

  hoveredListID: string | undefined;

  /**
   * Works out from a pointer position which list is under it, and tells the lists that they are being
   * entered or left. The touch path needs this because a finger, unlike a mouse, raises no enter and
   * leave events of its own.
   */
  checkHoveredListOrElement(x: number, y: number): void {
    const el = document.elementFromPoint(x, y);
    const hoveredListID = (el as HTMLElement).closest('.drop-list')?.id;

    if (hoveredListID &&
        this.dragOperation?.eligibleTargetListsIDs.includes(this.dropLists[hoveredListID].elementModel.id)) {
      if (this.hoveredListID !== hoveredListID) {
        /* Leaving comes first. A touch can cross from one list straight into the next without ever
           sampling a pixel between them - adjacent lists, or two of them inline in a cloze - and the
           list being left keeps its placeholder and its hover state if nobody tells it (#1322). */
        this.dragOperation?.targetComponent?.dragLeave();
        this.dropLists[hoveredListID].dragEnter();
      }
      this.hoveredListID = hoveredListID;
      if (this.dropLists[hoveredListID].elementModel.isSortList) this.checkHoveredListItem(el);
    } else {
      if (this.hoveredListID) {
        this.dragOperation?.targetComponent?.dragLeave();
      }
      this.hoveredListID = undefined;
    }
  }

  private checkHoveredListItem(el: Element | null): void {
    const hoveredListItem = el?.closest('.drop-list-item');
    if (hoveredListItem) {
      const targetIndex =
        Array.from(((hoveredListItem.parentNode as HTMLElement).parentNode as HTMLElement).children)
          .indexOf((hoveredListItem.parentNode as HTMLElement));
      this.positionSortPlaceholder(targetIndex);
    }
  }
}

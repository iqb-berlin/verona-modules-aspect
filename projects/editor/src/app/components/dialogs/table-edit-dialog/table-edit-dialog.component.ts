import {
  Component, Inject, OnDestroy, ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TableElement, TableHeaderCell } from 'common/models/elements/compound-group-elements/table/table';
import { UIElement } from 'common/models/elements/element';
import { TableComponent } from 'common/components/compound-group-elements/table/table.component';
import { ElementFactory } from 'common/utils/element-factory';
import {
  DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { FileService } from 'common/services/file.service';
import { AudioProperties } from 'common/models/elements/media-player-group-elements/audio';
import { ImageProperties } from 'common/models/elements/interactive-group-elements/image';
import { DropListProperties } from 'common/models/elements/input-group-elements/drop-list';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { IDService } from 'editor/src/app/services/id.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { firstValueFrom } from 'rxjs';

export interface TableEditResult {
  elements: UIElement[];
  headerRows: TableHeaderCell[][];
}

@Component({
  selector: 'aspect-editor-table-edit-dialog',
  standalone: false,
  templateUrl: './table-edit-dialog.component.html',
  styleUrls: ['./table-edit-dialog.component.scss']
})
export class TableEditDialogComponent implements OnDestroy {
  @ViewChild(TableComponent) tableComp!: TableComponent;
  newTable: TableElement;

  private addedElements: UIElement[] = [];
  private removedElements: UIElement[] = [];
  private saved: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { table: TableElement },
              private idService: IDService,
              private dialogService: DialogService,
              private selectionService: SelectionService,
              private dialogRef: MatDialogRef<TableEditDialogComponent, TableEditResult>) {
    this.newTable = TableEditDialogComponent.copyForEditing(data.table);
  }

  /* What the dialog edits is a copy, so that "Abbrechen" can leave the table as it was: it used to
     work on the table itself, and a removed cell was out of the unit before anyone had confirmed
     anything (#1270). The copy is not a duplicate -- it holds the very same cell objects, only in
     its own array. Rebuilding them (getBlueprint(), the TableElement constructor) would hand out new
     IDs and put other objects into the unit than the ones the selection and the references know.
     Its own header rows are copied down to the cells, because their text and alignment are edited in
     place. */
  private static copyForEditing(table: TableElement): TableElement {
    const copy = Object.create(Object.getPrototypeOf(table) as object) as TableElement;
    return Object.assign(copy, table, {
      elements: [...table.elements],
      headerRows: table.headerRows.map(row => row.map(cell => ({ ...cell })))
    });
  }

  /* Saving is where the removal reaches the unit, so the bookkeeping of a removed cell belongs here
     and not to the click that took it out of the copy: its IDs are free only now, and only now is
     its overlay gone -- a cell can be selected, and nothing else takes it out of the selection
     (#1261). */
  save(): void {
    this.saved = true;
    this.removedElements.forEach(element => element.unregisterIDs());
    this.selectionService.deselectElements(this.removedElements);
    this.dialogRef.close({ elements: this.newTable.elements, headerRows: this.newTable.headerRows });
  }

  /* Closing without saving discards the copy -- and with it the elements that were created into it.
     Their IDs were registered when they were built, so they have to be released here, or they stay
     taken for the rest of the session without an element carrying them. */
  ngOnDestroy(): void {
    if (!this.saved) this.addedElements.forEach(element => element.unregisterIDs());
  }

  async addElement(el: { elementType: UIElementType, row: number, col: number }): Promise<void> {
    const extraProps: Partial<UIElementProperties> = {};
    if (el.elementType === 'image') {
      const file = await FileService.getRawFile('image/*');
      const base64 = await FileService.readFileAsText(file, true);
      if (FileService.isResizable(file.type)) {
        const options = await firstValueFrom(this.dialogService.showImageResizeDialog(base64, {}));
        if (options) {
          (extraProps as ImageProperties).src = await FileService.scaleImage(base64, options);
        }
      } else {
        (extraProps as ImageProperties).src = base64;
      }
      (extraProps as ImageProperties).fileName = file.name;
    }
    if (el.elementType === 'audio') {
      await FileService.loadAudio().then(audio => {
        (extraProps as AudioProperties).src = audio.content;
        (extraProps as AudioProperties).fileName = audio.name;
      });
      (extraProps as AudioProperties).player =
        PropertyGroupGenerators.generatePlayerProps({
          progressBar: false,
          interactiveProgressbar: false,
          volumeControl: false,
          muteControl: false,
          showRestTime: false
        });
    }
    if (el.elementType === 'drop-list') {
      (extraProps as DropListProperties).onlyOneItem = true;
      (extraProps as DropListProperties).allowReplacement = true;
      (extraProps as DropListProperties).highlightReceivingDropList = true;
    }
    const newEle = ElementFactory.createElement({
      type: el.elementType,
      ...extraProps
    }, this.idService);
    delete (newEle as { position?: PositionProperties }).position;
    delete (newEle as { dimensions?: DimensionProperties }).dimensions;
    newEle.gridRow = el.row + 1;
    newEle.gridColumn = el.col + 1;
    if (newEle.type === 'text-field' || newEle.type === 'text-area') {
      delete (newEle as { appearance?: 'fill' | 'outline' }).appearance;
    }
    this.newTable.elements.push(newEle);
    this.addedElements.push(newEle);
    this.tableComp.refresh();
  }

  removeElement(coords: { row: number, col: number }): void {
    const index = this.newTable.elements
      .findIndex(el => el.gridRow === (coords.row + 1) && el.gridColumn === (coords.col + 1));
    if (index < 0) return;
    const [removedElement] = this.newTable.elements.splice(index, 1);
    /* A cell the dialog created and the user removed again never reaches the unit, so it is not a
       removal to carry to the save -- it only has to give its IDs back. */
    if (this.addedElements.includes(removedElement)) {
      this.addedElements = this.addedElements.filter(element => element !== removedElement);
      removedElement.unregisterIDs();
    } else {
      this.removedElements.push(removedElement);
    }
  }
}

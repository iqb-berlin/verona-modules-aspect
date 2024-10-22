import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TableElement } from 'common/models/elements/compound-elements/table/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { TableComponent } from 'common/components/compound-elements/table/table.component';
import { ElementFactory } from 'common/util/element.factory';
import { PositionedUIElement, UIElementProperties, UIElementType } from 'common/models/elements/element';
import {
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { FileService } from 'common/services/file.service';
import { AudioProperties } from 'common/models/elements/media-elements/audio';
import { ImageProperties } from 'common/models/elements/media-elements/image';
import { DropListProperties } from 'common/models/elements/input-elements/drop-list';

@Component({
  selector: 'aspect-editor-table-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    TableComponent
  ],
  template: `
    <div mat-dialog-title>Tabellenelemente</div>
    <mat-dialog-content>
      <aspect-table [elementModel]="newTable" [editorMode]="true"
                    (elementAdded)="addElement($event)"
                    (elementRemoved)="removeElement($event)"></aspect-table>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="newTable.elements">{{'save' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    :host ::ng-deep aspect-table .grid-container {
      grid-template-columns: unset !important;
      grid-template-rows: unset !important;
      grid-auto-columns: 300px !important;
      grid-auto-rows: 250px !important;
    }
  `
})
export class TableEditDialogComponent {
  @ViewChild(TableComponent) tableComp!: TableComponent;
  newTable: TableElement;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { table: TableElement }) {
    this.newTable = new TableElement(data.table);
  }

  async addElement(el: { elementType: UIElementType, row: number, col: number }): Promise<void> {
    const extraProps: Partial<UIElementProperties> = {};
    if (el.elementType === 'image') (extraProps as ImageProperties).src = await FileService.loadImage();
    if (el.elementType === 'audio') {
      (extraProps as AudioProperties).src = await FileService.loadAudio();
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
    });
    delete newEle.position;
    delete newEle.dimensions;
    newEle.gridRow = el.row + 1;
    newEle.gridColumn = el.col + 1;
    if (newEle.type === 'text-field') {
      delete newEle.appearance;
    }
    this.newTable.elements.push(newEle);
    this.tableComp.refresh();
  }

  removeElement(coords: { row: number, col: number }): void {
    const index = this.newTable.elements
      .findIndex(el => el.gridRow === (coords.row + 1) && el.gridColumn === (coords.col + 1));
    this.newTable.elements.splice(index, 1);
  }
}

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
    this.newTable.elements.push(ElementFactory.createElement({
      type: el.elementType,
      position: {
        gridRow: el.row + 1,
        gridColumn: el.col + 1
      } as PositionProperties,
      ...extraProps
    }) as PositionedUIElement);
    this.tableComp.refresh();
  }

  removeElement(coords: { row: number, col: number }): void {
    const index = this.newTable.elements
      .findIndex(el => el.position.gridRow === (coords.row + 1) && el.position.gridColumn === (coords.col + 1));
    this.newTable.elements.splice(index, 1);
  }
}

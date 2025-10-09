import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'aspect-hotspot-props',
  imports: [
    TranslateModule,
    CdkDrag,
    CdkDropList,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    NgForOf
  ],
  template: `
    <fieldset class="fx-column-start-stretch">
      <legend>{{'propertiesPanel.hotspots' | translate }}</legend>
      <button [style.align-self]="'center'" mat-mini-fab matSuffix color="primary" [style.bottom.px]="3"
              (click)="addHotspot()">
        <mat-icon>add</mat-icon>
      </button>

      <div class="drop-list" cdkDropList [cdkDropListData]="combinedProperties.value"
           (cdkDropListDropped)="moveHotspot($event)">
        <div *ngFor="let item of $any(combinedProperties.value); let i = index" cdkDrag
             class="option-draggable fx-row-start-stretch">
          <div class="fx-flex" [style.align-self]="'center'">{{'hotspot.'+item.shape | translate}}</div>
          <button mat-icon-button color="primary"
                  (click)="editHotspot(i)">
            <mat-icon>build</mat-icon>
          </button>
          <button mat-icon-button color="primary"
                  (click)="removeHotspot(i)">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>
    </fieldset>
  `
})
export class HotspotPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: Hotspot[] }>();

  constructor(private dialogService: DialogService) { }

  addHotspot(): void {
    const newHotspot: Hotspot = {
      top: 10,
      left: 10,
      width: 20,
      height: 20,
      shape: 'rectangle',
      borderWidth: 1,
      borderColor: '#000000',
      backgroundColor: '#000000',
      rotation: 0,
      value: false,
      readOnly: false
    };
    (this.combinedProperties.value as Hotspot[]).push(newHotspot);
    this.updateModel.emit({ property: 'value', value: this.combinedProperties.value as Hotspot[] });
  }

  removeHotspot(index: number): void {
    const valueList = this.combinedProperties.value as Hotspot[];
    valueList.splice(index, 1);
    this.updateModel.emit({ property: 'value', value: valueList });
  }

  moveHotspot(indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties.value as Hotspot[],
      indices.previousIndex,
      indices.currentIndex);
    this.updateModel.emit({ property: 'value', value: this.combinedProperties.value as Hotspot[] });
  }

  async editHotspot(index: number): Promise<void> {
    const selectedOption = (this.combinedProperties.value as Hotspot[])[index];
    await this.dialogService.showHotspotEditDialog(selectedOption)
      .subscribe((result: Hotspot) => {
        if (result) {
          (this.combinedProperties.value as Hotspot[])[index] = result;
          this.updateModel.emit({ property: 'value', value: (this.combinedProperties.value as Hotspot[]) });
        }
      });
  }
}

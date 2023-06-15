import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';

@Component({
  selector: 'aspect-hotspot-field-set',
  template: `
    <aspect-hotspot-list-panel *ngIf="combinedProperties.value !== undefined"
                               [itemList]="$any(combinedProperties.value)"
                               [title]="'propertiesPanel.hotspots' | translate"
                               [textFieldLabel]="'propertiesPanel.newHotspot' | translate"
                               (changedItemOrder)="moveHotspot($event)"
                               (addItem)="addHotspot()"
                               (removeItem)="removeHotspot($event)"
                               (editItem)="editHotspot($event)">
    </aspect-hotspot-list-panel>
  `
})
export class HotspotFieldSetComponent {
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

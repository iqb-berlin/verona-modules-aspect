import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { DropListProperties } from 'common/models/elements/input-group-elements/drop-list';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';
import { IDService } from 'editor/src/app/services/id.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';

@Component({
  selector: 'aspect-drop-list-properties',
  standalone: false,
  templateUrl: './drop-list-properties.component.html'
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: Merged<DropListProperties> & { idList?: string[] };
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  @ViewChild('selectConnectedLists') selectConnected!: MatSelect;

  constructor(public unitService: UnitService,
              private elementService: ElementService,
              private dialogService: DialogService,
              private idService: IDService) { }

  updateAllowReplacement(value: boolean) {
    if (value) this.updateOnlyOneItem(true);
    this.updateModel.emit({ property: 'allowReplacement', value });
  }

  updateOnlyOneItem(value: boolean) {
    if (!value) this.updateAllowReplacement(false);
    this.updateModel.emit({ property: 'onlyOneItem', value });
  }

  addOption(value: string): void {
    this.updateModel.emit({
      property: 'value',
      value: [
        ...this.combinedProperties.value as DragNDropValueObject[],
        {
          text: value,
          imgSrc: null,
          imgFileName: '',
          audioSrc: null,
          audioFileName: '',
          imgPosition: 'above',
          ...this.idService.getAndRegisterNewIDs('value'),
          originListID: 'id_placeholder',
          originListIndex: 0
        }
      ]
    });
  }

  // Only ever called for the option list, so the name can be narrowed instead of indexing the
  // typed properties with an arbitrary string.
  moveOption(property: 'value', indices: { previousIndex: number, currentIndex: number }): void {
    const options = this.combinedProperties[property] as unknown as TextImageLabel[];
    moveItemInArray(options, indices.previousIndex, indices.currentIndex);
    this.updateModel.emit({ property: property, value: options as unknown as DragNDropValueObject[] });
  }

  async editOption(optionIndex: number): Promise<void> {
    const dropListValues: DragNDropValueObject[] = this.combinedProperties.value as DragNDropValueObject[];

    this.dialogService.showDropListOptionEditDialog(dropListValues[optionIndex])
      .subscribe((result: DragNDropValueObject) => {
        if (result) {
          this.elementService.updateDropListValueObject(optionIndex, result);
        }
      });
  }

  removeOption(optionIndex: number): void {
    const valueList = this.combinedProperties.value as DragNDropValueObject[];
    this.idService.unregister(valueList[optionIndex].id, true, false);
    this.idService.unregister(valueList[optionIndex].alias, false, true);
    valueList.splice(optionIndex, 1);
    this.updateModel.emit({ property: 'value', value: valueList });
  }

  toggleConnectedDropList(connectedDropListList: string[]) {
    this.updateModel.emit({
      property: 'connectedTo',
      value: connectedDropListList
    });
  }

  toggleSelectAll() {
    this.selectConnected.options.forEach((item: MatOption) => item.select());
  }
}

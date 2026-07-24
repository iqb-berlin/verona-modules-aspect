// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform, ViewChild
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { IDService } from 'editor/src/app/services/id.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OptionListPanelComponent } from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';

@Pipe({
  name: 'getValidDropLists',
  standalone: true
})
export class GetValidDropListsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(idList: string[] | undefined): { id: string, alias: string }[] {
    if (!idList) return [];
    return this.unitService.getAllDropListElementIDs()
      .filter(dropListIDPair => !idList.includes(dropListIDPair.id));
  }
}

@Component({
  selector: 'aspect-drop-list-properties',
  imports: [
    NgIf,
    TranslateModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    OptionListPanelComponent,
    FormsModule,
    MatButtonModule,
    NgForOf,
    MatTooltipModule,
    GetValidDropListsPipe
  ],
  templateUrl: './drop-list-properties.component.html'
})
export class DropListPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
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

  moveOption(property: string, indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties[property] as TextImageLabel[],
                    indices.previousIndex,
                    indices.currentIndex);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as DragNDropValueObject[] });
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

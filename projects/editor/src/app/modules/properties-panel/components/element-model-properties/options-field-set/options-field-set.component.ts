import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { Label, TextImageLabel } from 'common/models/label-interfaces';
import { OptionElement } from 'common/models/ui-element-interfaces';
import {
  LikertRowElement, LikertRowProperties
} from 'common/models/elements/likert-row';
import { LikertProperties } from 'common/models/elements/likert';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-options-field-set',
  templateUrl: './options-field-set.component.html',
  standalone: false
})
export class OptionsFieldSetComponent {
  @Input() combinedProperties!: Merged<LikertProperties>;
  @Output() updateModel = new EventEmitter<{
    property: keyof LikertProperties;
    value: string | number | boolean | string[] | Label[] | LikertRowElement[]
  }>();

  constructor(private unitService: UnitService,
              private elementService: ElementService,
              private selectionService: SelectionService,
              public dialogService: DialogService,
              private idService: IDService) { }

  addOption(property: 'options', option: string): void {
    const selectedElements = this.selectionService.getSelectedElements() as OptionElement[];

    selectedElements.forEach(element => {
      const newValue = [
        ...this.combinedProperties[property as 'options'] as Label[],
        element.getNewOptionLabel(option)
      ];
      this.elementService.updateElementsProperty([element], property, newValue);
    });
  }

  addImageOption(): void {
    const selectedElements = this.selectionService.getSelectedElements() as OptionElement[];
    const newLabel: Label = { text: '', imgSrc: null };
    this.dialogService.showLabelEditDialog(newLabel)
      .subscribe((result: Label) => {
        if (result) {
          selectedElements.forEach(element => {
            const newValue = [...this.combinedProperties.options as Label[], result];
            this.elementService.updateElementsProperty([element], 'options', newValue);
          });
        }
      });
  }

  removeOption(property: 'options', optionIndex: number): void {
    (this.combinedProperties[property] as Label[]).splice(optionIndex, 1);
    this.updateModel.emit({
      property,
      value: this.combinedProperties[property] as Label[]
    });
  }

  moveOption(property: 'options', indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties[property] as Label[], indices.previousIndex, indices.currentIndex);
    this.updateModel.emit({ property, value: this.combinedProperties[property] as Label[] });
  }

  editOption(property: 'options', optionIndex: number): void {
    const selectedOption = (this.combinedProperties[property] as Label[])[optionIndex];
    this.dialogService.showLabelEditDialog(selectedOption)
      .subscribe((result: Label) => {
        if (result) {
          (this.combinedProperties[property] as Label[])[optionIndex] = result;
          this.updateModel.emit({ property, value: this.combinedProperties[property] as Label[] });
        }
      });
  }

  addLikertRow(rowLabelText: string): void {
    const newRow = this.elementService.createLikertRowElement({
      type: 'likert-row',
      ...this.idService.getAndRegisterNewIDs('likert-row'),
      rowLabel: {
        text: rowLabelText,
        imgSrc: null,
        imgPosition: 'above',
        imgFileName: ''
      },
      columnCount: (this.combinedProperties.options as unknown[]).length
    } as LikertRowProperties);
    (this.combinedProperties.rows as LikertRowElement[]).push(newRow);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
  }

  addLikertRowImage(): void {
    const newRow = this.elementService.createLikertRowElement({
      type: 'likert-row',
      ...this.idService.getAndRegisterNewIDs('likert-row'),
      rowLabel: {
        text: '',
        imgSrc: null,
        imgPosition: 'above'
      },
      columnCount: (this.combinedProperties.options as unknown[]).length
    } as LikertRowProperties);
    const columns = this.combinedProperties.options as TextImageLabel[];

    this.dialogService.showLikertRowEditDialog(newRow, columns)
      .subscribe((result: LikertRowElement) => {
        if (result) {
          (this.combinedProperties.rows as LikertRowElement[]).push(result);
          this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
        }
      });
  }

  editLikertRow(rowIndex: number): void {
    const row = (this.combinedProperties.rows as LikertRowElement[])[rowIndex] as LikertRowElement;
    const columns = this.combinedProperties.options as TextImageLabel[];

    this.dialogService.showLikertRowEditDialog(row, columns)
      .subscribe((result: LikertRowElement) => {
        if (result) {
          if (result.alias !== row.alias) {
            this.elementService.updateElementsProperty([row], 'alias', result.alias);
          }
          if (result.rowLabel !== row.rowLabel) {
            this.elementService.updateElementsProperty([row], 'rowLabel', result.rowLabel);
          }
          if (result.value !== row.value) {
            this.elementService.updateElementsProperty([row], 'value', result.value);
          }
          if (result.verticalButtonAlignment !== row.verticalButtonAlignment) {
            this.elementService.updateElementsProperty(
              [row],
              'verticalButtonAlignment',
              result.verticalButtonAlignment
            );
          }
          if (result.readOnly !== row.readOnly) {
            this.elementService.updateElementsProperty([row], 'readOnly', result.readOnly);
          }
        }
      });
  }

  removeLikertRow(index: number): void {
    const valueList = this.combinedProperties.rows as LikertRowElement[];
    valueList[index].unregisterIDs();
    valueList.splice(index, 1);
    this.updateModel.emit({ property: 'rows', value: valueList });
  }

  moveLikertRow(indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties.rows as LikertRowElement[], indices.previousIndex, indices.currentIndex);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
  }
}

import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  TextLabel, TextImageLabel, OptionElement, Label
} from 'common/models/elements/element';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { IDManager } from 'common/util/id-manager';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Component({
  selector: 'aspect-options-field-set',
  template: `
    <!--dropdown-->
<!--                              [useRichText]="combinedProperties.type === 'radio'"-->
    <aspect-option-list-panel *ngIf="combinedProperties.options !== undefined"
                              [title]="'propertiesPanel.options'" [textFieldLabel]="'Neue Option'"
                              [itemList]="$any(combinedProperties.options)"
                              (addItem)="addOption('options', $event)"
                              (removeItem)="removeOption('options', $event)"
                              (changedItemOrder)="moveOption('options', $event)"
                              (editItem)="editOption('options', $event)">
    </aspect-option-list-panel>

    <!--likert-->
    <aspect-option-list-panel *ngIf="combinedProperties.rows !== undefined"
                              [itemList]="$any(combinedProperties).rows | LikertRowLabel"
                              [title]="'rows'"
                              [textFieldLabel]="'Neue Zeile'"

                              (changedItemOrder)="moveLikertRow($event)"

                              (addItem)="addLikertRow($event)"
                              (removeItem)="removeLikertRow($event)"
                              (editItem)="editLikertRow($event)">
    </aspect-option-list-panel>
  `
})
export class OptionsFieldSetComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{
      property: string;
      value: string | number | boolean | string[] | Label[] | LikertRowElement[]
    }>();

  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              public dialogService: DialogService) { }

  addOption(property: string, option: string): void {
    const selectedElements = this.selectionService.getSelectedElements() as OptionElement[];

    selectedElements.forEach(element => {
      const newValue = [...this.combinedProperties[property] as Label[], element.getNewOption(option)];
      this.unitService.updateElementsProperty([element], property, newValue);
    });
  }

  removeOption(property: string, optionIndex: number): void {
    (this.combinedProperties[property] as Label[]).splice(optionIndex, 1);
    this.updateModel.emit({
      property: property,
      value: this.combinedProperties[property] as Label[]
    });
  }

  moveOption(property: string, indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties[property] as Label[],
      indices.previousIndex,
      indices.currentIndex);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as Label[] });
  }

  async editOption(property: string, optionIndex: number): Promise<void> {
    const selectedOption = (this.combinedProperties[property] as Label[])[optionIndex];
    await this.dialogService.showLabelEditDialog(selectedOption)
      .subscribe((result: Label) => {
        if (result) {
          (this.combinedProperties[property] as Label[])[optionIndex] = result;
          this.updateModel.emit({ property, value: (this.combinedProperties[property] as Label[]) });
        }
      });
  }

  notifyListChange(property: string, changedList: TextLabel[]): void {
    this.updateModel.emit({ property: property, value: changedList });
  }

  addLikertRow(rowLabelText: string): void {
    const newRow = new LikertRowElement({
      type: 'likert-row',
      rowLabel: {
        text: rowLabelText,
        imgSrc: null,
        imgPosition: 'above'
      },
      columnCount: (this.combinedProperties.options as unknown[]).length
    }, IDManager.getInstance());
    (this.combinedProperties.rows as LikertRowElement[]).push(newRow);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
  }

  async editLikertRow(rowIndex: number): Promise<void> {
    const row = (this.combinedProperties.rows as LikertRowElement[])[rowIndex] as LikertRowElement;
    const columns = this.combinedProperties.options as TextImageLabel[];

    await this.dialogService.showLikertRowEditDialog(row, columns)
      .subscribe((result: LikertRowElement) => {
        if (result) {
          if (result.id !== row.id) {
            this.unitService.updateElementsProperty(
              [row],
              'id',
              result.id
            );
          }
          if (result.rowLabel !== row.rowLabel) {
            this.unitService.updateElementsProperty([row], 'rowLabel', result.rowLabel);
          }
          if (result.value !== row.value) {
            this.unitService.updateElementsProperty(
              [row],
              'value',
              result.value
            );
          }
          if (result.verticalButtonAlignment !== row.verticalButtonAlignment) {
            this.unitService.updateElementsProperty(
              [row],
              'verticalButtonAlignment',
              result.verticalButtonAlignment
            );
          }
          if (result.readOnly !== row.readOnly) {
            this.unitService.updateElementsProperty(
              [row],
              'readOnly',
              result.readOnly
            );
          }
        }
      });
  }

  removeLikertRow(index: number): void {
    const valueList = this.combinedProperties.rows as LikertRowElement[];
    valueList.splice(index, 1);
    this.updateModel.emit({ property: 'rows', value: valueList });
  }

  moveLikertRow(indices: { previousIndex: number, currentIndex: number }): void {
    moveItemInArray(this.combinedProperties.rows as LikertRowElement[],
      indices.previousIndex,
      indices.currentIndex);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
  }
}

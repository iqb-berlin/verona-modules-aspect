import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { LikertRowElement, LikertRowProperties } from 'common/models/elements/compound-elements/likert/likert-row';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import { Label, TextImageLabel, TextLabel } from 'common/models/elements/label-interfaces';
import { OptionElement } from 'common/models/elements/element';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Component({
  selector: 'aspect-options-field-set',
  template: `
    <!--dropdown, radio-button-group-->
<!--                              [useRichText]="combinedProperties.type === 'radio'"-->
    <aspect-option-list-panel *ngIf="combinedProperties.options !== undefined"
                              [title]="'propertiesPanel.options'"
                              [textFieldLabel]="'Neue Option'"
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
              private elementService: ElementService,
              private selectionService: SelectionService,
              public dialogService: DialogService,
              private idService: IDService) { }

  addOption(property: string, option: string): void {
    const selectedElements = this.selectionService.getSelectedElements() as OptionElement[];

    selectedElements.forEach(element => {
      const newValue = [...this.combinedProperties[property] as Label[], element.getNewOptionLabel(option)];
      this.elementService.updateElementsProperty([element], property, newValue);
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
      id: this.idService.getAndRegisterNewID('likert-row'),
      rowLabel: {
        text: rowLabelText,
        imgSrc: null,
        imgPosition: 'above'
      },
      columnCount: (this.combinedProperties.options as unknown[]).length
    } as LikertRowProperties);
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
            this.elementService.updateElementsProperty(
              [row],
              'id',
              result.id
            );
          }
          if (result.rowLabel !== row.rowLabel) {
            this.elementService.updateElementsProperty([row], 'rowLabel', result.rowLabel);
          }
          if (result.value !== row.value) {
            this.elementService.updateElementsProperty(
              [row],
              'value',
              result.value
            );
          }
          if (result.verticalButtonAlignment !== row.verticalButtonAlignment) {
            this.elementService.updateElementsProperty(
              [row],
              'verticalButtonAlignment',
              result.verticalButtonAlignment
            );
          }
          if (result.readOnly !== row.readOnly) {
            this.elementService.updateElementsProperty(
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

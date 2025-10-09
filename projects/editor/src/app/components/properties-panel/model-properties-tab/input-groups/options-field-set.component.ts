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
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { Label, OptionElement, TextImageLabel, TextLabel } from 'common/interfaces';

@Component({
    selector: 'aspect-options-field-set',
    template: `
    <!--dropdown, radio-button-group-->
    <aspect-option-list-panel *ngIf="combinedProperties.options !== undefined"
                              [showImageButton]="combinedProperties.type !== 'dropdown' && combinedProperties.type !== 'radio'"
                              [title]="'propertiesPanel.options'"
                              [textFieldLabel]="'Neue Option'"
                              [itemList]="$any(combinedProperties.options)"
                              (textItemAdded)="addOption('options', $event)"
                              (imageItemAdded)="addImageOption()"
                              (itemRemoved)="removeOption('options', $event)"
                              (itemReordered)="moveOption('options', $event)"
                              (itemEdited)="editOption('options', $event)">
    </aspect-option-list-panel>

    <!--likert-->
    <aspect-option-list-panel *ngIf="combinedProperties.rows !== undefined"
                              [showImageButton]="combinedProperties.type !== 'dropdown' && combinedProperties.type !== 'radio'"
                              [itemList]="$any(combinedProperties).rows | LikertRowLabel"
                              [title]="'rows'"
                              [textFieldLabel]="'Neue Zeile'"
                              (itemReordered)="moveLikertRow($event)"
                              (textItemAdded)="addLikertRow($event)"
                              (imageItemAdded)="addLikertRowImage()"
                              (itemRemoved)="removeLikertRow($event)"
                              (itemEdited)="editLikertRow($event)">
    </aspect-option-list-panel>
  `,
    standalone: false
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

  addImageOption() {
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

  editOption(property: string, optionIndex: number): void {
    const selectedOption = (this.combinedProperties[property] as Label[])[optionIndex];
    this.dialogService.showLabelEditDialog(selectedOption)
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
    const newRow = this.elementService.createLikertRowElement({
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

  async editLikertRow(rowIndex: number): Promise<void> {
    const row = (this.combinedProperties.rows as LikertRowElement[])[rowIndex] as LikertRowElement;
    const columns = this.combinedProperties.options as TextImageLabel[];

    this.dialogService.showLikertRowEditDialog(row, columns)
      .subscribe((result: LikertRowElement) => {
        if (result) {
          if (result.alias !== row.alias) {
            this.elementService.updateElementsProperty(
              [row],
              'alias',
              result.alias
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
    valueList[index].unregisterIDs();
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

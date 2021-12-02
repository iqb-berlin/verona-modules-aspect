import {
  Component, EventEmitter,
  Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
  DragNDropValueObject,
  InputElementValue, LikertColumn, LikertRow, UIElement
} from '../../../../../../../common/models/uI-element';
import { LikertElement } from '../../../../../../../common/ui-elements/likert/likert-element';
import { LikertElementRow } from '../../../../../../../common/ui-elements/likert/likert-element-row';
import { UnitService } from '../../../../services/unit.service';
import { FileService } from '../../../../../../../common/file.service';

@Component({
  selector: 'app-element-model-properties-component',
  templateUrl: './element-model-properties.component.html',
  styleUrls: ['./element-model-properties.component.css']
})
export class ElementModelPropertiesComponent {
  @Input() combinedProperties: UIElement = {} as UIElement;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: InputElementValue | LikertColumn[] | LikertRow[] | DragNDropValueObject[],
    isInputValid?: boolean | null
  }>();

  constructor(public unitService: UnitService) { }

  addOption(property: string, value: string): void {
    (this.combinedProperties[property] as string[]).push(value);
    this.updateModel.emit({ property: property, value: this.combinedProperties[property] as string[] });
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: property, value: event.container.data });
  }

  /* Putting the actual types for option does not work because indexOf throws an error
     about the types not being assignable. */
  removeOption(property: string, option: any): void {
    const valueList = this.combinedProperties[property] as string[] | LikertElementRow[] | LikertColumn[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel.emit({ property: property, value: valueList });
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    await this.unitService.editTextOption(property, optionIndex);
  }

  addDropListOption(value: string): void {
    const id = this.unitService.getNewValueID();
    if (this.combinedProperties.value) {
      this.combinedProperties.value.push({ stringValue: value, id: id });
    } else {
      this.combinedProperties.value = [{ stringValue: value, id: id }];
    }
    this.updateModel.emit({ property: 'value', value: this.combinedProperties.value });
  }

  async editDropListOption(optionIndex: number): Promise<void> {
    await this.unitService.editDropListOption(optionIndex);
  }

  async editColumnOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertColumn(this.selectedElements as LikertElement[], optionIndex);
  }

  async editRowOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertRow(
      (this.combinedProperties.rows as LikertElementRow[])[optionIndex] as LikertElementRow,
      this.combinedProperties.columns as LikertColumn[]
    );
  }

  addColumn(value: string): void {
    const column = UnitService.createLikertColumn(value);
    (this.combinedProperties.columns as LikertColumn[]).push(column);
    this.updateModel.emit({ property: 'columns', value: this.combinedProperties.columns as LikertColumn[] });
  }

  addRow(question: string): void {
    const newRow = UnitService.createLikertRow(
      question,
      (this.combinedProperties.columns as LikertColumn[]).length
    );
    (this.combinedProperties.rows as LikertElementRow[]).push(newRow);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertElementRow[] });
  }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}

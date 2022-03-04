import {
  Component, EventEmitter,
  Input, Output
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UnitService } from '../../../../../services/unit.service';
import { FileService } from '../../../../../services/file.service';
import {
  DragNDropValueObject,
  InputElementValue,
  LikertElement, LikertRowElement,
  UIElement
} from '../../../../../../../../common/interfaces/elements';
import { LikertColumn, LikertRow } from '../../../../../../../../common/interfaces/likert';
import { SelectionService } from '../../../../../services/selection.service';

@Component({
  selector: 'aspect-element-model-properties-component',
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

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  addOption(property: string, value: string): void {
    this.updateModel.emit({
      property: property,
      value: [...(this.combinedProperties[property] as string[]), value]
    });
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel.emit({ property: property, value: event.container.data });
  }

  /* Putting the actual types for option does not work because indexOf throws an error
     about the types not being assignable. */
  removeOption(property: string, option: any): void {
    const valueList = this.combinedProperties[property] as string[] | LikertRowElement[] | LikertColumn[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel.emit({ property: property, value: valueList });
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    await this.unitService.editTextOption(property, optionIndex);
  }

  addDropListOption(value: string): void {
    this.updateModel.emit({
      property: 'value',
      value: [
        ...this.combinedProperties.value as DragNDropValueObject[],
        { stringValue: value, id: this.unitService.getNewValueID() }
      ]
    });
  }

  async editDropListOption(optionIndex: number): Promise<void> {
    await this.unitService.editDropListOption(optionIndex);
  }

  async editColumnOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertColumn(this.selectedElements as LikertElement[], optionIndex);
  }

  async editRowOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertRow(
      (this.combinedProperties.rows as LikertRowElement[])[optionIndex] as LikertRowElement,
      this.combinedProperties.columns as LikertColumn[]
    );
  }

  addColumn(value: string): void {
    const column = UnitService.createLikertColumn(value);
    (this.combinedProperties.columns as LikertColumn[]).push(column);
    this.updateModel.emit({ property: 'columns', value: this.combinedProperties.columns as LikertColumn[] });
  }

  addRow(question: string): void {
    const newRow = this.unitService.createLikertRow(
      question,
      (this.combinedProperties.columns as LikertColumn[]).length
    );
    (this.combinedProperties.rows as LikertRowElement[]).push(newRow);
    this.updateModel.emit({ property: 'rows', value: this.combinedProperties.rows as LikertRowElement[] });
  }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}

import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { UnitService } from '../../../unit.service';
import { SelectionService } from '../../../selection.service';
import { MessageService } from '../../../../../../common/message.service';
import { FileService } from '../../../../../../common/file.service';
import { UIElement } from '../../../../../../common/models/uI-element';
import { LikertElementRow } from '../../../../../../common/models/compound-elements/likert-element-row';
import { LikertElement } from '../../../../../../common/models/compound-elements/likert-element';
import { LikertColumn, LikertRow } from '../../../../../../common/interfaces/UIElementInterfaces';

@Component({
  selector: 'app-element-properties',
  templateUrl: './element-properties.component.html',
  styleUrls: ['./element-properties.component.css']
})
export class ElementPropertiesComponent implements OnInit, OnDestroy {
  selectedElements!: UIElement[];
  combinedProperties: UIElement = {} as UIElement;
  private ngUnsubscribe = new Subject<void>();

  constructor(private selectionService: SelectionService, public unitService: UnitService,
              private messageService: MessageService,
              public sanitizer: DomSanitizer,
              private translateService: TranslateService) { }

  ngOnInit(): void {
    this.unitService.elementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.createCombinedProperties();
        }
      );
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UIElement[]) => {
          this.selectedElements = selectedElements;
          this.createCombinedProperties();
        }
      );
  }

  /* Create new object with properties of all selected elements. When values differ set prop to undefined. */
  createCombinedProperties(): void {
    if (this.selectedElements.length === 0) {
      this.combinedProperties = {} as UIElement;
    } else {
      this.combinedProperties = { ...this.selectedElements[0] } as UIElement;

      for (let i = 1; i < this.selectedElements.length; i++) {
        Object.keys(this.combinedProperties).forEach((property: keyof UIElement) => {
          if (Object.prototype.hasOwnProperty.call(this.selectedElements[i], property)) {
            if (Array.isArray(this.selectedElements[i][property])) {
              if (this.selectedElements[i][property]!.toString() === this.combinedProperties[property]!.toString()) {
                this.combinedProperties[property] = this.selectedElements[i][property];
              }
            }
            if (this.selectedElements[i][property] !== this.combinedProperties[property]) {
              this.combinedProperties[property] = null;
            }
          } else {
            delete this.combinedProperties[property];
          }
        });
      }
    }
  }

  updateModel(property: string,
              value: string | number | boolean | string[] | LikertColumn[] | LikertRow[] | null,
              isInputValid: boolean | null = true): void {
    if (isInputValid) {
      this.unitService.updateElementProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  deleteElement(): void {
    this.unitService.deleteElementsFromSectionByIndex(
      this.selectedElements,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex
    );
  }

  duplicateElement(): void {
    this.unitService.duplicateElementsInSectionByIndex(
      this.selectedElements,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addOption(property: string, value: string): void {
    (this.combinedProperties[property] as string[]).push(value);
    this.updateModel(property, this.combinedProperties[property] as string[]);
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel(property, event.container.data);
  }

  removeOption(property: string, option: any): void {
    const valueList: any[] = this.combinedProperties[property] as any[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel(property, valueList);
  }

  async loadImage(): Promise<void> {
    this.updateModel('imageSrc', await FileService.loadImage());
  }

  removeImage(): void {
    this.updateModel('imageSrc', null);
  }

  addColumn(value: string): void {
    const column = UnitService.createLikertColumn(value);
    (this.combinedProperties.columns as LikertColumn[]).push(column);
    this.updateModel('columns', this.combinedProperties.columns as LikertColumn[]);
  }

  addRow(question: string): void {
    const newRow = UnitService.createLikertRow(
      question,
      (this.combinedProperties.columns as LikertColumn[]).length
    );
    (this.combinedProperties.rows as LikertElementRow[]).push(newRow);
    this.updateModel('rows', this.combinedProperties.rows as LikertElementRow[]);
  }

  async editTextOption(property: string, optionIndex: number): Promise<void> {
    await this.unitService.editTextOption(property, optionIndex);
  }

  async editColumnOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertColumn(this.selectedElements as LikertElement[], optionIndex);
  }

  async editRowOption(optionIndex: number): Promise<void> {
    await this.unitService.editLikertRow(
      (this.combinedProperties.rows as LikertElementRow[])[optionIndex] as LikertElementRow
    );
  }
}

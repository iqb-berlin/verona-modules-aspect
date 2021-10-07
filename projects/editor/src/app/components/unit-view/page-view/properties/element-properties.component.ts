import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { MessageService } from '../../../../../../../common/message.service';
import { FileService } from '../../../../../../../common/file.service';

@Component({
  selector: 'app-element-properties',
  templateUrl: './element-properties.component.html',
  styleUrls: ['./element-properties.component.css']
})
export class ElementPropertiesComponent implements OnInit, OnDestroy {
  selectedElements!: UnitUIElement[];
  combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};
  private ngUnsubscribe = new Subject<void>();

  constructor(private selectionService: SelectionService, public unitService: UnitService,
              private messageService: MessageService,
              public sanitizer: DomSanitizer) { }

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
        (selectedElements: UnitUIElement[]) => {
          this.selectedElements = selectedElements;
          this.createCombinedProperties();
        }
      );
  }

  /* Create new object with properties of all selected elements. When values differ set prop to undefined. */
  createCombinedProperties(): void {
    if (this.selectedElements.length === 0) {
      this.combinedProperties = {};
    } else {
      this.combinedProperties = { ...this.selectedElements[0] };

      for (let i = 1; i < this.selectedElements.length; i++) {
        Object.keys(this.combinedProperties).forEach((property: keyof UnitUIElement) => {
          if (Object.prototype.hasOwnProperty.call(this.selectedElements[i], property)) {
            if (this.selectedElements[i][property] !== this.combinedProperties[property]) {
              this.combinedProperties[property] = undefined;
            }
          } else {
            delete this.combinedProperties[property];
          }
        });
      }
    }
  }

  updateModel(property: string,
              value: string | number | boolean | string[] | undefined,
              isInputValid: boolean | null = true): void {
    if (isInputValid && value !== null) {
      this.unitService.updateElementProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning('Eingabe ungültig');
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
    this.updateModel(property, this.combinedProperties[property]);
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel(property, event.container.data);
  }

  removeOption(property: string, option: string): void {
    const valueList: string[] = this.combinedProperties[property] as [];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel(property, valueList);
  }

  async loadImage(): Promise<void> {
    this.updateModel('imageSrc', await FileService.loadImage());
  }

  removeImage(): void {
    this.updateModel('imageSrc', undefined);
  }
}

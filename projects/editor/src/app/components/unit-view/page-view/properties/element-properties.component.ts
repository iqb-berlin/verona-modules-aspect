import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { MessageService } from '../../../../../../../common/message.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-element-properties',
  templateUrl: './element-properties.component.html',
  styles: [
    '::ng-deep app-element-properties .margin-properties .mat-form-field-infix {width: 55px}',
    '::ng-deep app-element-properties .mat-form-field-infix {width: 95px; margin: 0 5px}',
    '.list-items {padding: 5px 10px; border-bottom: solid 1px #ccc}',
    '.list-items {display: flex;flex-direction: row; align-items: center; justify-content: space-between;}',
    '.element-button {margin-top: 10px}',
    '.input-group {background-color: rgba(0,0,0,.04); margin-bottom: 10px}',
    '.centered-form-field {margin-left: 25%}',
    '.right-form-field {margin-left: 15%}',
    '::ng-deep app-element-properties .mat-tab-label {min-width: 0 !important;}',
    '::ng-deep app-element-properties .mat-tab-group {padding: 15px}',
    '.text-text {min-height: 125px; max-height: 500px; overflow: auto; margin-bottom: 10px}',
    '.text-text {background-color: rgba(0,0,0,.04)}'
  ]
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
          }
        });
      }
    }
  }

  updateModel(property: string,
              value: string | number | boolean | string[] | undefined,
              isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      this.unitService.updateElementProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning('Eingabe ungültig');
    }
  }

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements(), direction);
  }

  deleteElement(): void {
    this.selectionService.selectedPageSection
      .pipe(take(1))
      .subscribe(selectedPageSection => {
        this.unitService.deleteElementsFromSection(this.selectedElements, selectedPageSection);
        this.selectionService.clearElementSelection();
      })
      .unsubscribe();
  }

  duplicateElement(): void {
    this.selectionService.selectedPageSection
      .pipe(take(1))
      .subscribe(selectedPageSection => {
        this.unitService.duplicateElementsInSection(this.selectedElements, selectedPageSection);
      })
      .unsubscribe();
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
}

import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UnitService } from '../../../unit.service';
import { SelectionService } from '../../../selection.service';
import { MessageService } from '../../../../../../common/message.service';
import { FileService } from '../../../../../../common/file.service';
import { UIElement } from '../../../../../../common/models/uI-element';
import { LikertElementRow } from '../../../../../../common/models/compound-elements/likert-element-row';
import { LikertElement } from '../../../../../../common/models/compound-elements/likert-element';
import { AnswerOption, LikertRow } from '../../../../../../common/interfaces/UIElementInterfaces';

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
              value: string | number | boolean | string[] | AnswerOption[] | LikertRow[] | null,
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
    this.updateModel(property, this.combinedProperties[property] as string[]);
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel(property, event.container.data);
  }

  removeOption(property: string, option: string): void {
    const valueList: string[] = this.combinedProperties[property] as string[];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel(property, valueList);
  }

  async loadImage(): Promise<void> {
    this.updateModel('imageSrc', await FileService.loadImage());
  }

  removeImage(): void {
    this.updateModel('imageSrc', null);
  }

  addAnswer(value: string): void {
    const answer = UnitService.createLikertAnswer(value);
    (this.combinedProperties.answers as AnswerOption[]).push(answer);
    this.updateModel('answers', this.combinedProperties.answers as AnswerOption[]);
  }

  addQuestion(question: string): void {
    const newQuestion = UnitService.createLikertQuestion(
      question,
      (this.combinedProperties.answers as AnswerOption[]).length
    );
    (this.combinedProperties.questions as LikertElementRow[]).push(newQuestion);
    this.updateModel('questions', this.combinedProperties.questions as LikertElementRow[]);
  }

  async editAnswerOption(optionIndex: number): Promise<void> {
    await this.unitService.editAnswer(this.selectedElements as LikertElement[], optionIndex);
  }

  async editQuestionOption(optionIndex: number): Promise<void> {
    await this.unitService.editQuestion(
      (this.combinedProperties.questions as LikertElementRow[])[optionIndex] as LikertElementRow
    );
  }
}

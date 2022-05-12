import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { UnitService } from '../../services/unit.service';
import { SelectionService } from '../../services/selection.service';
import { MessageService } from 'common/services/message.service';
import { DragNDropValueObject, TextImageLabel, UIElement, UIElementValue } from 'common/models/elements/element';

@Component({
  selector: 'aspect-element-properties',
  templateUrl: './element-properties-panel.component.html',
  styles: [
    '.button-group button {margin: 5px 10px;}',
    'mat-divider {margin: 20px; border-top-width: 9px; border-top-style: dotted;}',
    '.properties-panel {height: 100%; padding-bottom: 20px}',
    '.properties-panel .mat-tab-group {height: 100%; overflow: auto; padding: 0 15px;}',
    ':host ::ng-deep .mat-tab-body-wrapper {height: 100%}',
    '.panel-title {font-size: x-large; text-align: center;}',
    '.panel-title span {font-size: medium;}'
  ]
})
export class ElementPropertiesPanelComponent implements OnInit, OnDestroy {
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
          this.combinedProperties =
            ElementPropertiesPanelComponent.createCombinedProperties(this.selectedElements) as UIElement;
        }
      );
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UIElement[]) => {
          this.selectedElements = selectedElements;
          this.combinedProperties =
            ElementPropertiesPanelComponent.createCombinedProperties(this.selectedElements) as UIElement;
        }
      );
  }

  static createCombinedProperties(elements: Record<string, UIElementValue>[]): Record<string, UIElementValue> {
    const combinedProperties: Record<string, UIElementValue> = { ...elements[0], id: [elements[0]?.id as string] };

    for (let elementCounter = 1; elementCounter < elements.length; elementCounter++) {
      const elementToMerge = elements[elementCounter];
      Object.keys(combinedProperties).forEach((property: keyof UIElement) => {
        if (Object.prototype.hasOwnProperty.call(elementToMerge, property)) {
          if (typeof combinedProperties[property] === 'object' &&
            !Array.isArray(combinedProperties[property]) &&
            combinedProperties[property] !== null) {
            (combinedProperties[property] as Record<string, UIElementValue>) =
              ElementPropertiesPanelComponent.createCombinedProperties(
                [(combinedProperties[property] as Record<string, UIElementValue>),
                  (elementToMerge[property] as Record<string, UIElementValue>)]
              );
          } else if (JSON.stringify(combinedProperties[property]) !== JSON.stringify(elementToMerge[property])) {
            if (property === 'id') {
              (combinedProperties.id as string[]).push(elementToMerge.id as string);
            } else {
              combinedProperties[property] = null;
            }
          }
        } else {
          delete combinedProperties[property];
        }
      });
    }
    // console.log('combined', combinedProperties);
    return combinedProperties;
  }

  updateModel(property: string,
              value: string | number | boolean | string[] |
              TextImageLabel[] | DragNDropValueObject[] | null,
              isInputValid: boolean | null = true): void {
    if (isInputValid) {
      this.unitService.updateElementsProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  deleteElement(): void {
    this.unitService.deleteElements(this.selectedElements);
  }

  duplicateElement(): void {
    this.unitService.duplicateElementsInSection(
      this.selectedElements,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

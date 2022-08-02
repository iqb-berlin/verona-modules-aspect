import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'common/services/message.service';
import { DragNDropValueObject, TextImageLabel, UIElement } from 'common/models/elements/element';
import { UnitService } from '../../services/unit.service';
import { SelectionService } from '../../services/selection.service';

export type CombinedProperties = UIElement & { idList?: string[] };

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
  selectedElements: UIElement[] = [];
  combinedProperties: CombinedProperties | undefined;
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
            ElementPropertiesPanelComponent.createCombinedProperties(this.selectedElements);
        }
      );
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UIElement[]) => {
          this.selectedElements = selectedElements;
          this.combinedProperties =
            ElementPropertiesPanelComponent.createCombinedProperties(this.selectedElements);
        }
      );
  }

  static createCombinedProperties(elements: UIElement[]): CombinedProperties | undefined {
    if (elements.length > 0) {
      const combinedProperties = { ...elements[0], idList: [elements[0].id] } as CombinedProperties;

      for (let elementCounter = 1; elementCounter < elements.length; elementCounter++) {
        const elementToMerge = elements[elementCounter];
        Object.keys(combinedProperties).forEach((property: keyof UIElement) => {
          if (Object.prototype.hasOwnProperty.call(elementToMerge, property)) {
            if (typeof combinedProperties[property] === 'object' &&
              !Array.isArray(combinedProperties[property]) &&
              combinedProperties[property] !== null) {
              combinedProperties[property] =
                ElementPropertiesPanelComponent.createCombinedProperties(
                  [(combinedProperties[property] as UIElement),
                    (elementToMerge[property] as UIElement)]
                );
            } else if (JSON.stringify(combinedProperties[property]) !== JSON.stringify(elementToMerge[property])) {
              if (property === 'id') {
                // console.log('hier', combinedProperties.id);
                combinedProperties.idList?.push(elementToMerge.id as string);
                // combinedProperties.id = [combinedProperties.id, elementToMerge.id] as string[];
              } else {
                combinedProperties[property] = null;
              }
            }
          } else {
            delete combinedProperties[property];
          }
        });
      }
      return combinedProperties;
    }
    return undefined;
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

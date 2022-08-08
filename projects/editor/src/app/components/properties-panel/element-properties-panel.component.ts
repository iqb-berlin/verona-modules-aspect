import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'common/services/message.service';
import { TextLabel, UIElement } from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { UnitService } from '../../services/unit.service';
import { SelectionService } from '../../services/selection.service';

export type CombinedProperties = UIElement & { idList?: string[] };

@Component({
  selector: 'aspect-element-properties',
  templateUrl: './element-properties-panel.component.html',
  styleUrls: ['./element-properties-panel.component.css']
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
                combinedProperties.idList?.push(elementToMerge.id as string);
              } else {
                combinedProperties[property] = null;
              }
            }
          } else {
            delete combinedProperties[property];
          }
        });
      }
      // replace rows array to trigger change detection for options panel
      combinedProperties.rows = combinedProperties.rows ? [...combinedProperties.rows as LikertRowElement[]] : undefined;
      // console.log('combi', combinedProperties);
      return combinedProperties;
    }
    return undefined;
  }

  updateModel(property: string,
              value: string | number | boolean | string[] |
              TextLabel | TextLabel[] | LikertRowElement[] | null,
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

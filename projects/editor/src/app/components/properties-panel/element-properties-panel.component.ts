import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'editor/src/app/services/message.service';
import { UIElement } from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { ElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/element-overlay.directive';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { UIElementValue } from 'common/interfaces';
import { SelectionService } from '../../services/selection.service';
import { UnitService } from '../../services/unit-services/unit.service';

export type CombinedProperties = UIElement & { idList?: string[] };

@Component({
    selector: 'aspect-element-properties',
    templateUrl: './element-properties-panel.component.html',
    styleUrls: ['./element-properties-panel.component.css'],
    standalone: false
})
export class ElementPropertiesPanelComponent implements OnInit, OnDestroy {
  selectedElements: UIElement[] = [];
  combinedProperties: CombinedProperties | undefined;
  private ngUnsubscribe = new Subject<void>();

  interactionEnabled = false;
  interactionIndeterminate = false;

  constructor(protected selectionService: SelectionService,
              public unitService: UnitService,
              public sectionService: SectionService,
              public elementService: ElementService,
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

          this.interactionEnabled = this.selectionService.selectedElementComponents
            .filter(elementOverlay => elementOverlay instanceof ElementOverlay)
            .reduce((accumulator: boolean, elementOverlay: any) => elementOverlay.isInteractionEnabled(), false);

          this.interactionIndeterminate = (this.selectionService.selectedElementComponents.length > 1) &&
            this.selectionService.selectedElementComponents
              .filter(elementOverlay => elementOverlay instanceof ElementOverlay)
              .reduce((accumulator: any, elementOverlay: any) => {
                if (!accumulator) return elementOverlay.isInteractionEnabled();
                return accumulator !== elementOverlay.isInteractionEnabled();
              }, undefined);
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

  updateModel(property: string, value: UIElementValue, isInputValid: boolean | null = true): void {
    if (isInputValid) {
      this.elementService.updateElementsProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  setElementInteractionEnabled(isEnabled: boolean): void {
    this.selectionService.selectedElementComponents.forEach(elementOverlay => {
      if (elementOverlay instanceof ElementOverlay) elementOverlay.setInteractionEnabled(isEnabled);
    });
  }

  deleteElement(): void {
    this.elementService.deleteElements(this.selectedElements);
  }

  duplicateElement(): void {
    this.elementService.duplicateSelectedElements();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

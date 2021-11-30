import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'lodash';
import { UnitService } from '../../../../services/unit.service';
import { SelectionService } from '../../../../services/selection.service';
import { MessageService } from '../../../../../../../common/services/message.service';
import {
  DragNDropValueObject,
  LikertColumn,
  LikertRow,
  UIElement
} from '../../../../../../../common/models/uI-element';

@Component({
  selector: 'app-element-properties',
  templateUrl: './element-properties.component.html',
  styles: [
    '.element-button {margin-top: 10px;}',
    'mat-divider {margin: 20px; border-top-width: 9px; border-top-style: dotted;}'
  ]
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
    // Flatten all elements first, to make it easier to combine them
    this.selectedElements =
      this.selectedElements.map(element => ElementPropertiesComponent.flattenInterfaceProps(element));
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
    console.log('combined', this.combinedProperties);
  }

  private static flattenInterfaceProps(element: UIElement): UIElement {
    let flatElement = merge(element, element.positionProps);
    flatElement = merge(flatElement, element.fontProps);
    return merge(flatElement, element.surfaceProps);
  }

  updateModel(property: string,
              value: string | number | boolean | string[] |
              LikertColumn[] | LikertRow[] | DragNDropValueObject | null,
              isInputValid: boolean | null = true): void {
    if (isInputValid) {
      this.unitService.updateElementProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  deleteElement(): void {
    this.unitService.deleteElements(this.selectedElements);
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
}

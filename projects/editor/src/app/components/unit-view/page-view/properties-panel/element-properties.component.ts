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
    '.element-button {margin: 5px 10px;}',
    'mat-divider {margin: 20px; border-top-width: 9px; border-top-style: dotted;}',
    '.properties-panel {height: 100%; padding-bottom: 20px}',
    '.properties-panel .mat-tab-group {height: 100%; overflow: auto}',
    ':host ::ng-deep .mat-tab-body-wrapper {height: 100%}'
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
    const flattenedSelectedElements =
      this.selectedElements.map(element => ElementPropertiesComponent.flattenInterfaceProps(element));

    if (flattenedSelectedElements.length === 0) {
      this.combinedProperties = {} as UIElement;
    } else {
      this.combinedProperties = { ...flattenedSelectedElements[0] } as UIElement;

      for (let i = 1; i < flattenedSelectedElements.length; i++) {
        Object.keys(this.combinedProperties).forEach((property: keyof UIElement) => {
          if (Object.prototype.hasOwnProperty.call(flattenedSelectedElements[i], property)) {
            if (Array.isArray(flattenedSelectedElements[i][property])) {
              if (flattenedSelectedElements[i][property]?.toString() === this.combinedProperties[property]?.toString()) {
                this.combinedProperties[property] = flattenedSelectedElements[i][property];
              }
            }
            if (flattenedSelectedElements[i][property] !== this.combinedProperties[property]) {
              this.combinedProperties[property] = null;
            }
          } else {
            delete this.combinedProperties[property];
          }
        });
      }
    }
    // console.log('combined', this.combinedProperties);
  }

  private static flattenInterfaceProps(element: UIElement): UIElement {
    let flatElement = merge({ ...element }, element.positionProps);
    flatElement = merge(flatElement, element.fontProps);
    return merge(flatElement, element.surfaceProps) as unknown as UIElement;
  }

  updateModel(property: string,
              value: string | number | boolean | string[] |
              LikertColumn[] | LikertRow[] | DragNDropValueObject[] | null,
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

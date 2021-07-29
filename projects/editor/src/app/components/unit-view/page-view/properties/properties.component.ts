import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitUIElement } from '../../../../../../../common/unit';
import { SelectionService } from '../canvas/selection.service';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styles: [
    ':host {text-align: center; font-size: larger; margin-left: 1px}',
    ':host ::ng-deep .mat-tab-label {min-width: 0}',
    '.newOptionElement {margin-top: 20px}',
    '.newOptionElement button {background-color: #696969; margin: 5px}',
    'mat-tab-group {padding: 10px;}',
    '.delete-element-button {margin-bottom: 5px; border: 1px solid red;}',
    '.duplicate-element-button {margin-bottom: 5px}'
  ]
})
export class PropertiesComponent {
  selectedElements: UnitUIElement[] = [];
  combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};
  private ngUnsubscribe = new Subject<void>();

  constructor(private unitService: UnitService, private selectionService: SelectionService) { }

  ngOnInit(): void {
    this.unitService.elementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.createCombinedProperties();
        }
      );
    this.selectionService.elementSelected
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UnitUIElement[]) => {
          this.selectedElements = selectedElements;
          this.createCombinedProperties();
        }
      );
  }

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

  updateModel(property: string, value: string | number | boolean | undefined): void {
    this.selectedElements.forEach((element: UnitUIElement) => {
      this.unitService.updateElementProperty(element, property, value);
    });
  }

  /* button group always handles values as string and since we also want to handle undefined
     we need to transform the value before passing it on. */
  transformToBoolAndUpdateModel(property: string, value: string): void {
    switch (value) {
      case 'true': {
        this.updateModel(property, true);
        break;
      }
      case 'false': {
        this.updateModel(property, false);
        break;
      }
      default: {
        this.updateModel(property, undefined);
      }
    }
  }

  deleteElement(): void {
    this.selectedElements.forEach((element: UnitUIElement) => {
      this.unitService.deleteElement(element);
    });
  }

  duplicateElement(): void {
    this.selectedElements.forEach((element: UnitUIElement) => {
      this.unitService.duplicateElement(element);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

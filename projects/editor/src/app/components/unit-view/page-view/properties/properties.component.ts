import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UnitService } from '../../../../unit.service';
import { UnitUIElement } from '../../../../model/unit';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styles: [
    ':host {text-align: center; font-size: larger}',
    ':host ::ng-deep .mat-tab-label {min-width: 0}',
    '.newOptionElement {margin-top: 20px}',
    '.newOptionElement button {background-color: #696969; margin: 5px}'
  ]
})
export class PropertiesComponent {
  selectedElementsSubscription!: Subscription;
  elementUpdatedSubscription!: Subscription;
  selectedElements!: UnitUIElement[];
  combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};

  constructor(private unitService: UnitService) { }

  ngOnInit(): void {
    this.selectedElementsSubscription = this.unitService.selectedElements.subscribe(
      (selectedElements: UnitUIElement[]) => {
        this.selectedElements = selectedElements;
        this.calculateCombinedProperties();
      }
    );
    this.elementUpdatedSubscription = this.unitService.elementUpdated.subscribe(() => {
      this.calculateCombinedProperties();
    });
  }

  calculateCombinedProperties(): void {
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

  updateModel(property: string, value: string | number | boolean): void {
    this.unitService.updateSelectedElementProperty(property, value);
  }

  deleteElement(): void {
    this.unitService.deleteSelectedElements();
  }

  ngOnDestroy(): void {
    this.selectedElementsSubscription.unsubscribe();
    this.elementUpdatedSubscription.unsubscribe();
  }
}

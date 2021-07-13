import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UnitService } from '../../../../unit.service';
import { UnitUIElement } from '../../../../../../../common/unit';

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
  selectedElementsSubscription!: Subscription;
  selectedElements!: UnitUIElement[];
  combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};

  constructor(private unitService: UnitService) { }

  ngOnInit(): void {
    this.selectedElementsSubscription = this.unitService.selectedElements.subscribe(
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

  // event as optional parameter in case the input is invalid and the old value needs
  // to be restored. This is for now only relevant for IDs. Might need rework for other properties.
  updateModel(property: string, value: string | number | boolean, event?: Event): void {
    if (!this.unitService.updateSelectedElementProperty(property, value)) {
      if (event) {
        (event.target as HTMLInputElement).value = <string> this.combinedProperties[property];
      }
    }
  }

  deleteElement(): void {
    this.unitService.deleteSelectedElements();
  }

  ngOnDestroy(): void {
    this.selectedElementsSubscription.unsubscribe();
  }
}

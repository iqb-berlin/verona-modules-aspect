import { Component } from '@angular/core';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styles: [
    ':host {text-align: center; font-size: larger}',
    ':host button {text-align: left; font-size: large; margin: 5px}',
    ':host ::ng-deep .mat-tab-label {min-width: 0}',
    'mat-tab-group {padding: 10px;}',
    '::ng-deep app-ui-element-toolbox .mat-button-wrapper {width: 100%; display: inline-block}'
  ]
})
export class UiElementToolboxComponent {
  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  async addUIElement(elementType: string): Promise<void> {
    this.unitService.addElementToSectionByIndex(elementType,
      this.selectionService.selectedPageIndex,
      this.selectionService.selectedPageSectionIndex);
  }
}

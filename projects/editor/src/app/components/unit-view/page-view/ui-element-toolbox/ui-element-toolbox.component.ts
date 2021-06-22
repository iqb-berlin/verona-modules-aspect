import { Component } from '@angular/core';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: 'app-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styles: [
    ':host {background-color: #F9FBFB; border: 1px solid black;}',
    ':host {text-align: center; font-size: larger}',
    ':host button {text-align: left; font-size: large; margin: 5px}',
    ':host ::ng-deep .mat-tab-label {min-width: 0}'
  ]
})
export class UiElementToolboxComponent {
  constructor(public unitService: UnitService) { }

  async addUIElement(elementType: string): Promise<void> {
    await this.unitService.addPageElement(elementType);
  }
}

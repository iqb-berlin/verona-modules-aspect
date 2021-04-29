import { Component } from '@angular/core';
import { UnitService } from '../../unit.service';

@Component({
  selector: 'app-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styles: [
    ':host {background-color: #F9FBFB; border: 1px solid black;}',
    ':host {text-align: center}'
  ]
})
export class UiElementToolboxComponent {
  constructor(public unitService: UnitService) { }

  addUIElement(elementType: string): void {
    this.unitService.addPageElement(elementType);
  }
}

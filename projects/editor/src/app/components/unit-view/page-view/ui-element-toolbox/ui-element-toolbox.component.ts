import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styles: [
    ':host {background-color: #F9FBFB; margin-left: 1px}',
    ':host {text-align: center; font-size: larger}',
    ':host button {text-align: left; font-size: large; margin: 5px}',
    ':host ::ng-deep .mat-tab-label {min-width: 0}',
    'mat-tab-group {padding: 10px;}'
  ]
})
export class UiElementToolboxComponent {
  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  async addUIElement(elementType: string): Promise<void> {
    this.selectionService.selectedPageSection
      .pipe(take(1))
      .subscribe(value => this.unitService.addElementToSection(elementType, value)).unsubscribe();
  }
}

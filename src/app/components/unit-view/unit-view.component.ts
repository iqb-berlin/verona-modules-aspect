import {
  Component, ViewChild
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';

import { Unit } from '../../model/unit';
import { UnitService } from '../../unit.service';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.page-toolbar {margin: 8px}'
  ]
})
export class UnitViewComponent {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  unit: Unit;

  constructor(public unitService: UnitService) {
    this.unit = this.unitService.activeUnit;
  }

  addPage(): void {
    this.unitService.addPage();
    this.tabGroup.selectedIndex = this.unit.pages.length - 1;
  }

  selectTab(): void {
    // this needs to be set, otherwise we want an error to happen
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.unitService.switchPage(this.tabGroup.selectedIndex!);
  }
}

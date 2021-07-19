// eslint-disable-next-line max-classes-per-file
import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UnitService } from '../../unit.service';
import { Unit } from '../../../../../common/unit';
import { DialogService } from '../../dialog.service';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.toolbox_drawer {width: 280px}',
    '.properties_drawer {width: 320px}',
    '.delete-page-button {min-width: 0; padding: 0;position: absolute; left: 130px; bottom: 6px;}',
    '.page-alwaysVisible-icon {position: absolute; left: 15px}',
    '.drawer-button {font-size: large;background-color: lightgray;min-width: 0;width: 2%;border: none;cursor: pointer}',
    '.show-elements-button span {transform: rotate(-90deg); display: inherit}',
    '.show-properties-button {padding-bottom: 140px}',
    '.show-properties-button span {transform: rotate(90deg); display: inherit;}'
  ]
})
export class UnitViewComponent {
  constructor(public unitService: UnitService, private dialogService: DialogService) { }

  addPage(): void {
    this.unitService.addPage();
  }

  deletePage(): void {
    this.showConfirmDialog();
  }

  showConfirmDialog(): void {
    this.dialogService.showConfirmDialog().subscribe((result: boolean) => {
      if (result) {
        this.unitService.deletePage();
      }
    });
  }
}

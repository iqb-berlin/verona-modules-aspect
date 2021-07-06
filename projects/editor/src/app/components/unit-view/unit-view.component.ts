// eslint-disable-next-line max-classes-per-file
import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { UnitService } from '../../unit.service';
import { Unit } from '../../../../../common/unit';

@Component({
  selector: 'app-unit-view',
  templateUrl: './unit-view.component.html',
  styles: [
    '.toolbox_drawer {width: 280px}',
    '.properties_drawer {width: 320px}',
    '.delete-page-button {min-width: 0; padding: 0;position: absolute; left: 130px; bottom: 6px;}',
    '.drawer-button {font-size: large;background-color: lightgray;min-width: 0;width: 2%;border: none;cursor: pointer}',
    '.show-elements-button span {transform: rotate(-90deg); display: inherit}',
    '.show-properties-button {padding-bottom: 140px}',
    '.show-properties-button span {transform: rotate(90deg); display: inherit;}'
  ]
})
export class UnitViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  unit!: Unit;
  unitSubscription!: Subscription;
  selectedPageIndexSubscription!: Subscription;

  constructor(public unitService: UnitService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.unitSubscription = this.unitService.unit.subscribe((unit: Unit) => {
      this.unit = unit;
    });
  }

  ngAfterViewInit(): void {
    this.selectedPageIndexSubscription = this.unitService.selectedPageIndex.subscribe((index: number) => {
      this.tabGroup.selectedIndex = index;
    });
  }

  selectTab(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.unitService.switchPage(this.tabGroup.selectedIndex!);
  }

  addPage(): void {
    this.unitService.addPage();
  }

  deletePage(): void {
    this.showConfirmDialog();
  }

  showConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialog);
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.unitService.deletePage(this.tabGroup.selectedIndex!);
      }
    });
  }

  ngOnDestroy(): void {
    this.unitSubscription.unsubscribe();
    this.selectedPageIndexSubscription.unsubscribe();
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <mat-dialog-content>
        Seite wirklich löschen?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Okay</button>
      <button mat-button mat-dialog-close>Abbruch</button>
    </mat-dialog-actions>
    `
})
export class ConfirmationDialog {}

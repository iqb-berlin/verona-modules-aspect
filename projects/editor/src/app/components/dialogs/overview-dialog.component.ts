import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource,
  MatTextColumn
} from '@angular/material/table';
import { UIElement } from 'common/models/elements/element';
import { MatButton } from '@angular/material/button';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";

@Component({
  selector: 'aspect-overview-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    FormsModule,
    TranslateModule,
    MatTable,
    MatButton,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatTextColumn,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatCheckbox,
    MatSortModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOptionModule
  ],
  template: `
    <mat-dialog-content>
        <div class="controls-area">
          <mat-form-field>
            <mat-label>Eigenschaft</mat-label>
            <mat-select>
              @for (option of elementOptions; track option) {
                <mat-option [value]="option" (click)="selectedEditableProperty = option">{{option.title}}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          BLA:{{selectedEditableProperty}}

          @if (selectedEditableProperty?.control === 'bool') {
            <mat-checkbox (change)="$event ? toggleAllRows() : null"
                          [checked]="selection.hasValue() && isAllSelected()"
                          [indeterminate]="selection.hasValue() && !isAllSelected()">
            </mat-checkbox>
          }

          <mat-form-field class="filter-field">
            <mat-label>Filter</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Ex. ium" #input>
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="$event ? toggleAllRows() : null"
                            [checked]="selection.hasValue() && isAllSelected()"
                            [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="$event ? selection.toggle(row) : null"
                            [checked]="selection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="alias">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let element"> {{element.alias}} </td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>TYPE</th>
            <td mat-cell *matCellDef="let element"> {{element.type}} </td>
          </ng-container>
          <ng-container matColumnDef="isRelevantForPresentationComplete">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>IsRelevant</th>
            <td mat-cell *matCellDef="let element">
              <mat-checkbox [style.pointer-events]="'none'" (click)="$event.stopPropagation()"
                [checked]="element.isRelevantForPresentationComplete">
              </mat-checkbox>
            </td>

          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
          <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"
              (click)="selection.toggle(row)">
          </tr>
        </table>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }
    .controls-area {
      display: flex;
    }
    .mat-mdc-row .mat-mdc-cell {
      border-bottom: 1px solid transparent;
      border-top: 1px solid transparent;
      cursor: pointer;
    }
    .mat-mdc-row:hover .mat-mdc-cell {
      border-color: currentColor;
    }
    .filter-field {
      margin-left: auto;
    }
  `
})
export class OverviewDialogComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  columnsToDisplay = ['select', 'alias', 'type', 'isRelevantForPresentationComplete'];
  dataSource = new MatTableDataSource<UIElement>(this.data.elements);
  selection = new SelectionModel<UIElement>(true, []);

  elementOptions: EditableProperty [] = [{ title: 'isRelevantForPresentationComplete', control: 'bool' }];
  selectedEditableProperty?: EditableProperty;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { elements: UIElement[] }) { }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

interface EditableProperty {
  title: string;
  control: 'text' | 'bool';
}

import {
  AfterViewInit, Component, ViewChild
} from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCell, MatCellDef, MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UIElement } from 'common/models/elements/element';
import { MatButton } from '@angular/material/button';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Section } from 'common/models/section';
import { EditorPage } from 'editor/src/app/models/editor-unit';
import { UnitService } from '../../services/unit-services/unit.service';
import { ElementService } from '../../services/unit-services/element.service';
import { IDEditDialogComponent } from './id-edit-dialog.component';

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
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatCheckbox,
    MatSortModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOptionModule,
    ReactiveFormsModule,
    MatNoDataRow,
    NgClass,
    MatIcon,
    MatSlideToggleModule
  ],
  template: `
    <mat-dialog-content>
        <h2 mat-dialog-title>Übersicht Elemente</h2>
        <div class="controls-area">
          <fieldset>
            <legend>Filter</legend>
            <mat-form-field [ngClass]="{'selected': pageFilter.length > 0}">
              <mat-label>Seiten</mat-label>
              <mat-select [(ngModel)]="pageFilter" [multiple]="true" (ngModelChange)="updatePageFilter()">
              <button mat-stroked-button [style.margin-bottom.px]="5" (click)="pageFilter = []; updatePageFilter();">
                  Filter zurücksetzen
                </button>
                @for (option of unitService.unit.pages; track option; let i = $index) {
                  <mat-option [value]="i">
                    {{ i + 1 }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field [ngClass]="{'selected': sectionFilter.length > 0}">
              <mat-label>Abschnitte</mat-label>
              <mat-select [(ngModel)]="sectionFilter" [multiple]="true" (ngModelChange)="updateSectionFilter()">
              <button mat-stroked-button [style.margin-bottom.px]="5"
                      (click)="sectionFilter = []; updateSectionFilter();">
                Filter zurücksetzen
              </button>
              @for (option of availableSections; track i; let i = $index) {
                <mat-option [value]="i">
                  {{ i + 1 }}
                </mat-option>
              }
              </mat-select>
            </mat-form-field>
          </fieldset>

          <fieldset class="editable-property-panel align-right">
            <legend>Mehrfachänderung</legend>
            <mat-form-field>
              <mat-label>Eigenschaft</mat-label>
              <mat-select>
                @for (option of elementOptions; track option) {
                  <mat-option [value]="option" (click)="selectedEditableProperty = option">
                    {{ option.displayName }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="property-edit-control-area">
              @if (selectedEditableProperty?.control === 'bool') {
                <mat-checkbox (change)="editablePropertyValue = $event.checked" >
                </mat-checkbox>
              }
            </div>
            <button mat-icon-button [disabled]="!selectedEditableProperty"
                    (click)="applyValueToSelection()">
              <mat-icon>check</mat-icon>
            </button>
          </fieldset>
        </div>

        Ausgewählte Elemente: {{ elementSelection.selected.length }}

        <table mat-table [dataSource]="tableData" matSort>
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox (change)="toggleAllRows()"
                            [checked]="tableSelection == 'all'"
                            [indeterminate]="tableSelection == 'some'">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="selectRow(row)"
                            [checked]="elementSelection.isSelected(row)">
              </mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="pageIndex">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Seite</th>
            <td mat-cell *matCellDef="let element">{{element.pageIndex + 1}}</td>
          </ng-container>
          <ng-container matColumnDef="sectionIndex">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Abschnitt</th>
            <td mat-cell *matCellDef="let element">{{element.sectionIndex + 1}}</td>
          </ng-container>
          <ng-container matColumnDef="alias">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let element">{{element.alias}}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Elementtyp</th>
            <td mat-cell *matCellDef="let element">{{'toolbox.' + element.type | translate }}</td>
          </ng-container>
          <ng-container matColumnDef="isRelevantForPresentationComplete">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Relevant für <br/> "Presentation Complete"</th>
            <td mat-cell *matCellDef="let element">
              @if (element.isRelevantForPresentationComplete) {
                <mat-icon>check</mat-icon>
              } @else {
                <mat-icon>close</mat-icon>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Aktionen</th>
            <td mat-cell *matCellDef="let element" >
              <div class="action-button-cell">
                <button (click)="$event.stopPropagation(); editAlias(element)">
                  <mat-icon>edit</mat-icon>
                  <span>
                  ID ändern
                  </span>
                </button>
                <button mat-icon-button [style.color]="'red'" (click)="$event.stopPropagation(); deleteElement(element)">
                  <mat-icon>delete</mat-icon>
                  Löschen
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
          <tr mat-row *matRowDef="let row; columns: columnsToDisplay;"
              (click)="elementSelection.toggle(row)">
          </tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="columnsToDisplay.length">
              Keine Daten vorhanden
            </td>
          </tr>
        </table>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="">
        {{'close' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './overview-dialog.component.css'
})
export class OverviewDialogComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  pageFilter: number[];
  sectionFilter: number[] = [];
  availableSections: number[] = [];
  tableSelection: 'none' | 'some' | 'all' = 'none';

  columnsToDisplay = ['select', 'pageIndex', 'sectionIndex', 'alias', 'type', 'isRelevantForPresentationComplete', 'actions'];
  tableData!: MatTableDataSource<GroupedUIElement>;
  elementSelection = new SelectionModel<GroupedUIElement>(true, []);

  elementOptions: EditableProperty [] = [{
    fieldName: 'isRelevantForPresentationComplete',
    displayName: 'Presentation Complete',
    control: 'bool'
  }];
  selectedEditableProperty?: EditableProperty;
  editablePropertyValue?: boolean;

  elementFilters: { page: number[]; section: number[]; } = {
    page: [],
    section: []
  };

  constructor(public unitService: UnitService, private elementService: ElementService, private dialog: MatDialog) {
    this.tableData = new MatTableDataSource<GroupedUIElement>(this.getTableData());
    this.tableData.filterPredicate = (data: GroupedUIElement, filter: string) => {
      const matchesPageFilter = this.elementFilters.page.length > 0 ?
        this.elementFilters.page.includes(data.pageIndex) : true;
      const matchesSectionFilter = this.elementFilters.section.length > 0 ?
        this.elementFilters.section.includes(data.sectionIndex) : true;
      return matchesPageFilter && matchesSectionFilter;
    };
    this.pageFilter = [];
    this.updateAvailableSections();
  }

  ngAfterViewInit() {
    this.tableData.sort = this.sort;
  }

  getTableData(): GroupedUIElement[] {
    const groupedElements: GroupedUIElement[] = [];
    this.unitService.unit.pages.forEach((page: EditorPage, pageIndex: number) => {
      page.sections.forEach((section: Section, sectionIndex: number) => {
        section.getAllElements().forEach((el: UIElement) => {
          el.pageIndex = pageIndex;
          el.sectionIndex = sectionIndex;
          groupedElements.push(el as GroupedUIElement);
        });
      });
    });
    return groupedElements;
  }

  updatePageFilter(): void {
    this.elementFilters.page = this.pageFilter;
    this.applyFilters();
    this.updateAvailableSections();
  }

  updateSectionFilter() {
    this.elementFilters.section = this.sectionFilter;
    this.applyFilters();
  }

  applyFilters() {
    this.tableData.filter = JSON.stringify(this.elementFilters);
    this.elementSelection.clear();
    this.updateTableSelection();
  }

  updateAvailableSections(): void {
    const selectedPages = this.pageFilter.length > 0 ?
      this.unitService.unit.pages.filter((_, index) => this.pageFilter.includes(index)) :
      this.unitService.unit.pages;
    const mostSectionsOnPage = selectedPages
      .reduce((prev: EditorPage, current: EditorPage) => (current.sections.length > prev.sections.length ? current : prev))
      .sections.length;
    this.availableSections = Array.from({ length: mostSectionsOnPage });
  }

  applyValueToSelection() {
    this.elementSelection.selected.forEach((element: GroupedUIElement) => {
      element.setProperty(this.selectedEditableProperty!.fieldName, this.editablePropertyValue);
    });
  }

  async deleteElement(el: UIElement) {
    await this.elementService.deleteElements([el]);
    this.tableData.data = this.getTableData();
  }

  editAlias(el: UIElement) {
    const dialogRef = this.dialog.open(IDEditDialogComponent, {
      data: { alias: el.alias }
    });
    return dialogRef.afterClosed().subscribe((newAlias: string) => {
      if (newAlias) el.setProperty('alias', newAlias);
    });
  }

  toggleAllRows() {
    this.tableSelection === 'all' ?
      this.elementSelection.clear() :
      this.tableData.filteredData.forEach(row => this.elementSelection.select(row));
    this.updateTableSelection();
  }

  selectRow(row: any): void {
    this.elementSelection.toggle(row);
    this.updateTableSelection();
  }

  updateTableSelection(): void {
    if (this.elementSelection.selected.length === 0) {
      this.tableSelection = 'none';
      return;
    }
    const numSelected = this.elementSelection.selected.length;
    const numRows = this.tableData.filteredData.length;
    this.tableSelection = numSelected === numRows ? 'all' : 'some';
  }
}

interface GroupedUIElement extends UIElement {
  pageIndex: number;
  sectionIndex: number;
}

interface EditableProperty {
  fieldName: string;
  displayName: string;
  control: 'text' | 'bool';
}

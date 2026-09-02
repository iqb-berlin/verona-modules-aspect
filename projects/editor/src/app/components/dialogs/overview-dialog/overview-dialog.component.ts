import {
  AfterViewInit, Component, ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UIElement } from 'common/models/elements/element';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Section } from 'common/models/section';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { IDEditDialogComponent } from 'editor/src/app/components/dialogs/id-edit-dialog/id-edit-dialog.component';

@Component({
  selector: 'aspect-overview-dialog',
  standalone: false,
  templateUrl: './overview-dialog.component.html',
  styleUrl: './overview-dialog.component.scss'
})
export class OverviewDialogComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  pageFilter: number[];
  sectionFilter: number[] = [];
  availableSections: number[] = [];
  tableSelection: 'none' | 'some' | 'all' = 'none';

  columnsToDisplay = [
    'select', 'pageIndex', 'sectionIndex', 'alias', 'type', 'isRelevantForPresentationComplete', 'actions'
  ];

  tableData!: MatTableDataSource<OverviewRow>;

  /** Every refresh builds new rows, so the selection is compared by the element in them. */
  elementSelection = new SelectionModel<OverviewRow>(true, [], true, (a, b) => a.element === b.element);

  elementOptions: EditableProperty [] = [{
    fieldName: 'isRelevantForPresentationComplete',
    displayName: 'Presentation Complete',
    control: 'bool'
  }];

  selectedEditableProperty?: EditableProperty;
  editablePropertyValue?: boolean = false;

  elementFilters: { page: number[]; section: number[]; } = {
    page: [],
    section: []
  };

  constructor(public unitService: UnitService, private elementService: ElementService, private dialog: MatDialog) {
    this.tableData = new MatTableDataSource<OverviewRow>(this.getTableData());
    this.tableData.sortingDataAccessor = OverviewDialogComponent.getSortValue;
    // The predicate decides from elementFilters, not from the table's own filter string, which is
    // why the second parameter MatTableDataSource passes stays unread.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.tableData.filterPredicate = (data: OverviewRow, filter: string) => {
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

  /** A row of its own around each element, holding where it sits in the unit. Written onto the
     elements, as it was before, those two numbers were own properties of the model and travelled into
     the stored unit definition with the next report -- outdated as soon as a section moved (#1273). */
  getTableData(): OverviewRow[] {
    const rows: OverviewRow[] = [];
    this.unitService.unit.pages.forEach((page: EditorPage, pageIndex: number) => {
      page.sections.forEach((section: Section, sectionIndex: number) => {
        const ownElements = new Set<UIElement>(section.elements);
        section.getAllElements().forEach((element: UIElement) => {
          /* Whatever getAllElements() has beyond what the section holds itself is a child of a
             compound element -- read off the same list rather than gathered a second time, so the two
             cannot drift apart if the reach of getAllElements ever changes. */
          rows.push({
            element, pageIndex, sectionIndex, isCompoundChild: !ownElements.has(element)
          });
        });
      });
    });
    return rows;
  }

  /** The columns are spread over the row and the element in it, so sorting has to be told where each
     one reads from: MatTableDataSource looks at data[columnName] and would find nothing for the
     columns of the element. */
  private static getSortValue(row: OverviewRow, columnName: string): string | number {
    switch (columnName) {
      case 'pageIndex': return row.pageIndex;
      case 'sectionIndex': return row.sectionIndex;
      case 'alias': return row.element.alias;
      case 'type': return row.element.type;
      case 'isRelevantForPresentationComplete': return row.element.isRelevantForPresentationComplete ? 1 : 0;
      default: return '';
    }
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
      .reduce((prev: EditorPage, current: EditorPage) => (
        current.sections.length > prev.sections.length ? current : prev))
      .sections.length;
    this.availableSections = Array.from({ length: mostSectionsOnPage });
  }

  applyValueToSelection() {
    this.elementService.updateElementsProperty(
      this.elementSelection.selected.map(row => row.element),
      // The button carries [disabled]="!selectedEditableProperty", so this runs only with one picked.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.selectedEditableProperty!.fieldName,
      this.editablePropertyValue
    );
  }

  /** The button of a compound child stays clickable so that it can carry its tooltip and the keyboard
     can reach it (`disabledInteractive`), so the refusal lives here as well as in the template: what
     a section does not hold itself cannot be deleted from this dialog (#1267). */
  async deleteElement(row: OverviewRow) {
    if (row.isCompoundChild) return;
    await this.elementService.deleteElements([row.element]);
    this.tableData.data = this.getTableData();
    this.dropSelectionOfGoneElements();
    this.updateTableSelection();
  }

  /** What the table no longer lists is out of the unit, and a selection of it would go on writing:
     "Mehrfachänderung" applies the property to `elementSelection.selected` and reports the unit as
     changed for an element that is not in it any more, while the header checkbox keeps counting it.
     Read off the rows rather than from the deleted element, because deleting a compound element takes
     the rows of its children with it -- and a deletion the user declined takes nothing at all, so its
     row is still there and stays selected (#1274). Whatever else is selected stays selected: the
     dialog deletes elements the user is not working on (#1258). */
  private dropSelectionOfGoneElements(): void {
    const listedElements = new Set<UIElement>(this.tableData.data.map(row => row.element));
    this.elementSelection.selected
      .filter(row => !listedElements.has(row.element))
      .forEach(row => this.elementSelection.deselect(row));
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

  selectRow(row: OverviewRow): void {
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

interface OverviewRow {
  element: UIElement;
  pageIndex: number;
  sectionIndex: number;
  /** A cloze gap, a table cell, a row of an option table. They are listed like everything else, but
     deleting cannot reach them: what a section holds itself is what `ElementService.deleteElements`
     removes (#1262), and a child goes through the edit dialog of its parent (#1267). */
  isCompoundChild: boolean;
}

interface EditableProperty {
  fieldName: string;
  displayName: string;
  control: 'text' | 'bool';
}

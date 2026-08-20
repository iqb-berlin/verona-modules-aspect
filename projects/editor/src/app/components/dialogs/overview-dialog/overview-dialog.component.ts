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

  columnsToDisplay = ['select', 'pageIndex', 'sectionIndex', 'alias', 'type', 'isRelevantForPresentationComplete', 'actions'];
  tableData!: MatTableDataSource<GroupedUIElement>;
  elementSelection = new SelectionModel<GroupedUIElement>(true, []);

  elementOptions: EditableProperty [] = [{
    fieldName: 'isRelevantForPresentationComplete',
    displayName: 'Presentation Complete',
    control: 'bool'
  }];

  /* The children of compound elements among the rows -- a cloze gap, a table cell, a row of an option
     table. They are listed like everything else, but deleting cannot reach them: what a section holds
     itself is what `ElementService.deleteElements` removes (#1262), and a child goes through the edit
     dialog of its parent. Rebuilt with the rows (#1267). */
  compoundChildren: ReadonlySet<UIElement> = new Set<UIElement>();

  selectedEditableProperty?: EditableProperty;
  editablePropertyValue?: boolean = false;

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
    const compoundChildren = new Set<UIElement>();
    this.unitService.unit.pages.forEach((page: EditorPage, pageIndex: number) => {
      page.sections.forEach((section: Section, sectionIndex: number) => {
        const ownElements = new Set<UIElement>(section.elements);
        section.getAllElements().forEach((el: UIElement) => {
          el.pageIndex = pageIndex;
          el.sectionIndex = sectionIndex;
          /* Whatever getAllElements() has beyond what the section holds itself is a child of a
             compound element -- read off the rows rather than gathered a second time, so the two
             cannot drift apart if the reach of getAllElements ever changes. */
          if (!ownElements.has(el)) compoundChildren.add(el);
          groupedElements.push(el as GroupedUIElement);
        });
      });
    });
    this.compoundChildren = compoundChildren;
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
    this.elementService.updateElementsProperty(
      this.elementSelection.selected, this.selectedEditableProperty!.fieldName, this.editablePropertyValue
    );
  }

  /* The button of a compound child stays clickable so that it can carry its tooltip and the keyboard
     can reach it (`disabledInteractive`), so the refusal lives here as well as in the template: what
     a section does not hold itself cannot be deleted from this dialog (#1267). */
  async deleteElement(el: UIElement) {
    if (this.compoundChildren.has(el)) return;
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

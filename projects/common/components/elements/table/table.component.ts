import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { TableElement } from 'common/models/elements/table';
import {
  AfterViewChecked, ChangeDetectorRef,
  Component, ElementRef, HostListener, OnInit,
  Input, Output, EventEmitter,
  QueryList, ViewChildren
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { UIElement } from 'common/models/elements/element';
import {
  TableChildOverlay
} from 'common/components/compound-group-elements/table-child-overlay/table-child-overlay.component';
import { Subject } from 'rxjs';
import { UIElementType } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends CompoundElementComponent implements OnInit, AfterViewChecked {
  private _elementModel!: TableElement;
  @Input()
  set elementModel(value: TableElement) {
    this._elementModel = value;
    this.initElementGrid();
  }

  get elementModel(): TableElement {
    return this._elementModel;
  }

  @Input() savedPlaybackTimes!: { [key: string]: number };
  @Input() savedTexts!: { [key: string]: string };
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() editorMode: boolean = false;
  /* Show add/remove buttons and element titles for managing cell elements.
     Only enabled in the table edit dialog, where the corresponding events are handled. */
  @Input() allowElementEditing: boolean = false;
  /* Fixed height for content rows, overriding the configured row sizes.
     Used by the table edit dialog to provide roomy cells while header rows stay compact. */
  @Input() contentRowHeight: string | null = null;
  @Output() elementAdded = new EventEmitter<{ elementType: UIElementType, row: number, col: number }>();
  @Output() elementRemoved = new EventEmitter<{ row: number, col: number }>();
  @Output() childElementSelected = new EventEmitter<TableChildOverlay>();
  @ViewChildren(TableChildOverlay) compoundChildren!: QueryList<TableChildOverlay>;
  @ViewChildren('headerCellElement') headerCellElements!: QueryList<ElementRef<HTMLElement>>;

  elementGrid: (UIElement | undefined)[][] = [];
  stickyHeaderOffsets: number[] = [];

  constructor(elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef) {
    super(elementRef);
  }

  ngOnInit(): void {
    this.initElementGrid();
  }

  ngAfterViewChecked(): void {
    this.updateStickyHeaderOffsets();
  }

  /* Sticky header rows below the first one need their top offset set to the summed
     height of the rows above them, so they stack instead of overlapping.
     Skipped in the edit dialog, where sticky headers would cover the content rows. */
  @HostListener('window:resize')
  updateStickyHeaderOffsets(): void {
    if (this.allowElementEditing || !this.elementModel.stickyHeader || !this.elementModel.headerEnabled) return;
    const headerCells = this.headerCellElements ? this.headerCellElements.toArray() : [];
    const offsets: number[] = [];
    let cellIndex = 0;
    let offsetSum = 0;
    this.elementModel.headerRows.forEach(headerRow => {
      offsets.push(offsetSum);
      offsetSum += headerCells[cellIndex] ? headerCells[cellIndex].nativeElement.offsetHeight : 0;
      cellIndex += headerRow.length;
    });
    if (offsets.length !== this.stickyHeaderOffsets.length ||
        offsets.some((offset, index) => offset !== this.stickyHeaderOffsets[index])) {
      this.stickyHeaderOffsets = offsets;
      this.changeDetectorRef.detectChanges();
    }
  }

  private initElementGrid(): void {
    this.elementGrid = new Array(this.elementModel.gridRowSizes.length).fill(undefined)
      .map(() => new Array(this.elementModel.gridColumnSizes.length).fill(undefined));
    const rowCount = this.elementGrid.length;
    const columnCount = rowCount ? this.elementGrid[0].length : 0;
    this.elementModel.elements.forEach(el => {
      const gridRow = (el.gridRow as number) ?? el.position?.gridRow ?? null;
      const gridColumn = (el.gridColumn as number) ?? el.position?.gridColumn ?? null;
      if (gridRow === null || gridColumn === null) return;
      const rowIndex = gridRow - 1;
      const columnIndex = gridColumn - 1;
      if (
        rowIndex < 0 ||
        columnIndex < 0 ||
        rowIndex >= rowCount ||
        columnIndex >= columnCount
      ) return;
      if (this.elementGrid[rowIndex][columnIndex] === undefined) this.elementGrid[rowIndex][columnIndex] = el;
    });
  }

  addElement(elementType: UIElementType, row: number, col: number): void {
    this.elementAdded.emit({ elementType, row, col });
  }

  updateHeaderCellText(rowIndex: number, colIndex: number, text: string): void {
    this.elementModel.headerRows[rowIndex][colIndex].text = text;
  }

  updateHeaderCellAlignment(rowIndex: number, colIndex: number, alignment: 'left' | 'center' | 'right'): void {
    this.elementModel.headerRows[rowIndex][colIndex].alignment = alignment;
  }

  addHeaderRow(): void {
    this.elementModel.addHeaderRow();
  }

  removeHeaderRow(rowIndex: number): void {
    this.elementModel.removeHeaderRow(rowIndex);
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray().map((child: TableChildOverlay) => child.childComponent);
  }

  refresh(): void {
    this.initElementGrid();
  }

  removeElement(row: number, col: number): void {
    this.elementRemoved.emit({ row: row, col: col });
    this.refresh();
  }
}

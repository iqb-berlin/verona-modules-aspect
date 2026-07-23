import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { TableElement } from 'common/models/elements/compound-elements/table/table';
import {
  Component, OnInit,
  Input, Output, EventEmitter,
  QueryList, ViewChildren
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { UIElement } from 'common/models/elements/element';
import { TableChildOverlay } from 'common/components/compound-elements/table/table-child-overlay.component';
import { Subject } from 'rxjs';
import { UIElementType } from 'common/interfaces';

@Component({
  selector: 'aspect-table',
  standalone: false,
  template: `
  <div class="grid-container" [style.display]="'grid'"
       [style.grid-template-columns]="elementModel.gridColumnSizes | measure"
       [style.grid-template-rows]="elementModel.gridRowSizes |
                                   tableGridRows : (elementModel.headerEnabled ? elementModel.headerRows.length : 0)"
       [style.grid-auto-columns]="'auto'"
       [style.grid-auto-rows]="'auto'"
       [style.background-color]="elementModel.styling.backgroundColor">
    @if (elementModel.headerEnabled) {
      @for (headerRow of elementModel.headerRows; track $index; let r = $index) {
        @for (headerCell of headerRow; track $index; let j = $index) {
          <div class="header-cell"
               [class.sticky-header]="elementModel.stickyHeader"
               [style.border-style]="elementModel.styling.borderStyle"
               [style.border-top-style]="(!elementModel.tableEdgesEnabled && r === 0) || (r > 0) ?
                                         'none' : elementModel.styling.borderStyle"
               [style.border-left-style]="(!elementModel.tableEdgesEnabled && j === 0) || (j > 0) ?
                                          'none' : elementModel.styling.borderStyle"
               [style.border-right-style]="(!elementModel.tableEdgesEnabled && j === headerRow.length - 1) ?
                                           'none' : elementModel.styling.borderStyle"
               [style.border-width.px]="elementModel.styling.borderWidth"
               [style.border-color]="elementModel.styling.borderColor"
               [style.border-radius.px]="elementModel.styling.borderRadius"
               [style.background-color]="elementModel.styling.backgroundColor === 'transparent' ?
                                         'white' : elementModel.styling.backgroundColor"
               [style.color]="elementModel.styling.fontColor"
               [style.font-family]="elementModel.styling.font"
               [style.font-size.px]="elementModel.styling.fontSize"
               [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
               [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
               [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
               [style.text-align]="headerCell.alignment"
               [style.grid-row-start]="r + 1"
               [style.grid-column-start]="j + 1">
            @if (allowElementEditing) {
              <div class="header-cell-editor">
                <input class="header-text-input"
                       [attr.aria-label]="'tableHeaderText' | translate"
                       [value]="headerCell.text"
                       (input)="updateHeaderCellText(r, j, $any($event.target).value)">
                <mat-button-toggle-group class="header-alignment-toggle"
                                         [value]="headerCell.alignment"
                                         (change)="updateHeaderCellAlignment(r, j, $event.value)">
                  <mat-button-toggle value="left" [matTooltip]="'tableHeaderAlignLeft' | translate">
                    <mat-icon>format_align_left</mat-icon>
                  </mat-button-toggle>
                  <mat-button-toggle value="center" [matTooltip]="'tableHeaderAlignCenter' | translate">
                    <mat-icon>format_align_center</mat-icon>
                  </mat-button-toggle>
                  <mat-button-toggle value="right" [matTooltip]="'tableHeaderAlignRight' | translate">
                    <mat-icon>format_align_right</mat-icon>
                  </mat-button-toggle>
                </mat-button-toggle-group>
              </div>
            } @else {
              {{ headerCell.text }}
            }
          </div>
        }
      }
    }
    <ng-container *ngFor="let row of elementGrid; let i = index;">
      <div *ngFor="let _ of row; let j = index;"
           class="cell-container"
           [style.border-style]="elementModel.styling.borderStyle"
           [style.border-top-style]="(elementModel.headerEnabled && elementModel.headerRows.length > 0) ||
                                     (!elementModel.tableEdgesEnabled && i === 0) || (i > 0) ?
                                     'none' : elementModel.styling.borderStyle"
           [style.border-bottom-style]="(!elementModel.tableEdgesEnabled && i === elementGrid.length - 1) ?
                                        'none' : elementModel.styling.borderStyle"
           [style.border-left-style]="(!elementModel.tableEdgesEnabled && j === 0) || (j > 0) ?
                                     'none' : elementModel.styling.borderStyle"
           [style.border-right-style]="(!elementModel.tableEdgesEnabled && j === row.length - 1) ?
                                       'none' : elementModel.styling.borderStyle"
           [style.border-width.px]="elementModel.styling.borderWidth"
           [style.border-color]="elementModel.styling.borderColor"
           [style.border-radius.px]="elementModel.styling.borderRadius"
           [style.grid-row-start]="i + 1 + (elementModel.headerEnabled ? elementModel.headerRows.length : 0)"
           [style.grid-column-start]="j + 1">
        <ng-container *ngIf="elementGrid[i][j] === undefined && allowElementEditing">
          <button mat-mini-fab color="primary" class="button"
                  [matMenuTriggerFor]="menu">
            <mat-icon>add</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="addElement('text', i, j)">Text</button>
            <button mat-menu-item (click)="addElement('text-field', i, j)">Eingabefeld</button>
            <button mat-menu-item (click)="addElement('text-area', i, j)">Eingabebereich</button>
            <button mat-menu-item (click)="addElement('checkbox', i, j)">Kontrollkästchen</button>
            <button mat-menu-item (click)="addElement('drop-list', i, j)">Ablegeliste</button>
            <button mat-menu-item (click)="addElement('image', i, j)">Bild</button>
            <button mat-menu-item (click)="addElement('audio', i, j)">Audio</button>
          </mat-menu>
        </ng-container>
        <div *ngIf="elementGrid[i][j] !== undefined" class="element-container">
          <div *ngIf="allowElementEditing" class="element-title">
            {{$any($any(elementGrid[i][j]).constructor).title}}
            <ng-container *ngIf="$any(elementGrid[i][j]).alias !== 'alias-placeholder'">
              - {{$any(elementGrid[i][j]).alias}}
            </ng-container>
          </div>
          <aspect-table-child-overlay [element]="$any(elementGrid[i][j])"
                                      [parentForm]="parentForm"
                                      [savedTexts]="savedTexts"
                                      [savedPlaybackTimes]="savedPlaybackTimes"
                                      [mediaStatusChanged]="mediaStatusChanged"
                                      [actualPlayingId]="actualPlayingId"
                                      [editorMode]="editorMode"
                                      (elementSelected)="childElementSelected.emit($event)">
          </aspect-table-child-overlay>
          <button *ngIf="allowElementEditing" class="remove-button" mat-mini-fab color="primary"
                  (click)="removeElement(i, j)">
            <mat-icon>remove</mat-icon>
          </button>
        </div>
      </div>
    </ng-container>
  </div>
`,
  styles: [`
  .header-cell {padding: 4px 8px;}
  /* Sticks within the table's grid container; with multiple header rows only the first one stays fully visible. */
  .sticky-header {position: sticky; top: 0; z-index: 2;}
  .header-cell-editor {display: flex; flex-direction: column; gap: 4px; width: 100%;}
  .header-text-input {width: 100%; box-sizing: border-box; text-align: inherit;}
  .header-alignment-toggle {align-self: flex-start;}
  .cell-container {display: flex; min-height: 50px;}
  .element-container {width: 100%; height: 100%; position: relative;}
  .cell-container > button {align-self: flex-end; justify-self: flex-start;}
  aspect-table-child-overlay {width: 100%; height: 100%;}
  .remove-button {position: absolute; bottom: 0;}
  .element-title {position: absolute; z-index: 1; background-color: white;}
`]
})
export class TableComponent extends CompoundElementComponent implements OnInit {
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
  @Output() elementAdded = new EventEmitter<{ elementType: UIElementType, row: number, col: number }>();
  @Output() elementRemoved = new EventEmitter<{ row: number, col: number }>();
  @Output() childElementSelected = new EventEmitter<TableChildOverlay>();
  @ViewChildren(TableChildOverlay) compoundChildren!: QueryList<TableChildOverlay>;

  elementGrid: (UIElement | undefined)[][] = [];

  ngOnInit(): void {
    this.initElementGrid();
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

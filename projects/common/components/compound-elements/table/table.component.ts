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
       [style.grid-template-rows]="elementModel.gridRowSizes | measure"
       [style.grid-auto-columns]="'auto'"
       [style.grid-auto-rows]="'auto'"
       [style.background-color]="elementModel.styling.backgroundColor">
    <ng-container *ngFor="let row of elementGrid; let i = index;">
      <div *ngFor="let _ of row; let j = index;"
           class="cell-container"
           [style.border-style]="elementModel.styling.borderStyle"
           [style.border-top-style]="(!elementModel.tableEdgesEnabled && i === 0) || (i > 0) ?
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
           [style.grid-row-start]="i + 1"
           [style.grid-column-start]="j + 1">
        <ng-container *ngIf="elementGrid[i][j] === undefined && editorMode">
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
          <div class="element-title">
            <ng-container *ngIf="editorMode">
              {{$any($any(elementGrid[i][j]).constructor).title}}
            </ng-container>
            <ng-container *ngIf="editorMode && $any(elementGrid[i][j]).alias !== 'alias-placeholder'">
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
          <button *ngIf="editorMode" class="remove-button" mat-mini-fab color="primary"
                  (click)="removeElement(i, j)">
            <mat-icon>remove</mat-icon>
          </button>
        </div>
      </div>
    </ng-container>
  </div>
`,
  styles: [`
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

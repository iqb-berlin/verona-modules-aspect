import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { TableElement } from 'common/models/elements/compound-elements/table/table';
import {
  Component, OnInit,
  Input, Output, EventEmitter,
  QueryList, ViewChildren
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SharedModule } from 'common/shared.module';
import { PositionedUIElement, UIElementType } from 'common/models/elements/element';
import { TableChildOverlay } from 'common/components/compound-elements/table/table-child-overlay.component';
import { MatMenuModule } from '@angular/material/menu';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { Subject } from 'rxjs';

@Component({
  selector: 'aspect-table',
  standalone: true,
  imports: [
    SharedModule,
    TableChildOverlay,
    MatMenuModule,
    MeasurePipe
  ],
  template: `
    <div [style.display]="'grid'"
         [style.grid-template-columns]="elementModel.gridColumnSizes | measure"
         [style.grid-template-rows]="elementModel.gridRowSizes | measure"
         [style.grid-auto-columns]="'auto'"
         [style.grid-auto-rows]="'auto'"
         [style.background-color]="elementModel.styling.backgroundColor">
      <ng-container *ngFor="let row of elementGrid; let i = index;">
        <div *ngFor="let column of row; let j = index;"
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
              <button mat-menu-item (click)="addElement('checkbox', i, j)">Kontrollkästchen</button>
              <button mat-menu-item (click)="addElement('drop-list', i, j)">Ablegeliste</button>
              <button mat-menu-item (click)="addElement('image', i, j)">Bild</button>
              <button mat-menu-item (click)="addElement('audio', i, j)">Audio</button>
            </mat-menu>
          </ng-container>
          <div *ngIf="elementGrid[i][j] !== undefined" class="element-container">
            <button *ngIf="editorMode" class="button" mat-mini-fab color="primary"
                    (click)="removeElement(i, j)">
              <mat-icon>remove</mat-icon>
            </button>
            <aspect-table-child-overlay [element]="$any(elementGrid[i][j])"
                                        [parentForm]="parentForm"
                                        [savedTexts]="savedTexts"
                                        [savedPlaybackTimes]="savedPlaybackTimes"
                                        [mediaStatusChanged]="mediaStatusChanged"
                                        [actualPlayingId]="actualPlayingId"
                                        [editorMode]="editorMode"
                                        (elementSelected)="childElementSelected.emit($event)">
            </aspect-table-child-overlay>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .cell-container {display: flex; align-items: center; justify-content: center; min-height: 50px; min-width: 50px;}
    .element-container {width: 100%; height: 100%; display: flex; align-items: flex-end;}
    aspect-table-child-overlay {width: 100%; height: 100%;}
    .button {position: absolute;}
  `]
})
export class TableComponent extends CompoundElementComponent implements OnInit {
  @Input() elementModel!: TableElement;
  @Input() savedPlaybackTimes!: { [key: string]: number };
  @Input() savedTexts!: { [key: string]: string };
  @Input() actualPlayingId!: Subject<string | null>;
  @Input() mediaStatusChanged!: Subject<string>;
  @Input() editorMode: boolean = false;
  @Output() elementAdded = new EventEmitter<{ elementType: UIElementType, row: number, col: number }>();
  @Output() elementRemoved = new EventEmitter<number>();
  @Output() childElementSelected = new EventEmitter<TableChildOverlay>();
  @ViewChildren(TableChildOverlay) compoundChildren!: QueryList<TableChildOverlay>;

  elementGrid: (PositionedUIElement | undefined)[][] = [];

  ngOnInit(): void {
    this.initElementGrid();
  }

  private initElementGrid(): void {
    this.elementGrid = new Array(this.elementModel.gridRowSizes.length).fill(undefined)
      .map(() => new Array(this.elementModel.gridColumnSizes.length).fill(undefined));
    this.elementModel.elements.forEach(el => {
      this.elementGrid[(el.position.gridRow as number) - 1][(el.position.gridColumn as number) - 1] = el;
    });
  }

  addElement(elementType: UIElementType, row: number, col: number): void {
    this.elementAdded.emit({ elementType, row, col });
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.toArray().map((child: TableChildOverlay) => child.childComponent.instance);
  }

  refresh(): void {
    this.initElementGrid();
  }

  removeElement(row: number, col: number): void {
    this.elementRemoved.emit(this.elementGrid.flat()
      .findIndex(el => el?.position.gridRow === row && el?.position.gridColumn === col));
    this.refresh();
  }
}

import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessageService } from 'common/services/message.service';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from '../../services/unit.service';
import { DialogService } from '../../services/dialog.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-section-menu',
  template: `
    <button mat-mini-fab [matMenuTriggerFor]="elementListMenu"
            [matTooltip]="'Elementliste'"
            [matTooltipPosition]="'left'">
      <mat-icon>list</mat-icon>
    </button>
    <mat-menu #elementListMenu="matMenu" class="layoutMenu" xPosition="before">
      <mat-action-list>
        <ng-container *ngIf="section.elements.length === 0">
          Keine Elemente im Abschnitt
        </ng-container>
        <mat-list-item *ngFor="let element of section.elements"
                       (click)="selectElement(element)">
          {{element.id}}
        </mat-list-item>
      </mat-action-list>
    </mat-menu>

    <button mat-mini-fab [matTooltip]="'Hintergrundfarbe'" [matTooltipPosition]="'left'"
            (click)="openColorPicker()">
      <mat-icon>palette</mat-icon>
    </button>
    <input #colorPicker type="color" [style.display]="'none'"
           [value]="$any(section.backgroundColor)"
           (change)="updateModel('backgroundColor', $any($event.target).value)">

    <button mat-mini-fab [matMenuTriggerFor]="activeAfterIDMenu"
            [matTooltip]="'Sichtbarkeit'" [matTooltipPosition]="'left'">
      <mat-icon>disabled_visible</mat-icon>
    </button>
    <mat-menu #activeAfterIDMenu="matMenu"
              class="activeAfterID-menu" xPosition="before">
      <mat-form-field appearance="outline">
        <mat-label>{{'section-menu.activeAfterID' | translate }}</mat-label>
        <input matInput
               [value]="$any(section.activeAfterID)"
               (click)="$any($event).stopPropagation()"
               (change)="updateModel('activeAfterID', $any($event.target).value)">
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{'section-menu.activeAfterIdDelay' | translate }}</mat-label>
        <input matInput type="number" step="1000" min="0"
               [disabled]="!section.activeAfterID"
               [value]="$any(section.activeAfterIdDelay)"
               (click)="$any($event).stopPropagation()"
               (change)="updateModel('activeAfterIdDelay', $any($event.target).value)">
      </mat-form-field>
    </mat-menu>
    <button mat-mini-fab [matMenuTriggerFor]="layoutMenu"
            [matTooltip]="'Layout'" [matTooltipPosition]="'left'">
      <mat-icon>space_dashboard</mat-icon>
    </button>
    <mat-menu #layoutMenu="matMenu" class="layoutMenu" xPosition="before">
      <div (click)="$event.stopPropagation()">
        <mat-checkbox class="menuItem" [checked]="section.dynamicPositioning"
                      (click)="$any($event).stopPropagation()"
                      (change)="updateModel('dynamicPositioning', $event.checked)">
          {{'section-menu.dynamic-positioning' | translate }}
        </mat-checkbox>
        <ng-container *ngIf="!section.dynamicPositioning">
          <mat-form-field class="section-height-input" appearance="outline">
            <mat-label>{{'section-menu.height' | translate }}</mat-label>
            <input matInput type="number"
                   [value]="$any(section.height)"
                   (click)="$any($event).stopPropagation()"
                   (change)="updateModel('height', $any($event.target).value)">
          </mat-form-field>
        </ng-container>
        <div *ngIf="section.dynamicPositioning">
          <fieldset>
            <legend>{{'section-menu.columns' | translate }}</legend>

            <mat-checkbox class="menuItem" [checked]="section.autoColumnSize"
                          (click)="$any($event).stopPropagation()"
                          (change)="updateModel('autoColumnSize', $event.checked)">
              {{'section-menu.autoColumnSize' | translate }}
            </mat-checkbox>
            <ng-container *ngIf="!section.autoColumnSize">
              <mat-form-field appearance="outline">
                <mat-label>{{'section-menu.columnCount' | translate }}</mat-label>
                <input matInput type="number"
                       [value]="$any(section.gridColumnSizes.split(' ').length)"
                       (click)="$any($event).stopPropagation()"
                       (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">
              </mat-form-field>
              <div *ngFor="let size of columnSizes ; let i = index" class="size-inputs">
                <mat-form-field class="size-item">
                  <mat-label>{{'section-menu.width' | translate }} {{i + 1}}</mat-label>
                  <input matInput type="number"
                         [value]="size.value"
                         (click)="$any($event).stopPropagation()"
                         (change)="changeGridSize('gridColumnSizes', i, false, $any($event).target.value)">
                </mat-form-field>
                <mat-form-field class="size-item-unit">
                  <mat-label>Einheit</mat-label>
                  <mat-select [value]="size.unit"
                              (click)="$any($event).stopPropagation()"
                              (selectionChange)="changeGridSize('gridColumnSizes', i, true, $event.value)">
                    <mat-option value="fr">{{'section-menu.fraction' | translate }}</mat-option>
                    <mat-option value="px">{{'section-menu.pixel' | translate }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </ng-container>
          </fieldset>

          <fieldset>
            <legend>{{'section-menu.rows' | translate }}</legend>
            <mat-checkbox class="menuItem" [checked]="section.autoRowSize"
                          (click)="$any($event).stopPropagation()"
                          (change)="updateModel('autoRowSize', $event.checked)">
              {{'section-menu.autoRowSize' | translate }}
            </mat-checkbox>
            <ng-container *ngIf="!section.autoRowSize">
              <mat-form-field appearance="outline">
                <mat-label>{{'section-menu.height' | translate }}</mat-label>
                <input matInput type="number"
                       [value]="$any(section.height)"
                       (click)="$any($event).stopPropagation()"
                       (change)="updateModel('height', $any($event.target).value)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{'section-menu.rowCount' | translate }}</mat-label>
                <input matInput type="number"
                       [value]="$any(section.gridRowSizes.split(' ').length)"
                       (click)="$any($event).stopPropagation()"
                       (change)="modifySizeArray('gridRowSizes', $any($event).target.value)">
              </mat-form-field>
              <div *ngFor="let size of rowSizes ; let i = index" class="size-inputs fx-row-start-stretch">
                <mat-form-field class="size-item">
                  <mat-label>{{'section-menu.height' | translate }} {{i + 1}}</mat-label>
                  <input matInput type="number"
                         [value]="size.value"
                         (click)="$any($event).stopPropagation()"
                         (change)="changeGridSize('gridRowSizes', i, false, $any($event).target.value)">
                </mat-form-field>
                <mat-form-field class="size-item-unit">
                  <mat-select [value]="size.unit"
                              (click)="$any($event).stopPropagation()"
                              (selectionChange)="changeGridSize('gridRowSizes', i, true, $event.value)">
                    <mat-option value="fr">{{'section-menu.fraction' | translate }}</mat-option>
                    <mat-option value="px">{{'section-menu.pixel' | translate }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </ng-container>
          </fieldset>
        </div>
      </div>
    </mat-menu>

    <button mat-mini-fab [matTooltip]="'Abschnitt kopieren'" [matTooltipPosition]="'left'"
            (click)="copySectionToClipboard()">
      <mat-icon>content_copy</mat-icon>
    </button>
    <button mat-mini-fab
            [matTooltip]="'Abschnitt einfügen'" [matTooltipPosition]="'left'"
            (click)="showSectionInsertDialog()">
      <mat-icon>content_paste</mat-icon>
    </button>
    <button *ngIf="allowMoveUp" mat-mini-fab
            [matTooltip]="'Nach oben verschieben'" [matTooltipPosition]="'left'"
            (click)="this.moveSection.emit('up')">
      <mat-icon>north</mat-icon>
    </button>
    <button *ngIf="allowMoveDown" mat-mini-fab
            [matTooltip]="'Nach unten verschieben'" [matTooltipPosition]="'left'"
            (click)="this.moveSection.emit('down')">
      <mat-icon>south</mat-icon>
    </button>
    <button mat-mini-fab [matTooltip]="'Duplizieren'" [matTooltipPosition]="'left'"
            (click)="duplicateSection.emit()">
      <mat-icon>control_point_duplicate</mat-icon>
    </button>
    <button *ngIf="allowDelete" mat-mini-fab
            [matTooltip]="'Löschen'" [matTooltipPosition]="'left'"
            (click)="deleteSection()">
      <mat-icon>clear</mat-icon>
    </button>
  `,
  styles: [`
    ::ng-deep .layoutMenu {
      padding: 0 15px; width: 250px;
    }
    ::ng-deep .layoutMenu fieldset {
      margin: 10px 0; display: flex; flex-direction: column; align-items: start;
    }
    ::ng-deep .layoutMenu .section-height-input {
      margin-top: 10px;
    }
    ::ng-deep .layoutMenu .size-inputs .mat-form-field {
      width: 100px;
    }
    ::ng-deep .layoutMenu .size-inputs {
      display: flex; flex-direction: row; gap: 15px;
    }
    .menuItem {
      margin-bottom: 5px;
    }
    ::ng-deep .activeAfterID-menu .mat-form-field {
      width:90%; margin-left: 10px;
    }
    .fx-row-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: stretch;
    }
  `]
})
export class SectionMenuComponent implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() allowMoveUp!: boolean;
  @Input() allowMoveDown!: boolean;
  @Input() allowDelete!: boolean;
  @Output() moveSection = new EventEmitter<'up' | 'down'>();
  @Output() duplicateSection = new EventEmitter();
  @Output() selectElementComponent = new EventEmitter<UIElement>();

  @ViewChild('colorPicker') colorPicker!: ElementRef;
  columnSizes: { value: string, unit: string }[] = [];
  rowSizes: { value: string, unit: string }[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.updateGridSizes();
  }

  updateModel(property: string, value: string | number | boolean): void {
    this.unitService.updateSectionProperty(this.section, property, value);
  }

  selectElement(element: UIElement): void {
    this.selectElementComponent.emit(element);
  }

  deleteSection(): void {
    this.dialogService.showConfirmDialog('Abschnitt löschen?')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result: boolean) => {
        if (result) {
          this.unitService.deleteSection(this.section);
          if (this.sectionIndex === this.selectionService.selectedPageSectionIndex &&
            this.selectionService.selectedPageSectionIndex > 0) {
            this.selectionService.selectedPageSectionIndex -= 1;
          }
        }
      });
  }

  /* Initialize internal array of grid sizes. Where value and unit are put, split up, in an array. */
  private updateGridSizes(): void {
    this.columnSizes = [];
    this.section.gridColumnSizes.split(' ').forEach((size: string) => {
      this.columnSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
    this.rowSizes = [];
    this.section.gridRowSizes.split(' ').forEach((size: string) => {
      this.rowSizes.push({ value: size.slice(0, -2), unit: size.slice(-2) });
    });
  }

  /* Add elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const oldSizesAsArray = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes.split(' ') :
      this.section.gridRowSizes.split(' ');

    let newArray = [];
    if (newLength < oldSizesAsArray.length) {
      newArray = oldSizesAsArray.slice(0, newLength);
    } else {
      newArray.push(
        ...oldSizesAsArray,
        ...Array(newLength - oldSizesAsArray.length).fill('1fr')
      );
    }
    this.updateModel(property, newArray.join(' '));
    this.updateGridSizes();
  }

  /* Replace number or unit is size string. '2fr 1fr' -> '2px 3fr' */
  changeGridSize(property: string, index: number, unit: boolean = false, newValue: string): void {
    const oldSizesAsArray = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes.split(' ') :
      this.section.gridRowSizes.split(' ');

    if (unit) {
      oldSizesAsArray[index] = oldSizesAsArray[index].slice(0, -2) + newValue;
    } else {
      oldSizesAsArray[index] = newValue + oldSizesAsArray[index].slice(-2);
    }

    this.updateModel(property, oldSizesAsArray.join(' '));
    this.updateGridSizes();
  }

  openColorPicker(): void {
    this.colorPicker.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  copySectionToClipboard() {
    this.clipboard.copy(JSON.stringify(this.section));
    this.messageService.showSuccess('Abschnitt in Zwischenablage kopiert');
  }

  showSectionInsertDialog(): void {
    this.dialogService.showSectionInsertDialog(this.section)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((newSection: Section) => {
        if (newSection) {
          newSection.getAllElements().filter(element => !this.idService.isIdAvailable(element.id)).forEach(element => {
            element.id = this.idService.getAndRegisterNewID(element.type);
            if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
              (element as DropListElement).value
                .filter(valueElement => !this.idService.isIdAvailable(valueElement.id))
                .forEach(valueElement => {
                  valueElement.id = this.idService.getAndRegisterNewID('value');
                });
            }
          });
          this.unitService.replaceSection(this.selectionService.selectedPageIndex, this.sectionIndex, newSection);
        }
      });
  }
}

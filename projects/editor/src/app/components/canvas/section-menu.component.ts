import {
  Component, OnDestroy, Input, Output, EventEmitter,
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
                       [value]="$any(section.gridColumnSizes.length)"
                       (click)="$any($event).stopPropagation()"
                       (change)="modifySizeArray('gridColumnSizes', $any($event).target.value)">
              </mat-form-field>
              <ng-container *ngFor="let size of section.gridColumnSizes; let i = index">
                <aspect-size-input-panel [label]="('section-menu.width' | translate) + ' ' + (i + 1)"
                                         [value]="size.value"
                                         [unit]="size.unit"
                                         [allowedUnits]="['px', 'fr']"
                                         (valueUpdated)="changeGridSize('gridColumnSizes', i, $event)">
                </aspect-size-input-panel>
              </ng-container>
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
                       [value]="$any(section.gridRowSizes.length)"
                       (click)="$any($event).stopPropagation()"
                       (change)="modifySizeArray('gridRowSizes', $any($event).target.value)">
              </mat-form-field>
              <ng-container *ngFor="let size of section.gridRowSizes ; let i = index">
                <aspect-size-input-panel [label]="('section-menu.height' | translate) + ' ' + (i + 1)"
                                         [value]="size.value"
                                         [unit]="size.unit"
                                         [allowedUnits]="['px', 'fr']"
                                         (valueUpdated)="changeGridSize('gridRowSizes', i, $event)">
                </aspect-size-input-panel>
              </ng-container>
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
  styles: [
    '::ng-deep .layoutMenu {padding: 0 15px; width: 250px;}',
    '::ng-deep .layoutMenu fieldset {margin: 10px 0; display: flex; flex-direction: column; align-items: flex-start;}',
    '::ng-deep .layoutMenu .section-height-input {margin-top: 10px;}',
    '.menuItem {margin-bottom: 5px;}',
    '::ng-deep .activeAfterID-menu .mat-form-field {width:90%; margin-left: 10px;}'
  ]
})
export class SectionMenuComponent implements OnDestroy {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() allowMoveUp!: boolean;
  @Input() allowMoveDown!: boolean;
  @Input() allowDelete!: boolean;
  @Output() moveSection = new EventEmitter<'up' | 'down'>();
  @Output() duplicateSection = new EventEmitter();
  @Output() selectElementComponent = new EventEmitter<UIElement>();

  @ViewChild('colorPicker') colorPicker!: ElementRef;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private clipboard: Clipboard) { }

  updateModel(property: string, value: string | number | boolean | { value: number; unit: string }[]): void {
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

  /* Add or remove elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes : this.section.gridRowSizes;

    let newArray = [];
    if (newLength < sizeArray.length) {
      newArray = sizeArray.slice(0, newLength);
    } else {
      newArray.push(
        ...sizeArray,
        ...Array(newLength - sizeArray.length).fill({ value: 1, unit: 'fr' })
      );
    }
    this.updateModel(property, newArray);
  }

  changeGridSize(property: string, index: number, newValue: { value: number; unit: string }): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes : this.section.gridRowSizes;
    sizeArray[index] = newValue;
    this.updateModel(property, [...sizeArray]);
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

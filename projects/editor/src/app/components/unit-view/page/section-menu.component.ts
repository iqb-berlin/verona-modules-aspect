import {
  Component, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { MessageService } from 'editor/src/app/services/message.service';
import { CompoundElement, Measurement, UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { IDService } from 'editor/src/app/services/id.service';
import { VisibilityRule } from 'common/models/visibility-rule';
import { UnitService } from '../../../services/unit-services/unit.service';
import { DialogService } from '../../../services/dialog.service';
import { SelectionService } from '../../../services/selection.service';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { SizeInputPanelComponent } from 'editor/src/app/components/util/size-input-panel.component';

@Component({
  selector: 'aspect-section-menu',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    MatButtonModule,
    TranslateModule,
    MatCheckboxModule,
    MatFormFieldModule,
    NgIf,
    MatInputModule,
    SizeInputPanelComponent,
    NgForOf
  ],
  template: `
    <button mat-mini-fab [matMenuTriggerFor]="elementListMenu"
            [matTooltip]="'Elementliste'"
            [matTooltipPosition]="'left'">
      <mat-icon>list</mat-icon>
    </button>
    <mat-menu #elementListMenu="matMenu" xPosition="before">
      <mat-action-list [style.padding.px]="5">
        <ng-container *ngIf="section.elements.length === 0">
          Keine Elemente im Abschnitt
        </ng-container>
        <mat-list-item *ngFor="let element of section.elements"
                       (mouseover)="onUnitListElHover(element)"
                       (mouseleave)="onUnitListElLeave()"
                       (click)="onUnitListElClick(element)">
          <mat-icon matListItemIcon [style.margin-right.px]="10">
            {{ $any(element.constructor).icon }}
          </mat-icon>
          <div matListItemTitle>
            <i>{{ element.id }}</i>
          </div>

        </mat-list-item>
      </mat-action-list>
    </mat-menu>

    <button *ngIf="unitService.expertMode" mat-mini-fab [matTooltip]="'Hintergrundfarbe'" [matTooltipPosition]="'left'"
            (click)="openColorPicker()">
      <mat-icon>palette</mat-icon>
    </button>
    <input *ngIf="unitService.expertMode" #colorPicker type="color" [style.display]="'none'"
           [value]="$any(section.backgroundColor)"
           (change)="updateModel('backgroundColor', $any($event.target).value)">

    <button mat-mini-fab [color]="section.ignoreNumbering ? 'primary' : 'accent'"
            (click)="ignoreNumbering()"
            [matTooltip]="'Von der Nummerierung ausnehmen'" [matTooltipPosition]="'left'">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
        <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56
                 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z"/>
      </svg>
    </button>

    <button *ngIf="unitService.expertMode" mat-mini-fab
            (click)="showVisibilityRulesDialog()"
            [matTooltip]="'Sichtbarkeit'" [matTooltipPosition]="'left'">
      <mat-icon>disabled_visible</mat-icon>
    </button>

    <button *ngIf="unitService.expertMode" mat-mini-fab [matMenuTriggerFor]="layoutMenu"
            [matTooltip]="'Layout'" [matTooltipPosition]="'left'">
      <mat-icon>space_dashboard</mat-icon>
    </button>
    <mat-menu #layoutMenu="matMenu" xPosition="before">
      <div (click)="$event.stopPropagation()" class="layoutMenu">
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
                   (change)="updateModel('height', $any($event.target).value || 0)">
          </mat-form-field>
        </ng-container>
        <div *ngIf="section.dynamicPositioning">
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
                       (change)="updateModel('height', $any($event.target).value || 0)">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{'section-menu.rowCount' | translate }}</mat-label>
                <input matInput type="number"
                       [value]="$any(section.gridRowSizes.length)"
                       (click)="$any($event).stopPropagation()"
                       (change)="modifySizeArray('gridRowSizes', $any($event).target.value || 0)">
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
                       (change)="modifySizeArray('gridColumnSizes', $any($event).target.value || 0)">
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
        </div>
      </div>
    </mat-menu>

    <button *ngIf="unitService.expertMode" mat-mini-fab
            [matTooltip]="'Abschnitt kopieren'" [matTooltipPosition]="'left'"
            (click)="copySection()">
      <mat-icon>content_copy</mat-icon>
    </button>
    <button *ngIf="unitService.expertMode" mat-mini-fab
            [matTooltip]="'Abschnitt einfügen'" [matTooltipPosition]="'left'"
            (click)="showSectionInsertDialog()">
      <mat-icon>content_paste</mat-icon>
    </button>
    <button *ngIf="sectionIndex !== 0" mat-mini-fab
            [matTooltip]="'Nach oben verschieben'" [matTooltipPosition]="'left'"
            (click)="this.moveSection('up')">
      <mat-icon>north</mat-icon>
    </button>
    <button *ngIf="sectionIndex < lastSectionIndex" mat-mini-fab
            [matTooltip]="'Nach unten verschieben'" [matTooltipPosition]="'left'"
            (click)="this.moveSection('down')">
      <mat-icon>south</mat-icon>
    </button>
    <button *ngIf="unitService.expertMode" mat-mini-fab [matTooltip]="'Duplizieren'" [matTooltipPosition]="'left'"
            (click)="duplicateSection()">
      <mat-icon>control_point_duplicate</mat-icon>
    </button>
    <button *ngIf="lastSectionIndex > 0" mat-mini-fab
            [matTooltip]="'Löschen'" [matTooltipPosition]="'left'"
            (click)="deleteSection()">
      <mat-icon>clear</mat-icon>
    </button>
  `,
  styles: [
    '.layoutMenu {padding: 5px; width: 250px;}',
    'aspect-size-input-panel {max-width: 100%;}',
    '.layoutMenu fieldset {display: flex; flex-direction: column; align-items: flex-start;}',
    '.menuItem {margin-bottom: 5px;}',
    '::ng-deep .activeAfterID-menu .mat-mdc-form-field {width:90%; margin-left: 10px;}'
  ]
})
export class SectionMenuComponent implements OnDestroy {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() lastSectionIndex!: number;
  @Output() elementSelected = new EventEmitter<string>();
  @Output() elementHovered = new EventEmitter<string>();
  @Output() elementHoverEnd = new EventEmitter();

  @ViewChild('colorPicker') colorPicker!: ElementRef;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private sectionService: SectionService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private clipboard: Clipboard) { }

  updateModel(
    property: string, value: string | number | boolean | VisibilityRule[] | { value: number; unit: string }[]
  ): void {
    this.sectionService.updateSectionProperty(this.section, property, value);
  }

  onUnitListElClick(element: UIElement): void {
    this.elementHoverEnd.emit();
    this.elementSelected.emit(element.id);
  }

  onUnitListElHover(element: UIElement): void {
    this.elementHovered.emit(element.id);
  }

  onUnitListElLeave(): void {
    this.elementHoverEnd.emit();
  }

  deleteSection(): void {
    this.sectionService.deleteSection(this.selectionService.selectedPageIndex, this.sectionIndex);
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

  copySection() {
    this.copySectionToClipboard();
    this.unitService.savedSectionCode = JSON.stringify(this.section);
  }

  copySectionToClipboard() {
    this.clipboard.copy(JSON.stringify(this.section));
    this.messageService.showSuccess('Abschnitt in Zwischenablage kopiert');
  }

  showSectionInsertDialog(): void {
    this.dialogService.showSectionInsertDialog(this.section.elements.length === 0)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: { newSection: Section, replaceSection: boolean }) => {
        if (data.newSection) {
          const duplicateIDs = data.newSection.getAllElements()
            .filter(element => !this.idService.isIdAvailable(element.id));
          duplicateIDs.forEach(element => {
            element.id = this.idService.getNewID(element.type);
            if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
              (element as DropListElement).value
                .filter(valueElement => !this.idService.isIdAvailable(valueElement.id))
                .forEach(valueElement => {
                  valueElement.id = this.idService.getNewID('value');
                });
            }
          });
          if (data.replaceSection) {
            this.sectionService.replaceSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, data.newSection);
          } else {
            this.sectionService.insertSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, data.newSection);
          }
        }
      });
  }

  showVisibilityRulesDialog(): void {
    this.dialogService
      .showVisibilityRulesDialog(
        this.section.visibilityRules,
        this.section.logicalConnectiveOfRules,
        this.getControlIds(),
        this.section.visibilityDelay,
        this.section.animatedVisibility,
        this.section.enableReHide
      )
      .subscribe(visibilityConfig => {
        if (visibilityConfig) {
          this.updateModel('visibilityRules', visibilityConfig.visibilityRules);
          this.updateModel('logicalConnectiveOfRules', visibilityConfig.logicalConnectiveOfRules);
          this.updateModel('visibilityDelay', visibilityConfig.visibilityDelay);
          this.updateModel('animatedVisibility', visibilityConfig.animatedVisibility);
          this.updateModel('enableReHide', visibilityConfig.enableReHide);
        }
      });
  }

  private getControlIds(): string[] {
    return this.unitService.unit.getAllElements()
      .filter(element => !(element instanceof CompoundElement))
      .map(element => element.id)
      .concat(this.unitService.unit.stateVariables
        .map(element => element.id));
  }

  ignoreNumbering() {
    this.updateModel('ignoreNumbering', !this.section.ignoreNumbering);
  }

  moveSection(direction: 'up' | 'down') {
    this.sectionService.moveSection(this.section, direction);
  }

  duplicateSection() {
    this.sectionService.duplicateSection(this.section, this.sectionIndex);
  }
}

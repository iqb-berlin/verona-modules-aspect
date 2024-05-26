import { Component, Input, OnDestroy } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Page } from 'common/models/page';
import { takeUntil } from 'rxjs/operators';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'common/services/message.service';
import { Subject } from 'rxjs';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatTooltipModule } from '@angular/material/tooltip';

/** Custom options the configure the tooltip's default show/hide delays. */
export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 400,
  hideDelay: 0,
  touchendHideDelay: 0,
  position: 'above'
};

@Component({
  selector: 'aspect-unit-view-page-menu',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    MatTooltipModule
  ],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults}],
  template: `
    <div [style]="'display: flex;'">
      <button [disabled]="page.alwaysVisible"
              [style]="'justify-content: center'"
              [matTooltip]="'Seite nach vorn verschieben'"
              mat-menu-item (click)="movePage(page,'left')">
        <mat-icon>west</mat-icon>
      </button>
      <button [disabled]="page.alwaysVisible"
              [style]="'justify-content: center;'"
              [matTooltip]="'Seite nach hinten verschieben'"
              mat-menu-item (click)="movePage(page, 'right')">
        <mat-icon>east</mat-icon>
      </button>
    </div>

    <button mat-menu-item class="delete-button"
            [matTooltip]="'Seite löschen'"
            (click)="deletePage()">
      <mat-icon>delete</mat-icon>
    </button>

    <mat-divider></mat-divider>

    <fieldset class="fx-column-start-stretch">
      <legend>Seitenbreite</legend>
      <mat-checkbox class="menuItem"
                    [matTooltip]="'Abgewählt wird die verfügbare Bildschirmbreite voll ausgenutzt.'"
                    [checked]="page.hasMaxWidth"
                    (click)="$event.stopPropagation()"
                    (change)="updateModel(page, 'hasMaxWidth', $event.source.checked)">
        Seitenbreite begrenzen
      </mat-checkbox>
      <p class="menuItem" [style.margin-top.px]="5" [style.margin-left.px]="10">
        effektive Seitenbreite: <br>{{page.hasMaxWidth ? page.maxWidth + 2 * page.margin + 'px' : '∞'}}
      </p>
      <mat-form-field class="menuItem" appearance="fill">
        <mat-label>Seitenbreite in px</mat-label>
        <input matInput type="number" min="0" #maxWidth="ngModel"
               [disabled]="!page.hasMaxWidth"
               [ngModel]="page.hasMaxWidth ? page.maxWidth : null"
               (click)="$event.stopPropagation()"
               (ngModelChange)="updateModel(page,'maxWidth', $event || 0, maxWidth.valid)">
      </mat-form-field>
      <mat-form-field class="menuItem" appearance="fill">
        <mat-label>Randbreite in px</mat-label>
        <input matInput type="number" min="0" #margin="ngModel"
               [ngModel]="page.margin"
               (click)="$event.stopPropagation()"
               (ngModelChange)="updateModel(page,'margin', $event || 0, margin.valid)">
      </mat-form-field>
    </fieldset>

    <mat-form-field class="menuItem" appearance="fill" [style.margin-top.px]="16">
      <mat-label>{{'pageProperties.backgroundColor' | translate }}</mat-label>
      <input matInput type="color" #backgroundColor="ngModel"
             [ngModel]="page.backgroundColor"
             (ngModelChange)="updateModel(page,'backgroundColor', $event, backgroundColor.valid)">
    </mat-form-field>
    <mat-checkbox class="menuItem"
                  [disabled]="unitService.unit.pages.length < 2 || unitService.unit.pages[0].alwaysVisible && pageIndex != 0"
                  [ngModel]="page.alwaysVisible"
                  (click)="$event.stopPropagation()"
                  (change)="updateModel(page, 'alwaysVisible', $event.source.checked)">
      Seite dauerhaft sichtbar
    </mat-checkbox>
    <mat-form-field class="menuItem" appearance="fill">
      <mat-label>{{'pageProperties.position' | translate }}</mat-label>
      <mat-select [disabled]="!page.alwaysVisible"
                  [value]="page.alwaysVisiblePagePosition"
                  (click)="$event.stopPropagation()"
                  (selectionChange)="updateModel(page, 'alwaysVisiblePagePosition', $event.value)">
        <mat-option *ngFor="let option of ['left', 'right', 'top', 'bottom']"
                    [value]="option">
          {{option | translate}}
        </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field class="menuItem" appearance="fill">
      <mat-label>{{'pageProperties.alwaysVisibleAspectRatio' | translate }}</mat-label>
      <input matInput type="number" min="0" max="100"
             [disabled]="!page.alwaysVisible"
             [ngModel]="page.alwaysVisibleAspectRatio"
             (click)="$event.stopPropagation()"
             (ngModelChange)="updateModel(page, 'alwaysVisibleAspectRatio', $event || 0)">
    </mat-form-field>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }
    mat-divider {
      margin-bottom: 10px;
    }
    .menuItem {
      padding: 0 16px;
    }
    mat-checkbox.menuItem {
      padding: 0 16px 10px 16px;
    }
    :host ::ng-deep .mat-mdc-menu-item .mat-icon {
      margin-right: 0;
    }
    .delete-button {
      justify-content: center;
    }
    .delete-button:hover {background-color: var(--warn)}
  `
})
export class PageMenu implements OnDestroy {
  @Input() page!: Page;
  @Input() pageIndex!: number;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              public selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService) {}

  movePage(page: Page, direction: 'left' | 'right'): void {
    this.unitService.moveSelectedPage(direction);
    this.refreshTabs();
  }

  deletePage(): void {
    let refs = this.unitService.referenceManager.getPageElementsReferences(
      this.unitService.unit.pages[this.selectionService.selectedPageIndex]
    );

    const pageNavButtonRefs = this.unitService.referenceManager.getButtonReferencesForPage(
      this.selectionService.selectedPageIndex
    );
    refs = refs.concat(pageNavButtonRefs);

    if (refs.length > 0) {
      this.dialogService.showDeleteReferenceDialog(refs)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result: boolean) => {
          if (result) {
            ReferenceManager.deleteReferences(refs);
            this.unitService.deletePage(this.selectionService.selectedPageIndex);
            this.selectionService.selectPreviousPage();
          } else {
            this.messageService.showReferencePanel(refs);
          }
        });
    } else {
      this.dialogService.showConfirmDialog('Seite löschen?')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result: boolean) => {
          if (result) {
            this.unitService.deletePage(this.selectionService.selectedPageIndex);
            this.selectionService.selectPreviousPage();
          }
        });
    }
  }

  updateModel(page: Page, property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      if (property === 'alwaysVisible' && value === true) {
        this.movePageToFront(page);
        page.alwaysVisible = true;
        this.selectionService.selectedPageIndex = 0;
        this.refreshTabs();
      }
      page[property] = value;
      this.unitService.updateUnitDefinition(); // TODO
    } else {
      this.messageService.showWarning('Eingabe ungültig');
    }
  }

  private movePageToFront(page: Page): void {
    const pageIndex = this.unitService.unit.pages.indexOf(page);
    if (pageIndex !== 0) {
      this.unitService.unit.pages.splice(pageIndex, 1);
      this.unitService.unit.pages.splice(0, 0, page);
    }
  }

  /* This is a hack. The tab element gets bugged when changing the underlying array.
   With this we can temporarily remove it from the DOM and then add it again, re-initializing it. */
  private refreshTabs(): void { // TODO seems unnecessary (?); moving pages works fine
    // this.pagesLoaded = false;
    // setTimeout(() => {
    //   this.pagesLoaded = true;
    // });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitPage } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';
import { MessageService } from '../../../../../../../common/message.service';

@Component({
  selector: 'app-page-properties',
  template: `
    <div fxLayout="column">
      <div class="input-group" fxLayoutAlign="space-between center">
        Reihenfolge
        <button mat-icon-button matSuffix color="accent"
                [style.margin-left.px]="50"
                (click)="movePage('up')">
          <mat-icon>north</mat-icon>
        </button>
        <button mat-icon-button color="accent"
                [style.margin-right.px]="20"
                (click)="movePage('down')">
          <mat-icon>south</mat-icon>
        </button>
      </div>
      <div class="input-group">
        <mat-checkbox [checked]="selectedPage.hasMaxWidth"
                      (change)="updateModel('hasMaxWidth', $any($event.source).checked)">
          Maximalbreite festlegen
        </mat-checkbox>
        <mat-form-field *ngIf="selectedPage.hasMaxWidth" appearance="fill"
                        [style.margin-top.px]="10">
          <mat-label>Maximalbreite</mat-label>
          <input matInput type="number" min="0" #maxWidth="ngModel"
                 [ngModel]="selectedPage.maxWidth"
                 (ngModelChange)="updateModel('maxWidth', $event, maxWidth.valid)">
        </mat-form-field>
      </div>
      <mat-form-field appearance="fill">
        <mat-label>Randbreite</mat-label>
        <input matInput type="number" min="0" #margin="ngModel"
               [ngModel]="selectedPage.margin"
               (ngModelChange)="updateModel('margin', $event, margin.valid)">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Hintergrundfarbe</mat-label>
        <input matInput type="color"
               [value]="selectedPage.backgroundColor"
               (change)="updateModel('backgroundColor', $any($event.target).value)">
      </mat-form-field>
      <div class="input-group">
        <mat-checkbox [disabled]="alwaysVisibleDisabled" [ngModel]="selectedPage.alwaysVisible"
                      (change)="updateModel('alwaysVisible', $any($event.source).checked)">
          Immer angezeigt
        </mat-checkbox>
        <mat-form-field *ngIf="selectedPage.alwaysVisible"
                        [style.margin-top.px]="10">
          <mat-label>Seitenverhältnis (in Prozent)</mat-label>
          <input matInput type="number" min="0" max="100"
                 [ngModel]="selectedPage.alwaysVisibleAspectRatio"
                 (ngModelChange)="updateModel('alwaysVisibleAspectRatio', $event)">
        </mat-form-field>
      </div>
    </div>
    `,
  styles: [
    '.input-group {background-color: rgba(0,0,0,.04); margin-bottom: 10px}'
  ]
})
export class PagePropertiesComponent implements OnInit, OnDestroy {
  selectedPage!: UnitPage;
  alwaysVisibleDisabled: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              private unitService: UnitService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.selectionService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
        this.alwaysVisibleDisabled = (!this.unitService.isSetPageAlwaysVisibleAllowed() && !page.alwaysVisible);
      });
  }

  movePage(direction: 'up' | 'down'): void {
    this.unitService.movePage(this.selectedPage, direction);
  }

  updateModel(property: string, value: number | boolean, isInputValid: boolean | null = true): void {
    if (isInputValid && value != null) {
      this.unitService.updatePageProperty(this.selectedPage, property, value);
    } else {
      this.messageService.showWarning('Eingabe ungültig');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

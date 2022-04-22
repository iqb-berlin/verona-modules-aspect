import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UnitService } from '../../../../../../services/unit.service';
import { SelectionService } from '../../../../../../services/selection.service';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-button-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.action !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.action' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.action"
                  (selectionChange)="updateModel.emit({ property: 'action', value: $event.value })">
        <mat-option [value]="null">
          {{ 'propertiesPanel.none' | translate }}
        </mat-option>
        <mat-option *ngFor="let option of ['unitNav', 'pageNav']"
                    [value]="option">
          {{ 'propertiesPanel.' + option | translate }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.action" appearance="fill">
      <mat-label>{{'propertiesPanel.actionParam' | translate }}</mat-label>
      <ng-container *ngIf="combinedProperties.action === 'unitNav'">
        <mat-select [value]="combinedProperties.actionParam"
                    (selectionChange)="updateModel.emit({ property: 'actionParam', value: $event.value })">
          <mat-option *ngFor="let option of [undefined, 'previous', 'next', 'first', 'last', 'end']"
                      [value]="option">
            {{ 'propertiesPanel.' + option | translate }}
          </mat-option>
        </mat-select>
      </ng-container>
      <ng-container *ngIf="combinedProperties.action === 'pageNav'">
        <mat-select [value]="combinedProperties.actionParam"
                    (selectionChange)="updateModel.emit({ property: 'actionParam', value: $event.value })">
          <ng-container *ngFor="let page of unitService.unit.pages; index as i">
            <mat-option *ngIf="!page.alwaysVisible && selectionService.selectedPageIndex !== i"
                        [value]="i">
              {{ unitService.unit.pages[0].alwaysVisible ? i : i + 1 }}
            </mat-option>
          </ng-container>
        </mat-select>
      </ng-container>
    </mat-form-field>

    <mat-checkbox *ngIf="combinedProperties.asLink !== undefined"
                  [checked]="$any(combinedProperties.asLink)"
                  (change)="updateModel.emit({ property: 'asLink', value: $event.checked })">
      {{'propertiesPanel.asLink' | translate }}
    </mat-checkbox>

    <ng-container *ngIf="combinedProperties.imageSrc !== undefined">
      <button mat-raised-button (click)="loadImage()">{{'loadImage' | translate }}</button>
      <button mat-raised-button (click)="removeImage()">{{'removeImage' | translate }}</button>
      <img [src]="combinedProperties.imageSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">
    </ng-container>
  `,
  styles: [
  ]
})
export class ButtonPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | null, isInputValid?: boolean | null }>();

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  async loadImage(): Promise<void> {
    this.updateModel.emit({ property: 'imageSrc', value: await FileService.loadImage() });
  }

  removeImage(): void {
    this.updateModel.emit({ property: 'imageSrc', value: null });
  }
}

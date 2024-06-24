import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { SizeInputPanelComponent } from 'editor/src/app/components/util/size-input-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';

@Component({
  selector: 'aspect-table-properties',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    NgForOf,
    NgIf,
    SizeInputPanelComponent,
    TranslateModule,
    MatButtonModule
  ],
  template: `
    <button mat-raised-button [style.align-self]="'center'" [style.margin-top.px]="5" [style.margin-bottom.px]="15"
            (click)="elementService.showDefaultEditDialog()">
      Elemente anpassen
    </button>
    <fieldset>
      <legend>{{'section-menu.rows' | translate }}</legend>
      <mat-form-field appearance="outline">
        <mat-label>{{'section-menu.rowCount' | translate }}</mat-label>
        <input matInput type="number"
               [value]="$any(combinedProperties.gridRowSizes).length"
               (click)="$any($event).stopPropagation()"
               (change)="modifySizeArray('gridRowSizes', $any($event).target.value || 0)">
      </mat-form-field>
      <ng-container *ngFor="let size of $any(combinedProperties.gridRowSizes); let i = index">
        <aspect-size-input-panel [label]="('section-menu.height' | translate) + ' ' + (i + 1)"
                                 [value]="size.value"
                                 [unit]="size.unit"
                                 [allowedUnits]="['px', 'fr']"
                                 (valueUpdated)="changeGridSize('gridRowSizes', i, $event)">
        </aspect-size-input-panel>
      </ng-container>
    </fieldset>
    <fieldset>
      <legend>{{'section-menu.columns' | translate }}</legend>
      <mat-form-field appearance="outline">
        <mat-label>{{'section-menu.columnCount' | translate }}</mat-label>
        <input matInput type="number"
               [value]="$any(combinedProperties.gridColumnSizes).length"
               (click)="$any($event).stopPropagation()"
               (change)="modifySizeArray('gridColumnSizes', $any($event).target.value || 0)">
      </mat-form-field>
      <ng-container *ngFor="let size of $any(combinedProperties.gridColumnSizes); let i = index">
        <aspect-size-input-panel [label]="('section-menu.width' | translate) + ' ' + (i + 1)"
                                 [value]="size.value"
                                 [unit]="size.unit"
                                 [allowedUnits]="['px', 'fr']"
                                 (valueUpdated)="changeGridSize('gridColumnSizes', i, $event)">
        </aspect-size-input-panel>
      </ng-container>
    </fieldset>
    <mat-checkbox [checked]="$any(combinedProperties).tableEdgesEnabled"
                  (change)="updateModel.emit({ property: 'tableEdgesEnabled', value: $event.checked })">
      Tabellenränder zeichnen
    </mat-checkbox>
  `,
  styles:
    ':host {display: flex; flex-direction: column;}'
})
export class TablePropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: boolean | { value: number; unit: string }[] | null }>();

  constructor(public elementService: ElementService) { }

  /* Add or remove elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      (this.combinedProperties.gridColumnSizes as { value: number; unit: string }[]) :
      (this.combinedProperties.gridRowSizes as { value: number; unit: string }[]);

    let newArray: { value: number; unit: string }[] = [];
    if (newLength < sizeArray.length) {
      newArray = sizeArray.slice(0, newLength);
    } else {
      newArray.push(
        ...sizeArray,
        ...Array(newLength - sizeArray.length).fill({ value: 1, unit: 'fr' })
      );
    }
    this.updateModel.emit({ property, value: newArray });
  }

  changeGridSize(property: string, index: number, newValue: { value: number; unit: string }): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      (this.combinedProperties.gridColumnSizes as { value: number; unit: string }[]) :
      (this.combinedProperties.gridRowSizes as { value: number; unit: string }[]);
    sizeArray[index] = newValue;
    this.updateModel.emit({ property, value: [...sizeArray] });
  }
}

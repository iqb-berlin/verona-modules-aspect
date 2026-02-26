import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-widget-periodic-table-properties',
  imports: [
    MatCheckboxModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <fieldset>
      <legend>{{'toolbox.widget-periodic-table' | translate}}</legend>
      <div class="fx-column-start-stretch">
        <mat-checkbox [checked]="$any(combinedProperties).showInfoOrder"
                      (change)="updateModel.emit({ property: 'showInfoOrder', value: $event.checked })">
          {{ 'propertiesPanel.showInfoOrder' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties).showInfoENeg"
                      (change)="updateModel.emit({ property: 'showInfoENeg', value: $event.checked })">
          {{ 'propertiesPanel.showInfoENeg' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties).showInfoAMass"
                      (change)="updateModel.emit({ property: 'showInfoAMass', value: $event.checked })">
          {{ 'propertiesPanel.showInfoAMass' | translate }}
        </mat-checkbox>
        <mat-checkbox [checked]="$any(combinedProperties).closeOnSelection"
                      (change)="updateModel.emit({ property: 'closeOnSelection', value: $event.checked })">
          {{ 'propertiesPanel.closeOnSelection' | translate }}
        </mat-checkbox>

        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.maxNumberOfSelections' | translate }}</mat-label>
          <input matInput type="number" min="0"
             [value]="$any(combinedProperties).maxNumberOfSelections"
             (input)="updateModel
               .emit({ property: 'maxNumberOfSelections', value: $any($event.target).value || 0 })">
        </mat-form-field>
      </div>
    </fieldset>
  `
})
export class WidgetPeriodicTablePropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}

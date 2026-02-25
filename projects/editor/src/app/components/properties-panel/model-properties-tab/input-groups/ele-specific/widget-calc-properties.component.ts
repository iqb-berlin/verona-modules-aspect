import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UIElement } from 'common/models/elements/element';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'aspect-widget-calc-properties',
  imports: [
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="fx-column-start-stretch">
      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.calcMode' | translate }}</mat-label>
        <mat-select [value]="$any(combinedProperties).mode"
                    (selectionChange)="updateModel.emit({ property: 'mode', value: $event.value })">
          <mat-option value="SIMPLE">{{ 'propertiesPanel.calcModeSimple' | translate }}</mat-option>
          <mat-option value="SCIENTIFIC">{{ 'propertiesPanel.calcModeScientific' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.calcJournalLines' | translate }}</mat-label>
        <input matInput type="number" min="0"
               [value]="$any(combinedProperties).journalLines"
               (input)="updateModel.emit({ property: 'journalLines', value: $any($event.target).value || 0 })">
      </mat-form-field>
    </div>
  `
})
export class WidgetCalcPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}

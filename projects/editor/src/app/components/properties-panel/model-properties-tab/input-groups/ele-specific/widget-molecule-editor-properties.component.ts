import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UIElementValue } from 'common/interfaces';
import { CombinedProperties } from '../../../element-properties-panel.component';

@Component({
  selector: 'aspect-widget-molecule-editor-properties',
  imports: [
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <fieldset>
      <legend>{{'toolbox.widget-molecule-editor' | translate}}</legend>

      <div class="fx-column-start-stretch">
        <mat-form-field appearance="fill">
          <mat-label>{{'propertiesPanel.bondingType' | translate }}</mat-label>
          <mat-select [value]="$any(combinedProperties).bondingType"
                      (selectionChange)="updateModel.emit({ property: 'bondingType', value: $event.value })">
            <mat-option value="VALENCE">{{ 'propertiesPanel.moleculeBondingTypeValence' | translate }}</mat-option>
            <mat-option value="ELECTRONS">{{ 'propertiesPanel.moleculeBondingTypeElectrons' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </fieldset>
  `
})
export class WidgetMoleculeEditorPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}

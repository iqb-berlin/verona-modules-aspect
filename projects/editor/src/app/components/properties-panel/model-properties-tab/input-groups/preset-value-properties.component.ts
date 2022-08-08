import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-preset-value-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.type === 'text-area'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'preset' | translate }}</mat-label>
      <textarea matInput type="text"
                [value]="$any(combinedProperties.value)"
                (input)="updateModel.emit({ property: 'value', value: $any($event.target).value })">
            </textarea>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.type === 'text-field'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'preset' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties).value"
             (input)="updateModel.emit({property: 'value', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.options !== undefined && !combinedProperties.connectedTo"
                    appearance="fill" class="wide-form-field">
      <mat-label>{{'preset' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.value"
                  (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let option of $any(combinedProperties.options); let i = index" [value]="i">
          {{option.text}} (Index: {{i}})
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.richTextOptions !== undefined && !combinedProperties.connectedTo"
                    appearance="fill" class="wide-form-field">
      <mat-label>{{'preset' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.value"
                  (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let option of $any(combinedProperties.richTextOptions); let i = index" [value]="i"
                    [innerHTML]="option + '&nbsp;(Index: ' + i + ')'">
        </mat-option>
      </mat-select>
    </mat-form-field>

    <!-- This is for radio with images-->
    <mat-form-field *ngIf="combinedProperties.columns !== undefined && combinedProperties.rows === undefined"
                    appearance="fill" class="wide-form-field">
      <mat-label>{{'preset' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.value"
                  (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let column of $any(combinedProperties.columns); let i = index" [value]="i">
          {{column.name}} (Index: {{i}})
        </mat-option>
      </mat-select>
    </mat-form-field>
  `
})
export class PresetValuePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}

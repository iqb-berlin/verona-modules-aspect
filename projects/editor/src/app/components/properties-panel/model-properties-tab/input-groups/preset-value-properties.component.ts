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

    <mat-form-field *ngIf="combinedProperties.type === 'text-field' || combinedProperties.type === 'text-field-simple'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'preset' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties).value"
             (input)="updateModel.emit({property: 'value', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.options !== undefined && combinedProperties.rows === undefined"
                    appearance="fill" class="wide-form-field">
      <mat-label>{{'preset' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.value"
                  (selectionChange)="updateModel.emit({ property: 'value', value: $event.value })">
        <mat-option [value]="null">{{'propertiesPanel.undefined' | translate }}</mat-option>
        <mat-option *ngFor="let option of $any(combinedProperties.options); let i = index" [value]="i">
          <div fxFlex fxFlexAlign="center" [innerHTML]="option.text + ' (Index: ' + i + ')' | safeResourceHTML"></div>
        </mat-option>
      </mat-select>
    </mat-form-field>

    <ng-container *ngIf="combinedProperties.type === 'math-field'">
      <mat-label>{{'preset' | translate }}</mat-label><br>
      <aspect-mathlive-math-field [value]="$any(combinedProperties).value"
                                  [enableModeSwitch]="true"
                                  (input)="updateModel.emit({property: 'value', value: $any($event.target).value })">
      </aspect-mathlive-math-field>
    </ng-container>
  `
})
export class PresetValuePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}

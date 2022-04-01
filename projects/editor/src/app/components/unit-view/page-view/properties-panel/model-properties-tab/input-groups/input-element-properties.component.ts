import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'aspect-input-element-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.appearance !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.appearance' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.appearance"
                  (selectionChange)="updateModel.emit({ property: 'appearance', value: $event.value })">
        <mat-option *ngFor="let option of [{displayValue: 'fill', value: 'fill'},
                                         {displayValue: 'outline', value: 'outline'}]"
                    [value]="option.value">
          {{option.displayValue}}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.minLength !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.minLength' | translate }}</mat-label>
      <input matInput type="number" #minLength="ngModel" min="0"
             [ngModel]="combinedProperties.minLength"
             (ngModelChange)="updateModel.emit({
                  property: 'minLength',
                  value: $event,
                  isInputValid: minLength.valid })">
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.minLength &&
                                     $any(combinedProperties.minLength) > 0"
                    appearance="fill">
      <mat-label>{{'propertiesPanel.minLengthWarnMessage' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties.minLengthWarnMessage)"
             (input)="updateModel.emit({ property: 'minLengthWarnMessage', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.maxLength !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.maxLength' | translate }}</mat-label>
      <input matInput type="number" #maxLength="ngModel" min="0"
             [ngModel]="combinedProperties.maxLength"
             (ngModelChange)="updateModel.emit({
                  property: 'maxLength',
                  value: $event,
                  isInputValid: maxLength.valid })">
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.maxLength &&
                                     $any(combinedProperties.maxLength) > 0"
                    appearance="fill">
      <mat-label>{{'propertiesPanel.maxLengthWarnMessage' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties.maxLengthWarnMessage)"
             (input)="updateModel.emit({ property: 'maxLengthWarnMessage', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.pattern !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.pattern' | translate }}</mat-label>
      <input matInput [value]="$any(combinedProperties.pattern)"
             (input)="updateModel.emit({ property: 'pattern', value: $any($event.target).value })">
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.pattern && $any(combinedProperties.pattern) !== ''"
                    appearance="fill"
                    matTooltip="Angabe als regulärer Ausdruck.">
      <mat-label>{{'propertiesPanel.patternWarnMessage' | translate }}</mat-label>
      <input matInput type="text" [value]="$any(combinedProperties.patternWarnMessage)"
             (input)="updateModel.emit({ property: 'patternWarnMessage', value: $any($event.target).value })">
    </mat-form-field>

    <mat-checkbox *ngIf="combinedProperties.clearable !== undefined"
                  [checked]="$any(combinedProperties.clearable)"
                  (change)="updateModel.emit({ property: 'clearable', value: $event.checked })">
      {{'propertiesPanel.clearable' | translate }}
    </mat-checkbox>

    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.inputAssistance' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.inputAssistancePreset"
                  (selectionChange)="updateModel.emit({ property: 'inputAssistancePreset', value: $event.value })">
        <mat-option *ngFor="let option of ['none', 'french', 'numbers', 'numbersAndOperators', 'numbersAndBasicOperators',
       'comparisonOperators', 'squareDashDot', 'placeValue']"
                    [value]="option">
          {{ 'propertiesPanel.' + option | translate }}
        </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== 'none' &&
                                 combinedProperties.inputAssistancePosition !== undefined"
                    appearance="fill">
      <mat-label>{{'propertiesPanel.inputAssistancePosition' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.inputAssistancePosition"
                  (selectionChange)="updateModel.emit({ property: 'inputAssistancePosition', value: $event.value })">
        <mat-option *ngFor="let option of ['floating', 'right']"
                    [value]="option">
          {{ 'propertiesPanel.' + option | translate }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== 'none' &&
                       combinedProperties.restrictedToInputAssistanceChars !== undefined"
                  [checked]="$any(combinedProperties.restrictedToInputAssistanceChars)"
                  (change)="updateModel.emit({ property: 'restrictedToInputAssistanceChars', value: $event.checked })">
      {{'propertiesPanel.restrictedToInputAssistanceChars' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.showSoftwareKeyboard !== undefined"
                  [checked]="$any(combinedProperties.showSoftwareKeyboard)"
                  (change)="updateModel.emit({ property: 'showSoftwareKeyboard', value: $event.checked })">
      {{'propertiesPanel.showSoftwareKeyboard' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.showSoftwareKeyboard"
                  [checked]="$any(combinedProperties.softwareKeyboardShowFrench)"
                  (change)="updateModel.emit({ property: 'softwareKeyboardShowFrench', value: $event.checked })">
      {{'propertiesPanel.softwareKeyboardShowFrench' | translate }}
    </mat-checkbox>
  `
})
export class InputElementPropertiesComponent {
  @Input() combinedProperties!: any;
  @Output() updateModel =
  new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}

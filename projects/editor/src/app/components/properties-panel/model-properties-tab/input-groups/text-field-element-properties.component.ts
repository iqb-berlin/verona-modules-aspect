import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-text-field-element-properties',
  template: `
    <mat-form-field *ngIf="combinedProperties.appearance !== undefined" appearance="fill">
      <mat-label>{{'propertiesPanel.appearance' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.appearance"
                  (selectionChange)="updateModel.emit({ property: 'appearance', value: $event.value })">
        <mat-option *ngFor="let option of [{displayValue: 'fill', value: 'fill'},
                                         {displayValue: 'outline', value: 'outline'}]"
                    [value]="option.value">
          {{'propertiesPanel.' + option.displayValue | translate}}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <ng-container *ngIf="combinedProperties.minLength !== undefined">
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.minLength' | translate }}</mat-label>
        <input matInput type="number" #minLength="ngModel" min="0"
               [ngModel]="combinedProperties.minLength"
               (ngModelChange)="updateModel.emit({
                    property: 'minLength',
                    value: $event,
                    isInputValid: minLength.valid })">
      </mat-form-field>
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.minLengthWarnMessage' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.minLength"
               [value]="$any(combinedProperties.minLengthWarnMessage)"
               (input)="updateModel.emit({ property: 'minLengthWarnMessage', value: $any($event.target).value })">
      </mat-form-field>
    </ng-container>

    <ng-container *ngIf="combinedProperties.maxLength !== undefined">
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.maxLength' | translate }}</mat-label>
        <input matInput type="number" #maxLength="ngModel" min="0"
               [ngModel]="combinedProperties.maxLength"
               (ngModelChange)="updateModel.emit({
                    property: 'maxLength',
                    value: $event,
                    isInputValid: maxLength.valid })">
      </mat-form-field>
      <mat-checkbox *ngIf="combinedProperties.isLimitedToMaxLength !== undefined"
                    [disabled]="!combinedProperties.maxLength"
                    [checked]="$any(combinedProperties.isLimitedToMaxLength)"
                    (change)="updateModel.emit({ property: 'isLimitedToMaxLength', value: $event.checked })">
        {{'propertiesPanel.isLimitedToMaxLength' | translate }}
      </mat-checkbox>
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.maxLengthWarnMessage' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.maxLength"
               [value]="$any(combinedProperties.maxLengthWarnMessage)"
               (input)="updateModel.emit({ property: 'maxLengthWarnMessage', value: $any($event.target).value })">
      </mat-form-field>
    </ng-container>

    <ng-container *ngIf="combinedProperties.pattern !== undefined">
      <mat-form-field class="wide-form-field" appearance="fill"
                      matTooltip="Angabe als regulärer Ausdruck.">
        <mat-label>{{'propertiesPanel.pattern' | translate }}</mat-label>
        <input matInput [value]="$any(combinedProperties.pattern)"
               (input)="updateModel.emit({ property: 'pattern', value: $any($event.target).value })">
      </mat-form-field>
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.patternWarnMessage' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.pattern"
               [value]="$any(combinedProperties.patternWarnMessage)"
               (input)="updateModel.emit({ property: 'patternWarnMessage', value: $any($event.target).value })">
      </mat-form-field>
    </ng-container>

    <mat-checkbox *ngIf="combinedProperties.clearable !== undefined"
                  [checked]="$any(combinedProperties.clearable)"
                  (change)="updateModel.emit({ property: 'clearable', value: $event.checked })">
      {{'propertiesPanel.clearable' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.hasKeyboardIcon !== undefined"
                  [checked]="$any(combinedProperties.hasKeyboardIcon)"
                  (change)="updateModel.emit({ property: 'hasKeyboardIcon', value: $event.checked })">
      {{'propertiesPanel.hasKeyboardIcon' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.showSoftwareKeyboard !== undefined"
                  [checked]="$any(combinedProperties.showSoftwareKeyboard)"
                  (change)="updateModel.emit({ property: 'showSoftwareKeyboard', value: $event.checked })">
      {{'propertiesPanel.showSoftwareKeyboard' | translate }}
    </mat-checkbox>
    <mat-checkbox *ngIf="combinedProperties.showSoftwareKeyboard !== undefined"
                  [disabled]="!combinedProperties.showSoftwareKeyboard"
                  [checked]="$any(combinedProperties.addInputAssistanceToKeyboard)"
                  (change)="updateModel.emit({ property: 'addInputAssistanceToKeyboard', value: $event.checked })">
      {{'propertiesPanel.addInputAssistanceToKeyboard' | translate }}
    </mat-checkbox>

    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== undefined" appearance="fill"
                    class="wide-form-field">
      <mat-label>{{'propertiesPanel.inputAssistance' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.inputAssistancePreset"
                  (selectionChange)="updateModel.emit({ property: 'inputAssistancePreset', value: $event.value })">
        <mat-option *ngFor="let option of [null, 'french', 'numbers', 'numbersAndOperators', 'numbersAndBasicOperators',
       'comparisonOperators', 'squareDashDot', 'placeValue', 'space', 'comma', 'custom']"
                    [value]="option">
          {{ option === null ? ('propertiesPanel.none' | translate) : ('propertiesPanel.' + option | translate) }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset === 'custom'"
                    class="wide-form-field" appearance="fill">
      <mat-label>{{'propertiesPanel.inputAssistanceCustomKeys' | translate }}</mat-label>
      <input matInput type="text"
             [value]="$any(combinedProperties.inputAssistanceCustomKeys)"
             (input)="updateModel.emit({ property: 'inputAssistanceCustomKeys', value: $any($event.target).value })">
    </mat-form-field>

    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== null &&
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
    <mat-form-field *ngIf="combinedProperties.inputAssistancePreset !== null &&
                           combinedProperties.inputAssistancePosition === 'floating'"
                    appearance="fill">
      <mat-label>{{'propertiesPanel.inputAssistanceFloatingStartPosition' | translate }}</mat-label>
      <mat-select [value]="combinedProperties.inputAssistanceFloatingStartPosition"
                  (selectionChange)="updateModel.emit({
                    property: 'inputAssistanceFloatingStartPosition',
                    value: $event.value
                  })">
        <mat-option *ngFor="let option of ['startBottom', 'endCenter']"
                    [value]="option">
          {{ 'propertiesPanel.' + option | translate }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                       combinedProperties.restrictedToInputAssistanceChars !== undefined"
                  [checked]="$any(combinedProperties.restrictedToInputAssistanceChars)"
                  (change)="updateModel.emit({ property: 'restrictedToInputAssistanceChars', value: $event.checked })">
      {{'propertiesPanel.restrictedToInputAssistanceChars' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                       combinedProperties.hasArrowKeys !== undefined"
                  [checked]="$any(combinedProperties.hasArrowKeys)"
                  (change)="updateModel.emit({ property: 'hasArrowKeys', value: $event.checked })">
      {{'propertiesPanel.hasArrowKeys' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.inputAssistancePreset !== null &&
                       combinedProperties.hasBackspaceKey !== undefined"
                  [disabled]="combinedProperties.inputAssistancePreset !== 'custom'"
                  [checked]="combinedProperties.inputAssistancePreset === 'custom' ?
                              $any(combinedProperties.hasBackspaceKey) :
                              combinedProperties.inputAssistancePreset !== 'french'"
                  (change)="updateModel.emit({ property: 'hasBackspaceKey', value: $event.checked })">
      {{'propertiesPanel.hasBackspaceKey' | translate }}
    </mat-checkbox>

    <mat-checkbox *ngIf="combinedProperties.type === 'text-area' && combinedProperties.inputAssistancePreset !== null &&
                       combinedProperties.hasReturnKey !== undefined"
                  [checked]="$any(combinedProperties.hasReturnKey)"
                  (change)="updateModel.emit({ property: 'hasReturnKey', value: $event.checked })">
      {{'propertiesPanel.hasReturnKey' | translate }}
    </mat-checkbox>
  `
})
export class TextFieldElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string; value: string | number | boolean | string[], isInputValid?: boolean | null
  }>();
}

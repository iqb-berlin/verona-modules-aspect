import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel.component';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
  selector: 'aspect-text-field-element-properties',
  template: `
    <mat-form-field *ngIf="unitService.expertMode && combinedProperties.appearance !== undefined" appearance="fill">
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

    <ng-container *ngIf="unitService.expertMode && combinedProperties.minLength !== undefined">
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

    <ng-container *ngIf="unitService.expertMode && combinedProperties.maxLength !== undefined">
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

    <ng-container *ngIf="unitService.expertMode && combinedProperties.pattern !== undefined">
      <mat-form-field class="wide-form-field" appearance="fill"
                      matTooltip="Angabe als regulärer Ausdruck.">
        <mat-label>{{'propertiesPanel.pattern' | translate }}</mat-label>
        <input matInput [formControl]="regexPatternFormControl" (blur)="validateRegex($event)">
        <mat-error>Invalides Muster</mat-error>
      </mat-form-field>
      <mat-form-field class="wide-form-field" appearance="fill">
        <mat-label>{{'propertiesPanel.patternWarnMessage' | translate }}</mat-label>
        <input matInput type="text"
               [disabled]="!combinedProperties.pattern"
               [value]="$any(combinedProperties.patternWarnMessage)"
               (input)="updateModel.emit({ property: 'patternWarnMessage', value: $any($event.target).value })">
      </mat-form-field>
    </ng-container>

    <mat-checkbox *ngIf="unitService.expertMode && combinedProperties.clearable !== undefined"
                  [checked]="$any(combinedProperties.clearable)"
                  (change)="updateModel.emit({ property: 'clearable', value: $event.checked })">
      {{'propertiesPanel.clearable' | translate }}
    </mat-checkbox>
  `,
  standalone: false
})

export class TextFieldElementPropertiesComponent implements OnInit {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{
    property: string;
    value: string | number | boolean | string[] | null;
    isInputValid?: boolean | null;
  }>();

  regexPatternFormControl!: FormControl;

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.regexPatternFormControl = new FormControl(this.combinedProperties.pattern);
  }

  validateRegex(event: FocusEvent) {
    const value = (event?.target as HTMLInputElement).value;
    try {
      // eslint-disable-next-line no-new
      new RegExp(value);
      this.updateModel.emit({ property: 'pattern', value: value });
    } catch (e) {
      this.regexPatternFormControl.setErrors({ invalidPattern: true });
    }
  }
}

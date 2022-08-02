import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-input-element-properties',
  template: `
    <fieldset *ngIf="combinedProperties.required !== undefined" fxLayout="column">
      <legend>Eingabeelement</legend>
      <mat-form-field *ngIf="combinedProperties.label !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.label' | translate }}</mat-label>
        <input matInput type="text" [value]="$any(combinedProperties.label)"
               (input)="updateModel.emit({property: 'label', value: $any($event.target).value })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.readOnly !== undefined"
                    [style.margin-bottom.px]="10"
                    [checked]="$any(combinedProperties.readOnly)"
                    (change)="updateModel.emit({ property: 'readOnly', value: $event.checked })">
        {{'propertiesPanel.readOnly' | translate }}
      </mat-checkbox>

      <mat-checkbox *ngIf="combinedProperties.required !== undefined"
                    [checked]="$any(combinedProperties.required)"
                    (change)="updateModel.emit({ property: 'required', value: $event.checked })">
        {{'propertiesPanel.requiredField' | translate }}
      </mat-checkbox>

      <mat-form-field appearance="fill">
        <mat-label>{{'propertiesPanel.requiredWarnMessage' | translate }}</mat-label>
        <input matInput type="text" [disabled]="!combinedProperties.required"
               [value]="$any(combinedProperties.requiredWarnMessage)"
               (input)="updateModel.emit({ property: 'requiredWarnMessage', value: $any($event.target).value })">
      </mat-form-field>
    </fieldset>
  `,
  styles: [
  ]
})
export class InputElementPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}

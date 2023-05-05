import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-input-element-properties',
  template: `
    <fieldset *ngIf="combinedProperties.required !== undefined" class="fx-column-start-stretch">
      <legend>Eingabeelement</legend>
      <mat-form-field *ngIf="combinedProperties.label !== undefined" appearance="fill">
        <mat-label>{{'propertiesPanel.label' | translate }}</mat-label>
        <input matInput type="text" [value]="$any(combinedProperties.label)"
               (input)="updateModel.emit({property: 'label', value: $any($event.target).value })">
      </mat-form-field>

      <mat-checkbox *ngIf="combinedProperties.readOnly !== undefined"
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
  styles: [`
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class InputElementPropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | string[], isInputValid?: boolean | null }>();
}

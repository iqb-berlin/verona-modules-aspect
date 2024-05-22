import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-input-element-properties',
  template: `
    <fieldset class="fx-column-start-stretch">
      <legend>Eingabeelement</legend>
      <!-- DropList label is unused -->
      <mat-form-field *ngIf="combinedProperties.type !== 'drop-list'"
                      appearance="fill">
        <mat-label>{{'propertiesPanel.label' | translate }}</mat-label>
        <textarea matInput type="text"
                  [value]="$any(combinedProperties.label)"
                  (input)="updateModel.emit({ property: 'label', value: $any($event.target).value })">
            </textarea>
      </mat-form-field>

      <mat-checkbox [checked]="$any(combinedProperties.readOnly)"
                    (change)="updateModel.emit({ property: 'readOnly', value: $event.checked })">
        {{'propertiesPanel.readOnly' | translate }}
      </mat-checkbox>

      <mat-checkbox [checked]="$any(combinedProperties.required)"
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

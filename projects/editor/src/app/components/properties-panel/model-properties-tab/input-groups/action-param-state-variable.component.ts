import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Component({
  selector: 'aspect-action-param-state-variable',
  template: `
    <div class="fx-column-start-stretch">
      <mat-form-field>
        <mat-label>{{'stateVariableId' | translate}}</mat-label>
        <mat-select [(ngModel)]="stateVariable.id"
                    (ngModelChange)="stateVariableChange.emit(stateVariable)">
          <mat-option *ngFor="let id of stateVariableIds"
                      [value]="id">
            {{id}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>{{'stateVariableValue' | translate}}</mat-label>
        <input matInput
               [(ngModel)]="stateVariable.value"
               (ngModelChange)="stateVariableChange.emit(stateVariable)">
      </mat-form-field>
    </div>
  `
})
export class ActionParamStateVariableComponent {
  @Input() stateVariable!: StateVariable;
  @Input() stateVariableIds!: string[];
  @Output() stateVariableChange = new EventEmitter<StateVariable>();
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StateVariable } from 'common/models/state-variable';

@Component({
  templateUrl: './state-variables-dialog.component.html',
  styles: [`
    .add-button {
      width: 100%;
      height: 25px;
      background-color: #BABABA;
    }
    .add-icon {
      font-size: 24px;
      color: white;
      margin-top: -5px;
    }
  `]
})
export class StateVariablesDialogComponent {
  stateVariables: StateVariable[];

  constructor(@Inject(MAT_DIALOG_DATA) private data: { stateVariables: StateVariable[] }) {
    this.stateVariables = [...data.stateVariables];
  }

  addStateVariable() {
    this.stateVariables.push({ id: 'NewState', value: '' });
  }

  deleteStateVariable(index: number) {
    this.stateVariables.splice(index, 1);
  }
}

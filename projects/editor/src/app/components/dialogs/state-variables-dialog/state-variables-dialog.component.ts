import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StateVariable } from 'common/models/state-variable';

@Component({
  templateUrl: './state-variables-dialog.component.html'
})
export class StateVariablesDialogComponent {
  stateVariables: StateVariable[];

  constructor(@Inject(MAT_DIALOG_DATA) private data: { stateVariables: StateVariable[] }) {
    this.stateVariables = [...data.stateVariables];
  }

  addStateVariable() {
    this.stateVariables.push({ id: 'NewState', value: '1' });
  }

  deleteStateVariable(index: number) {
    this.stateVariables.splice(index, 1);
  }
}

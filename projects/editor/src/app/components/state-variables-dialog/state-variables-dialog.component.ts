import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StateVariable } from 'common/models/state-variable';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  templateUrl: './state-variables-dialog.component.html',
  styleUrls: ['./state-variables-dialog.component.scss'],
  standalone: false
})
export class StateVariablesDialogComponent {
  stateVariables: StateVariable[];

  constructor(
    private idService: IDService,
    @Inject(MAT_DIALOG_DATA) private data: { stateVariables: StateVariable[] }) {
    this.stateVariables = [...data.stateVariables];
  }

  addStateVariable() {
    const aliasID = this.idService.getAndRegisterNewIDs('state-variable');
    this.stateVariables.push(new StateVariable(aliasID.id, aliasID.alias, ''));
  }

  deleteStateVariable(index: number) {
    this.idService.unregister(this.stateVariables[index].id, true, false);
    this.idService.unregister(this.stateVariables[index].alias, false, true);
    this.stateVariables.splice(index, 1);
  }
}

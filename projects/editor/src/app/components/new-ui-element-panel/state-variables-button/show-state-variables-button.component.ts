import { Component } from '@angular/core';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-show-state-variables-button',
  templateUrl: './show-state-variables-button.component.html',
  styleUrls: ['./show-state-variables-button.component.scss']
})
export class ShowStateVariablesButtonComponent {
  constructor(private dialogService: DialogService,
              private unitService: UnitService) { }

  showStateVariablesDialog() {
    this.dialogService.showStateVariablesDialog(this.unitService.unit.stateVariables)
      .subscribe(stateVariables => {
        if (stateVariables) {
          this.unitService.updateStateVariables(stateVariables);
        }
      });
  }
}

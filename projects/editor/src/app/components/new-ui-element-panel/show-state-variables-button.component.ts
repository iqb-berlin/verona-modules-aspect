import { Component, Input } from '@angular/core';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-show-state-variables-button',
  template: `<button mat-flat-button
                     class="show-state-variables-button"
                     color="primary"
                     matBadgeColor="accent"
                     [matBadge]="stateVariablesCount"
                     [style.width.%]="100"
                     (click)="showStateVariablesDialog()">
    <mat-icon>integration_instructions</mat-icon>
    <span>{{'stateVariable' | translate}}</span>
  </button>`
})

export class ShowStateVariablesButtonComponent {
  @Input() stateVariablesCount!: number;
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

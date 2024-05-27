import { Component, Input } from '@angular/core';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';

@Component({
  selector: 'aspect-show-state-variables-button',
  template: `<button mat-flat-button
                     class="show-state-variables-button"
                     color="primary"
                     matBadgeColor="accent"
                     [matBadgeHidden]="!stateVariablesCount"
                     [matBadge]="stateVariablesCount"
                     (click)="showStateVariablesDialog()">
    <mat-icon>integration_instructions</mat-icon>
    <span>{{'stateVariable' | translate}}</span>
  </button>`,
  styles: [`
    button {
      text-align: left;
      font-size: medium;
      width: 100%;
      display: inline-block;
    }
    :host ::ng-deep .mat-badge-medium.mat-badge-overlap.mat-badge-after .mat-badge-content {
      right: 12px;
    }
    :host ::ng-deep .mat-badge-medium.mat-badge-above .mat-badge-content {
      top: 8px;
    }
  `]
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

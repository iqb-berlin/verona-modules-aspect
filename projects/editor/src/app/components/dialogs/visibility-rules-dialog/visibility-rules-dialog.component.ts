import { Component, Inject } from '@angular/core';
import { VisibilityRule } from 'common/models/visibility-rule';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './visibility-rules-dialog.component.html',
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
    .visibility-delay {
      width: 434px;
    }
  `],
    standalone: false
})
export class VisibilityRulesDialogComponent {
  visibilityRules!: VisibilityRule[];
  logicalConnectiveOfRules!: 'disjunction' | 'conjunction';
  controlIds!: { id: string, alias: string }[];
  visibilityDelay!: number;
  animatedVisibility!: boolean;
  enableReHide!: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {
      visibilityRules: VisibilityRule[],
      logicalConnectiveOfRules: 'disjunction' | 'conjunction',
      visibilityDelay: number,
      animatedVisibility: boolean,
      controlIds: { id: string, alias: string }[],
      enableReHide: boolean,
    }
  ) {
    this.visibilityRules = [...data.visibilityRules];
    this.logicalConnectiveOfRules = data.logicalConnectiveOfRules;
    this.visibilityDelay = data.visibilityDelay;
    this.animatedVisibility = data.animatedVisibility;
    this.enableReHide = data.enableReHide;
    this.controlIds = data.controlIds;
  }

  addVisibilityRule(): void {
    this.visibilityRules.push({ id: '', operator: '=', value: '' });
  }

  deleteVisibilityRule(index: number): void {
    this.visibilityRules.splice(index, 1);
  }
}

import { Component, Inject } from '@angular/core';
import { VisibilityRule } from 'common/models/visibility-rule';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './visibility-rules-dialog.component.html'
})
export class VisibilityRulesDialogComponent {
  visibilityRules!: VisibilityRule[];
  controlIds!: string[];
  activeAfterIdDelay!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {
      visibilityRules: VisibilityRule[],
      activeAfterIdDelay: number,
      controlIds: string[],
    }
  ) {
    this.visibilityRules = [...data.visibilityRules];
    this.activeAfterIdDelay = data.activeAfterIdDelay;
    this.controlIds = data.controlIds;
  }

  addVisibilityRule(): void {
    this.visibilityRules.push(new VisibilityRule('', '=', ''));
  }

  deleteVisibilityRule(index: number): void {
    this.visibilityRules.splice(index, 1);
  }
}

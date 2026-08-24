import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { VisibilityRule } from 'common/models/visibility-rule';
import { MessageService } from 'editor/src/app/services/message.service';

@Component({
  templateUrl: './visibility-rules-dialog.component.html',
  styleUrls: ['./visibility-rules-dialog.component.scss'],
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
    },
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
    this.visibilityRules = [...data.visibilityRules];
    this.logicalConnectiveOfRules = data.logicalConnectiveOfRules;
    this.visibilityDelay = data.visibilityDelay;
    this.animatedVisibility = data.animatedVisibility;
    this.enableReHide = data.enableReHide;
    this.controlIds = data.controlIds;
  }

  /**
   * What `aspectNumberField` worked out for the delay box.
   *
   * It carried the old rule in its last hand-written form - `(change)="visibilityDelay =
   * visibilityDelay || 0"` on a two-way binding, so an emptied box became a 0 and nothing stopped a
   * negative delay, which the player would treat as no delay at all (#1164).
   */
  commitDelay(update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.visibilityDelay = update.value;
  }

  addVisibilityRule(): void {
    this.visibilityRules.push({ id: '', operator: '=', value: '' });
  }

  deleteVisibilityRule(index: number): void {
    this.visibilityRules.splice(index, 1);
  }
}

import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';

/** One line of the dialog: a finding with what it shows already worked out. */
export interface VariableInfoFindingRow {
  finding: VariableInfoFinding;
  /** What has to change: the GeoGebra name where the identifier is composed from one, the identifier otherwise. */
  value: string;
  codes: VariableInfoIssueCode[];
  /** The label of the field in the properties panel, which is where the author changes it. */
  propertyLabelKey: string;
}

/**
 * Lists the variables of the unit that break the Verona contract, each where the author has to fix it, and takes the
 * author there (#1129). It follows the findings while it is open, so what it shows is never older than the unit.
 */
@Component({
  templateUrl: './variable-info-findings-dialog.component.html',
  styleUrls: ['./variable-info-findings-dialog.component.scss'],
  standalone: false
})
export class VariableInfoFindingsDialogComponent implements OnDestroy {
  rows: VariableInfoFindingRow[] = [];
  hasGeometryFinding: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private selectionService: SelectionService,
              private dialogRef: MatDialogRef<VariableInfoFindingsDialogComponent>) {
    this.unitService.variableInfoFindings
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(findings => {
        this.rows = findings.map(finding => ({
          finding,
          value: finding.origin.subValue ?? [...new Set(finding.issues.map(issue => issue.value))].join(', '),
          codes: [...new Set(finding.issues.map(issue => issue.code))],
          propertyLabelKey: finding.origin.property === 'alias' ?
            'propertiesPanel.id' :
            `propertiesPanel.${finding.origin.property}`
        }));
        this.hasGeometryFinding = findings.some(finding => finding.origin.subValue !== undefined);
      });
  }

  goToElement(location: VariableInfoLocation): void {
    this.dialogRef.close();
    this.selectionService.requestElement(location.pageIndex, location.sectionIndex, location.navigationElement.id);
  }

  editStateVariables(): void {
    this.dialogRef.close();
    this.unitService.editStateVariables();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UIElement } from 'common/models/elements/element';
import { RulesIntoNothing, SectionLocation } from 'editor/src/app/classes/reference-manager';
import { ElementLocator } from 'editor/src/app/utils/element-locator';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoLocation, VariableInfoOrigins } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';
import { IdReplacement, IdReplacementTarget } from 'editor/src/app/utils/id-replacement';

/** One line of the dialog: a finding with what it shows already worked out. */
export interface VariableInfoFindingRow {
  finding: VariableInfoFinding;
  /** What has to change: the GeoGebra name where the identifier is composed from one, the identifier otherwise. */
  value: string;
  codes: VariableInfoIssueCode[];
  /** The label of the field in the properties panel, which is where the author changes it. */
  propertyLabelKey: string;
  /** The element or state variable whose own id the finding is about, if replacing it clears the finding (#1508). */
  replaceTarget: IdReplacementTarget | null;
}

/**
 * The hints area of the unit: the variables that break the Verona contract (#1129), the visibility rules that ask for
 * nothing and what loading repaired (#1520), each where the author has to look, with the way there. It follows the
 * unit while it is open, so what it shows is never older than the unit.
 */
@Component({
  templateUrl: './variable-info-findings-dialog.component.html',
  styleUrls: ['./variable-info-findings-dialog.component.scss'],
  standalone: false
})
export class VariableInfoFindingsDialogComponent implements OnDestroy {
  rows: VariableInfoFindingRow[] = [];
  hasGeometryFinding: boolean = false;
  /** The sections whose visibility rules ask for something the unit does not hold (#1520). */
  rulesIntoNothing: RulesIntoNothing[] = [];
  /** What loading took a reference into nothing from, as far as the unit still holds it (#1520). */
  repairedElements: UIElement[] = [];
  /** Every element and state variable whose id can be replaced, each once. */
  replaceableTargets: IdReplacementTarget[] = [];
  /**
   * The ids the author asked to replace, waiting for the confirmation. Replacing costs the variables' codings in the
   * studio, so the dialog says so and asks before anything changes (#1508).
   */
  pendingReplacement: IdReplacementTarget[] | null = null;
  /**
   * How many variables the pending replacement renames, which is what costs codings: an element of its own variable,
   * a geometry element with each tracked GeoGebra variable as well. An upper bound, as of two ids that differ only in
   * letter case one replacement is enough.
   */
  pendingVariableCount: number = 0;
  /** The unit the replacement was asked on; one the host loaded meanwhile must not be touched by it. */
  private pendingUnit: unknown = null;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService,
              private dialogService: DialogService,
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
            `propertiesPanel.${finding.origin.property}`,
          replaceTarget: IdReplacement.targetOf(finding)
        }));
        this.hasGeometryFinding = findings.some(finding => finding.origin.subValue !== undefined);
        const targetsByHolder = new Map<unknown, IdReplacementTarget>();
        this.rows.forEach(row => {
          if (row.replaceTarget) {
            targetsByHolder.set(VariableInfoFindingsDialogComponent.holderOf(row.replaceTarget), row.replaceTarget);
          }
        });
        this.replaceableTargets = [...targetsByHolder.values()];
        if (this.pendingUnit !== null && this.pendingUnit !== this.unitService.unit) this.cancelReplacement();
      });
    this.unitService.rulesIntoNothing
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(rules => { this.rulesIntoNothing = rules; });
    // Renewed with the findings, which follow every change: an element deleted since loading drops out.
    combineLatest([this.unitService.loadRepairs, this.unitService.variableInfoFindings])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([repaired]) => {
        this.repairedElements = repaired
          .filter(element => ElementLocator.locate(this.unitService.unit, element) !== null);
      });
  }

  askToReplace(targets: IdReplacementTarget[]): void {
    const holders = new Set(targets.map(target => VariableInfoFindingsDialogComponent.holderOf(target)));
    this.pendingReplacement = targets;
    this.pendingUnit = this.unitService.unit;
    this.pendingVariableCount = VariableInfoOrigins.collect(this.unitService.unit)
      .filter(origin => holders.has(origin.location?.element ?? origin.stateVariable))
      .length;
  }

  confirmReplacement(): void {
    if (this.pendingReplacement && this.pendingUnit === this.unitService.unit) {
      this.unitService.replaceIds(this.pendingReplacement);
    }
    this.cancelReplacement();
  }

  cancelReplacement(): void {
    this.pendingReplacement = null;
    this.pendingUnit = null;
  }

  private static holderOf(target: IdReplacementTarget): unknown {
    return target.element ?? target.stateVariable;
  }

  /* Each goes there only once the dialog is closed, so the focus it hands back does not scroll away again (#1520). */
  goToElement(location: VariableInfoLocation): void {
    this.dialogService.closeAllThen(() => this.unitService.revealLocation(location));
  }

  goToSection(location: SectionLocation): void {
    this.dialogService.closeAllThen(() => this.unitService.revealSection(location));
  }

  goToRepairedElement(element: UIElement): void {
    this.dialogService.closeAllThen(() => this.unitService.revealElement(element));
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

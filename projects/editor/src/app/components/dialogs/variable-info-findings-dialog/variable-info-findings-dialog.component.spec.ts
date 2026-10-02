import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { Mock } from 'vitest';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssue, VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';
import {
  VariableInfoFindingsDialogComponent
} from 'editor/src/app/components/dialogs/variable-info-findings-dialog/variable-info-findings-dialog.component';

function issue(index: number, part: 'id' | 'alias', value: string, code: VariableInfoIssueCode): VariableInfoIssue {
  return {
    index, part, value, code
  };
}

function location(pageIndex: number, sectionIndex: number,
                  own: UIElement, navigationElement: UIElement): VariableInfoLocation {
  return {
    pageIndex, sectionIndex, element: own, navigationElement
  };
}

describe('VariableInfoFindingsDialogComponent', () => {
  let fixture: ComponentFixture<VariableInfoFindingsDialogComponent>;
  let findings: BehaviorSubject<VariableInfoFinding[]>;
  let unitService: {
    unit: EditorUnit,
    variableInfoFindings: BehaviorSubject<VariableInfoFinding[]>,
    editStateVariables: () => void,
    replaceIds: Mock
  };
  let selectionService: SelectionService;
  let dialogRef: SpyObj<MatDialogRef<VariableInfoFindingsDialogComponent>>;

  const info = (id: string, alias: string): VariableInfo => ({ id, alias } as VariableInfo);
  const element = (type: string, id: string, alias: string): UIElement => ({ type, id, alias } as UIElement);

  const geometry = element('geometry', 'geometry_1', 'ggb01');
  const geometryFinding: VariableInfoFinding = {
    origin: {
      info: info('geometry_1_fistgewählt', 'ggb01_fistgewählt'),
      location: location(1, 2, geometry, geometry),
      property: 'trackedVariables',
      subValue: 'fistgewählt'
    },
    issues: [
      issue(0, 'id', 'geometry_1_fistgewählt', 'INVALID_CHARACTERS'),
      issue(0, 'alias', 'ggb01_fistgewählt', 'INVALID_CHARACTERS')
    ],
    holdsBackList: true
  };
  const likert = element('likert', 'likert_1', 'likert');
  const rowFinding: VariableInfoFinding = {
    origin: {
      info: info('likert-row_1', 'Wert'),
      location: location(0, 0, element('likert-row', 'likert-row_1', 'Wert'), likert),
      property: 'alias'
    },
    issues: [issue(1, 'alias', 'Wert', 'DUPLICATE_ALIAS')],
    holdsBackList: true
  };
  const stateVariable = new StateVariable('März', 'maerz', '');
  const stateVariableFinding: VariableInfoFinding = {
    origin: {
      info: info('März', 'maerz'), stateVariable, property: 'alias'
    },
    issues: [issue(2, 'id', 'März', 'INVALID_CHARACTERS')],
    holdsBackList: false
  };

  const rows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.finding-row'));
  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    findings = new BehaviorSubject<VariableInfoFinding[]>([geometryFinding, rowFinding, stateVariableFinding]);
    const unit = new EditorUnit();
    unit.stateVariables = [stateVariable];
    unitService = {
      unit, variableInfoFindings: findings, editStateVariables: vi.fn(), replaceIds: vi.fn()
    };
    selectionService = new SelectionService();
    dialogRef = createSpyObj<MatDialogRef<VariableInfoFindingsDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      declarations: [VariableInfoFindingsDialogComponent],
      imports: [MatDialogModule, MatButtonModule, TranslateModule.forRoot()],
      providers: [
        { provide: UnitService, useValue: unitService },
        { provide: SelectionService, useValue: selectionService },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VariableInfoFindingsDialogComponent);
    fixture.detectChanges();
  });

  it('should show one line per finding, with the name that has to change', () => {
    expect(rows().length).toBe(3);
    expect(rows()[0].querySelector('.finding-value')?.textContent).toBe('fistgewählt');
    expect(rows()[1].querySelector('.finding-value')?.textContent).toBe('Wert');
    expect(rows()[2].querySelector('.finding-value')?.textContent).toBe('März');
  });

  it('should name the property by the label of its field in the properties panel', () => {
    expect(rows()[0].textContent).toContain('propertiesPanel.trackedVariables');
    expect(rows()[1].textContent).toContain('propertiesPanel.id');
  });

  it('should name the reason once even where both identifiers break the same rule', () => {
    expect(rows()[0].textContent?.match(/variableInfoFindings\.code\.INVALID_CHARACTERS/g)?.length).toBe(1);
  });

  it('should explain what can be done about a name from GeoGebra', () => {
    expect(text()).toContain('variableInfoFindings.geometryHint');

    findings.next([rowFinding]);
    fixture.detectChanges();

    expect(text()).not.toContain('variableInfoFindings.geometryHint');
  });

  it('should mark what concerns only the id and holds nothing back', () => {
    expect(rows()[2].textContent).toContain('variableInfoFindings.idHint');
    expect(rows()[0].textContent).not.toContain('variableInfoFindings.idHint');
  });

  /* Replacing an id costs the variable's codings in the studio, so it is offered where it helps and asked first
     (#1508). */
  describe('replacing an id', () => {
    const replaceButton = (row: HTMLElement): HTMLButtonElement | null => row.querySelector('.replace-id');
    const warning = (): HTMLElement | null => fixture.nativeElement.querySelector('.replacement-warning');

    it('should be offered only where the finding is about an own id that breaks the contract', () => {
      // The GeoGebra name is at fault, not the element's id; the likert row's alias is the only issue.
      expect(replaceButton(rows()[0])).toBeNull();
      expect(replaceButton(rows()[1])).toBeNull();
      expect(replaceButton(rows()[2])).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.replace-all')).toBeNull();
    });

    it('should warn about the studio codings and replace only once confirmed', () => {
      (replaceButton(rows()[2]) as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(warning()?.textContent).toContain('variableInfoFindings.replaceWarning');
      // The number the author decides on: the variables renamed, here the one of the state variable.
      expect(fixture.componentInstance.pendingVariableCount).toBe(1);
      expect(unitService.replaceIds).not.toHaveBeenCalled();

      (fixture.nativeElement.querySelector('.confirm-replacement') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(unitService.replaceIds).toHaveBeenCalledWith([{ stateVariable }]);
      expect(warning()).toBeNull();
    });

    /* The dialog stays open across a unit the host loads; what was asked belongs to the unit before. */
    it('should drop a pending replacement once another unit is loaded', () => {
      (replaceButton(rows()[2]) as HTMLButtonElement).click();
      fixture.detectChanges();

      unitService.unit = new EditorUnit();
      findings.next([stateVariableFinding]);
      fixture.detectChanges();

      expect(warning()).toBeNull();
      fixture.componentInstance.confirmReplacement();
      expect(unitService.replaceIds).not.toHaveBeenCalled();
    });

    it('should replace nothing when the author cancels', () => {
      (replaceButton(rows()[2]) as HTMLButtonElement).click();
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.cancel-replacement') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(unitService.replaceIds).not.toHaveBeenCalled();
      expect(warning()).toBeNull();
    });

    it('should offer to replace all, each holder once, where there is more than one', () => {
      const field = element('text-field', 'Aufgabe 1', 'aufgabe1');
      findings.next([stateVariableFinding, {
        origin: {
          info: info('Aufgabe 1', 'aufgabe1'), location: location(0, 0, field, field), property: 'alias'
        },
        issues: [issue(3, 'id', 'Aufgabe 1', 'INVALID_CHARACTERS')],
        holdsBackList: false
      }]);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.replace-all') as HTMLButtonElement).click();
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.confirm-replacement') as HTMLButtonElement).click();

      expect(unitService.replaceIds).toHaveBeenCalledWith([{ stateVariable }, { element: field }]);
    });
  });

  /* A likert row has no overlay of its own; the likert is what can be selected. */
  it('should take the author to the element that can be selected', () => {
    const requestElement = vi.spyOn(selectionService, 'requestElement');

    (rows()[1].querySelector('.finding-action') as HTMLButtonElement).click();

    expect(dialogRef.close).toHaveBeenCalled();
    expect(requestElement).toHaveBeenCalledWith(0, 0, 'likert_1');
  });

  it('should open the state variables for a state variable', () => {
    (rows()[2].querySelector('.finding-action') as HTMLButtonElement).click();

    expect(dialogRef.close).toHaveBeenCalled();
    expect(unitService.editStateVariables).toHaveBeenCalled();
  });

  it('should follow the findings while it is open', () => {
    findings.next([]);
    fixture.detectChanges();

    expect(rows().length).toBe(0);
    expect(text()).toContain('variableInfoFindings.none');
  });
});

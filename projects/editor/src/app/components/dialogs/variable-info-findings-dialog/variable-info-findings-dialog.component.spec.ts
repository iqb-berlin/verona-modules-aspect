import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
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
  let unitService: { variableInfoFindings: BehaviorSubject<VariableInfoFinding[]>, editStateVariables: () => void };
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
    isCorrectable: true
  };
  const likert = element('likert', 'likert_1', 'likert');
  const rowFinding: VariableInfoFinding = {
    origin: {
      info: info('likert-row_1', 'Wert'),
      location: location(0, 0, element('likert-row', 'likert-row_1', 'Wert'), likert),
      property: 'alias'
    },
    issues: [issue(1, 'alias', 'Wert', 'DUPLICATE_ALIAS')],
    isCorrectable: true
  };
  const stateVariable = new StateVariable('März', 'maerz', '');
  const stateVariableFinding: VariableInfoFinding = {
    origin: {
      info: info('März', 'maerz'), stateVariable, property: 'alias'
    },
    issues: [issue(2, 'id', 'März', 'INVALID_CHARACTERS')],
    isCorrectable: false
  };

  const rows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.finding-row'));
  const text = (): string => fixture.nativeElement.textContent;

  beforeEach(async () => {
    findings = new BehaviorSubject<VariableInfoFinding[]>([geometryFinding, rowFinding, stateVariableFinding]);
    unitService = { variableInfoFindings: findings, editStateVariables: vi.fn() };
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

  it('should mark what cannot be corrected in the editor', () => {
    expect(rows()[2].textContent).toContain('variableInfoFindings.uncorrectable');
    expect(rows()[0].textContent).not.toContain('variableInfoFindings.uncorrectable');
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

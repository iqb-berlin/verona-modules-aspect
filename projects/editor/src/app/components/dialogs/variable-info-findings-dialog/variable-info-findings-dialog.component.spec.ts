// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Section } from 'common/models/section';
import { RulesIntoNothing } from 'editor/src/app/classes/reference-manager';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { Mock } from 'vitest';
import { EditorUnit } from 'editor/src/app/models/editor-unit';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VariableInfoFinding } from 'editor/src/app/models/variable-info-finding';
import { LoadErrorHint } from 'editor/src/app/models/load-error';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';
import { VariableInfoIssue, VariableInfoIssueCode } from 'editor/src/app/utils/variable-info-validator';
import {
  VariableInfoFindingsDialogComponent
} from 'editor/src/app/components/dialogs/variable-info-findings-dialog/variable-info-findings-dialog.component';

@Component({
  selector: 'aspect-element-list',
  template: '',
  standalone: false
})
class MockElementListComponent {
  @Input() elements!: UIElement[];
  @Input() navigable: boolean = false;
  @Output() goToElement = new EventEmitter<UIElement>();
}

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
    rulesIntoNothing: BehaviorSubject<RulesIntoNothing[]>,
    loadRepairs: BehaviorSubject<UIElement[]>,
    loadErrorHints: BehaviorSubject<LoadErrorHint[]>,
    editStateVariables: () => void,
    replaceIds: Mock,
    revealElement: Mock,
    revealLocation: Mock,
    revealSection: Mock
  };
  let dialogService: { closeAllThen: Mock };
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
      unit,
      variableInfoFindings: findings,
      rulesIntoNothing: new BehaviorSubject<RulesIntoNothing[]>([]),
      loadRepairs: new BehaviorSubject<UIElement[]>([]),
      loadErrorHints: new BehaviorSubject<LoadErrorHint[]>([]),
      editStateVariables: vi.fn(),
      replaceIds: vi.fn(),
      revealElement: vi.fn(),
      revealLocation: vi.fn(),
      revealSection: vi.fn()
    };
    // Closing every dialog is the service's part; here it acts at once, as it does once they are closed.
    dialogService = { closeAllThen: vi.fn((action: () => void) => action()) };
    dialogRef = createSpyObj<MatDialogRef<VariableInfoFindingsDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      declarations: [VariableInfoFindingsDialogComponent, MockElementListComponent],
      imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslateModule.forRoot()],
      providers: [
        { provide: UnitService, useValue: unitService },
        { provide: DialogService, useValue: dialogService },
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

      expect(warning()?.textContent).toContain('variableInfoFindings.replaceWarning.one');
      // The number the author decides on: the variables renamed, here the one of the state variable.
      expect(fixture.componentInstance.pendingVariableCount).toBe(1);
      // A warning by its symbol, not by a coloured frame; the colour is the button's (#1520).
      expect(warning()?.querySelector('.message-icon-warning')).toBeTruthy();
      const actions = Array.from(warning()?.querySelectorAll('button') ?? []);
      expect(actions.map(button => button.classList.contains('confirm-replacement'))).toEqual([false, true]);
      expect(actions[1].textContent?.trim()).toBe('variableInfoFindings.replaceConfirm.one');
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
      expect(fixture.nativeElement.querySelector('.confirm-replacement').textContent.trim())
        .toBe('variableInfoFindings.replaceConfirm.other');
      (fixture.nativeElement.querySelector('.confirm-replacement') as HTMLButtonElement).click();

      expect(unitService.replaceIds).toHaveBeenCalledWith([{ stateVariable }, { element: field }]);
    });
  });

  /* A likert row has no overlay of its own; the likert is what can be selected. */
  it('should take the author to the element that can be selected, once the dialogs are closed', () => {
    (rows()[1].querySelector('.finding-action') as HTMLButtonElement).click();

    expect(dialogService.closeAllThen).toHaveBeenCalled();
    expect(unitService.revealLocation).toHaveBeenCalledWith(expect.objectContaining({
      pageIndex: 0, sectionIndex: 0, navigationElement: likert
    }));
  });

  it('should open the state variables for a state variable', () => {
    (rows()[2].querySelector('.finding-action') as HTMLButtonElement).click();

    expect(dialogRef.close).toHaveBeenCalled();
    expect(unitService.editStateVariables).toHaveBeenCalled();
  });

  it('should lead its title with a warning symbol and name the names section (#1520)', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');

    expect(title.textContent).toContain('unitHints.title');
    expect(title.querySelector('.message-icon-warning')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.variable-names-section h3').textContent)
      .toContain('variableInfoFindings.title');
  });

  it('should follow the findings while it is open', () => {
    findings.next([]);
    fixture.detectChanges();

    expect(rows().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.variable-names-section')).toBeNull();
    expect(text()).toContain('unitHints.none');
  });

  /* What loading only reported lives here as well, with the way to the section, until the rule is fixed (#1520). */
  describe('visibility rules into nothing', () => {
    const sectionLocation = { section: new Section(), pageIndex: 1, sectionIndex: 0 };
    const ruleRows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.rules-into-nothing-row'));

    beforeEach(() => {
      unitService.rulesIntoNothing.next([{ location: sectionLocation, targetIDs: ['text-field_9', 'state_9'] }]);
      fixture.detectChanges();
    });

    it('should list each section with the ids its rules ask for', () => {
      expect(ruleRows().length).toBe(1);
      expect(ruleRows()[0].textContent).toContain('variableInfoFindings.location');
      expect(Array.from(ruleRows()[0].querySelectorAll('.rule-target')).map(target => target.textContent?.trim()))
        .toEqual(['text-field_9', 'state_9']);
    });

    it('should name a rule saved before anything was chosen', () => {
      unitService.rulesIntoNothing.next([{ location: sectionLocation, targetIDs: [''] }]);
      fixture.detectChanges();

      expect(ruleRows()[0].querySelector('.no-target')?.textContent).toContain('unitHints.rulesIntoNothing.noTarget');
    });

    it('should lead the title with a warning while something is open, and with nothing otherwise', () => {
      const title = (): HTMLElement => fixture.nativeElement.querySelector('[mat-dialog-title]');
      findings.next([]);
      fixture.detectChanges();
      expect(title().querySelector('.message-icon-warning')).toBeTruthy();

      unitService.rulesIntoNothing.next([]);
      fixture.detectChanges();
      expect(title().querySelector('.message-icon-warning')).toBeNull();
    });

    it('should take the author to the section', () => {
      (ruleRows()[0].querySelector('.go-to-section') as HTMLButtonElement).click();

      expect(dialogService.closeAllThen).toHaveBeenCalled();
      expect(unitService.revealSection).toHaveBeenCalledWith(sectionLocation);
    });

    it('should drop the section once its rules are fixed', () => {
      unitService.rulesIntoNothing.next([]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.rules-into-nothing-section')).toBeNull();
    });
  });

  /* What the player would report to the host, listed at its element with a text the author can act on (#1537). */
  describe('what could not be loaded', () => {
    const image = element('image', 'image_1', 'bild');
    const imageHint: LoadErrorHint = {
      error: { code: 'image-not-loading', message: 'Failed to load image element', elementId: 'image_1' },
      element: image,
      location: location(1, 0, image, image),
      textKey: 'unitHints.loadErrors.code.image-not-loading'
    };
    const geogebraHint: LoadErrorHint = {
      error: { code: 'geogebra-not-loading', message: 'GeoGebra could not be loaded' },
      element: null,
      location: null,
      textKey: 'unitHints.loadErrors.code.geogebra-not-loading'
    };
    const errorRows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.load-error-row'));

    beforeEach(() => {
      findings.next([]);
      unitService.loadErrorHints.next([imageHint, geogebraHint]);
      fixture.detectChanges();
    });

    it('should explain each error by its text and give the technical message beneath', () => {
      expect(errorRows().length).toBe(2);
      expect(errorRows()[0].querySelector('.load-error-text')?.textContent)
        .toContain('unitHints.loadErrors.code.image-not-loading');
      expect(errorRows()[0].querySelector('.load-error-detail')?.textContent)
        .toContain('Failed to load image element');
      expect(errorRows()[1].querySelector('.load-error-text')?.textContent)
        .toContain('unitHints.loadErrors.code.geogebra-not-loading');
    });

    it('should name where an element sits, and the whole unit for an error without one', () => {
      expect(errorRows()[0].textContent).toContain('variableInfoFindings.location');
      expect(errorRows()[0].textContent).toContain('bild');
      expect(errorRows()[1].textContent).toContain('unitHints.loadErrors.wholeUnit');
    });

    it('should take the author to the element, and offer no way for the whole unit', () => {
      expect(errorRows()[1].querySelector('.go-to-load-error')).toBeNull();

      (errorRows()[0].querySelector('.go-to-load-error') as HTMLButtonElement).click();

      expect(dialogService.closeAllThen).toHaveBeenCalled();
      expect(unitService.revealLocation).toHaveBeenCalledWith(imageHint.location);
    });

    it('should count as something open in the title', () => {
      const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(title.querySelector('.message-icon-warning')).toBeTruthy();

      unitService.loadErrorHints.next([]);
      fixture.detectChanges();

      expect(title.querySelector('.message-icon-warning')).toBeNull();
      expect(fixture.nativeElement.querySelector('.load-errors-section')).toBeNull();
    });
  });

  describe('what loading repaired', () => {
    const repairedList = (): MockElementListComponent | undefined => fixture.debugElement
      .query(By.directive(MockElementListComponent))?.componentInstance;

    it('should list the repaired elements the unit still holds, with the way there', () => {
      const held = {
        ...element('drop-list', 'drop-list_1', 'ablage'), getChildElements: () => []
      } as unknown as UIElement;
      unitService.unit.pages[0].sections[0].elements.push(held as never);
      unitService.loadRepairs.next([held, element('button', 'button_9', 'weg')]);
      fixture.detectChanges();

      expect(repairedList()?.elements).toEqual([held]);
      expect(repairedList()?.navigable).toBe(true);

      repairedList()?.goToElement.emit(held);
      expect(dialogService.closeAllThen).toHaveBeenCalled();
      expect(unitService.revealElement).toHaveBeenCalledWith(held);
    });

    it('should show no such section after a load that repaired nothing', () => {
      expect(fixture.nativeElement.querySelector('.load-repairs-section')).toBeNull();
    });
  });
});

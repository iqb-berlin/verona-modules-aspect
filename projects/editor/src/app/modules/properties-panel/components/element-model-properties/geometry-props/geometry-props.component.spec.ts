import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Mock, vi } from 'vitest';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { By } from '@angular/platform-browser';
import {
  GeometryVariableCheckPipe
} from 'editor/src/app/modules/properties-panel/pipes/geometry-variable-check.pipe';
import {
  GeometryVariableOptionsPipe
} from 'editor/src/app/modules/properties-panel/pipes/geometry-variable-options.pipe';
import {
  GeometryPropsComponent
} from './geometry-props.component';

describe('GeometryPropsComponent', () => {
  let component: GeometryPropsComponent;
  let fixture: ComponentFixture<GeometryPropsComponent>;
  let dialogService: SpyObj<DialogService>;
  let messageService: SpyObj<MessageService>;
  let emitted: { property: string; value: unknown }[];
  let chipInputClear: Mock;

  const chipInputEvent = (value: string): MatChipInputEvent => ({
    value,
    chipInput: { clear: chipInputClear }
  } as unknown as MatChipInputEvent);

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showGeogebraAppDefinitionDialog']);
    messageService = createSpyObj<MessageService>(['showError']);
    chipInputClear = vi.fn();
    const selectionServiceMock = {
      selectedElements: of([]),
      selectedElementComponents: []
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [
        GeometryPropsComponent, MergedCheckboxComponent, MergedMarkerComponent,
        GeometryVariableCheckPipe, GeometryVariableOptionsPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: { expertMode: true } as UnitService },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: DialogService, useValue: dialogService },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeometryPropsComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'geometry',
      appDefinition: 'oldDefinition',
      fileName: 'old.ggb',
      showResetIcon: true,
      enableUndoRedo: true,
      enableShiftDragZoom: true,
      showZoomButtons: true,
      showFullscreenButton: true,
      showAlgebraInput: false,
      recomputedCountsAsChanged: false,
      showToolbar: true,
      customToolbar: '',
      trackedVariables: [],
      trackedExpectedVariables: [{ id: 'A', value: '' }]
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the input bar setting and emit it when toggled', () => {
    const checkbox = Array.from(
      fixture.nativeElement.querySelectorAll('aspect-merged-checkbox') as NodeListOf<HTMLElement>
    ).find(element => element.textContent?.includes('propertiesPanel.showAlgebraInput')) as HTMLElement;
    const input = checkbox.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);

    input.click();

    expect(emitted).toEqual([{ property: 'showAlgebraInput', value: true }]);
  });

  it('should show the recomputation setting outside expert mode and emit it when toggled', () => {
    component.unitService.expertMode = false;
    fixture.detectChanges();
    const checkbox = Array.from(
      fixture.nativeElement.querySelectorAll('aspect-merged-checkbox') as NodeListOf<HTMLElement>
    ).find(element => element.textContent?.includes('propertiesPanel.recomputedCountsAsChanged')) as HTMLElement;
    const input = checkbox.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);

    input.click();

    expect(emitted).toEqual([{ property: 'recomputedCountsAsChanged', value: true }]);
  });

  it('should render the current app definition', () => {
    const appDefinitionInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(appDefinitionInput.value).toBe('oldDefinition');
  });

  it('should add a tracked expected variable', () => {
    component.addTrackedExpectedVariable(chipInputEvent('B'));

    expect(emitted).toEqual([{
      property: 'trackedExpectedVariables',
      value: [{ id: 'A', value: '' }, { id: 'B', value: '' }]
    }]);
    expect(chipInputClear).toHaveBeenCalled();
  });

  it('should reject a tracked expected variable with invalid characters', () => {
    component.addTrackedExpectedVariable(chipInputEvent('B C'));

    expect(messageService.showError).toHaveBeenCalledWith('idContainsInvalidCharacters');
    expect(emitted).toEqual([]);
  });

  it('should ignore an already tracked expected variable', () => {
    component.addTrackedExpectedVariable(chipInputEvent('A'));

    expect(emitted).toEqual([]);
    expect(messageService.showError).not.toHaveBeenCalled();
  });

  /* `a` beside `A` would give two identifiers that differ only in letter case (#1129). */
  it('should reject an expected variable that differs from a chosen one only in letter case', () => {
    component.combinedProperties.trackedVariables = [{ id: 'B', value: '' }];

    component.addTrackedExpectedVariable(chipInputEvent('a'));
    component.addTrackedExpectedVariable(chipInputEvent('b'));

    expect(messageService.showError).toHaveBeenCalledTimes(2);
    expect(messageService.showError).toHaveBeenCalledWith('propertiesPanel.geometryVariableIssue.DUPLICATE_ALIAS');
    expect(emitted).toEqual([]);
  });

  it('should mark a stored expected variable whose name breaks the contract', () => {
    const issueIcons = (): number => fixture.nativeElement.querySelectorAll('.geometry-variable-issue-icon').length;
    expect(issueIcons()).toBe(0);

    component.combinedProperties = {
      ...component.combinedProperties, trackedExpectedVariables: [{ id: 'fistgewählt', value: '' }]
    };
    fixture.detectChanges();

    expect(issueIcons()).toBe(1);
  });

  describe('the list of GeoGebra objects', () => {
    const openOptions = (): HTMLElement[] => {
      fixture.debugElement.query(By.directive(MatSelect)).componentInstance.open();
      fixture.detectChanges();
      return Array.from(document.querySelectorAll<HTMLElement>('mat-option'));
    };

    beforeEach(() => {
      component.geometryObjects.next([
        { id: 'A', value: '' }, { id: 'a', value: '' }, { id: 'fistgewählt', value: '' }, { id: 'B', value: '' }
      ]);
    });

    it('should lock names with an issue that are not chosen, and mark them', () => {
      component.combinedProperties = { ...component.combinedProperties, trackedVariables: [{ id: 'B', value: '' }] };
      fixture.detectChanges();

      const options = openOptions();

      expect(options.map(option => option.getAttribute('aria-disabled'))).toEqual(['false', 'true', 'true', 'false']);
      expect(options[2].textContent).toContain('propertiesPanel.geometryVariableIssue.INVALID_CHARACTERS');
      expect(options[1].textContent).toContain('propertiesPanel.geometryVariableIssue.DUPLICATE_ALIAS');
    });

    /* In a unit stored before #1129 that is how the author gets rid of them. */
    it('should keep chosen names with an issue selectable', () => {
      component.combinedProperties = {
        ...component.combinedProperties,
        trackedVariables: [{ id: 'a', value: '' }, { id: 'fistgewählt', value: '' }],
        trackedExpectedVariables: []
      };
      fixture.detectChanges();

      const options = openOptions();

      expect(options.map(option => option.getAttribute('aria-disabled'))).toEqual(['true', 'false', 'false', 'false']);
    });

    /* A replaced file leaves its names tracked; they were missing from the list and so could not be taken out
       (#1505). */
    it('should list a tracked name the file no longer has, marked and selectable', fakeAsync(() => {
      component.combinedProperties = {
        ...component.combinedProperties,
        trackedVariables: [{ id: 'B', value: '' }, { id: 'alt', value: '' }],
        trackedExpectedVariables: []
      };
      fixture.detectChanges();
      tick(); // ngModel writes the selection a microtask later

      const options = openOptions();
      tick(); // and the select marks the options it renders on opening a microtask later still
      fixture.detectChanges();

      expect(options.map(option => option.textContent?.trim().split(/\s/)[0]))
        .toEqual(['A', 'a', 'fistgewählt', 'B', 'alt']);
      expect(options[4].textContent).toContain('propertiesPanel.geometryVariableMissing');
      expect(options[4].textContent).not.toContain('propertiesPanel.geometryVariableIssue');
      expect(options[4].getAttribute('aria-disabled')).toBe('false');
      expect(options[4].getAttribute('aria-selected')).toBe('true');
    }));
  });

  it('should name both reasons for a missing name that breaks the contract as well', () => {
    component.geometryObjects.next([{ id: 'A', value: '' }]);
    component.combinedProperties = {
      ...component.combinedProperties, trackedVariables: [{ id: 'größe', value: '' }], trackedExpectedVariables: []
    };
    fixture.detectChanges();

    fixture.debugElement.query(By.directive(MatSelect)).componentInstance.open();
    fixture.detectChanges();
    const missingOption = Array.from(document.querySelectorAll<HTMLElement>('mat-option'))[1];

    expect(missingOption.textContent).toContain('propertiesPanel.geometryVariableMissing');
    expect(missingOption.textContent).toContain('propertiesPanel.geometryVariableIssue.INVALID_CHARACTERS');
  });

  it('should not tell a tracked name missing before the applet has loaded', () => {
    component.geometryObjects.next(null);
    component.combinedProperties = {
      ...component.combinedProperties, trackedVariables: [{ id: 'B', value: '' }]
    };
    fixture.detectChanges();

    fixture.debugElement.query(By.directive(MatSelect)).componentInstance.open();
    fixture.detectChanges();

    expect(document.querySelectorAll('mat-option').length).toBe(0);
  });

  it('should remove a tracked expected variable', () => {
    component.removeTrackedExpectedVariable({ id: 'A', value: '' } as GeometryVariable);

    expect(emitted).toEqual([{ property: 'trackedExpectedVariables', value: [] }]);
  });

  it('should emit the tracked variables of the selection', () => {
    const variables = [{ id: 'A', value: '1' }] as GeometryVariable[];

    component.setGeometryVariables(variables);

    expect(emitted).toEqual([{ property: 'trackedVariables', value: variables }]);
  });

  it('should compare geometry variables by id', () => {
    expect(component.compareGeometryVariables(
      { id: 'A', value: '1' } as GeometryVariable,
      { id: 'A', value: '2' } as GeometryVariable
    )).toBe(true);
    expect(component.compareGeometryVariables(
      { id: 'A', value: '1' } as GeometryVariable,
      { id: 'B', value: '1' } as GeometryVariable
    )).toBe(false);
  });

  it('should emit definition and file name of the geogebra dialog result', async () => {
    dialogService.showGeogebraAppDefinitionDialog.mockReturnValue(
      of({ content: 'newDefinition', name: 'new.ggb' })
    );

    await component.showGeogebraAppDefDialog();

    expect(emitted).toEqual([
      { property: 'appDefinition', value: 'newDefinition' },
      { property: 'fileName', value: 'new.ggb' }
    ]);
  });

  /* Cancelling answers with nothing at all; reading a field of that answer threw (#1296). */
  it('should emit nothing when the geogebra dialog is cancelled', async () => {
    dialogService.showGeogebraAppDefinitionDialog.mockReturnValue(of(undefined));

    await component.showGeogebraAppDefDialog();

    expect(emitted).toEqual([]);
  });

  /* Both variable lists are arrays, and the merge answers a disagreeing array with null the same way
     it answers any other value. The characterization net cannot pin this: it diverges booleans,
     numbers and strings, but leaves arrays as they are - so the marking is held here (#1138). */
  describe('a selection whose tracked variables differ', () => {
    const markers = (): NodeListOf<HTMLElement> => fixture.nativeElement
      .querySelectorAll('aspect-merged-marker mat-icon');

    it('should mark both variable fields', async () => {
      component.combinedProperties = {
        ...component.combinedProperties, trackedVariables: null, trackedExpectedVariables: null
      };
      fixture.detectChanges();
      await fixture.whenStable();

      expect(markers().length).toBe(2);
    });

    it('should stay away where the selection agrees', () => {
      expect(markers().length).toBe(0);
    });
  });
});

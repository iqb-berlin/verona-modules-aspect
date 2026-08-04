import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
      declarations: [GeometryPropsComponent, MergedCheckboxComponent, MergedMarkerComponent],
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

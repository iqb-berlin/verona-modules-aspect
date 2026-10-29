import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { StateVariable } from 'common/models/state-variable';
import { IDService } from 'editor/src/app/services/id.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  StateVariableEditorComponent
} from 'editor/src/app/components/state-variable-editor/state-variable-editor.component';
import {
  StateVariablesDialogComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variables-dialog.component';

describe('StateVariablesDialogComponent', () => {
  let component: StateVariablesDialogComponent;
  let fixture: ComponentFixture<StateVariablesDialogComponent>;

  const mockIDService = {
    getAndRegisterNewIDs: vi.fn().mockReturnValue({ id: 'v2', alias: 'v2' }),
    unregister: vi.fn(),
    isAliasAvailable: vi.fn().mockReturnValue(true)
  };

  const mockData = {
    stateVariables: [new StateVariable('v1', 'v1', 'val1')]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        StateVariablesDialogComponent,
        StateVariableEditorComponent
      ],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: IDService, useValue: mockIDService },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StateVariablesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a state variable', () => {
    component.addStateVariable();
    expect(component.stateVariables.length).toBe(2);
    expect(mockIDService.getAndRegisterNewIDs).toHaveBeenCalledWith('state-variable');
  });

  it('should delete a state variable', () => {
    component.deleteStateVariable(0);
    expect(component.stateVariables.length).toBe(0);
    expect(mockIDService.unregister).toHaveBeenCalled();
  });

  /* The editor writes the alias into the variable it is given. On the unit's own variables a cancelled dialog
     left the rename in place (#1129). */
  it('should edit copies of the variables, so that cancelling leaves the unit as it was', () => {
    component.stateVariables[0].alias = 'renamed';

    expect(mockData.stateVariables[0].alias).toBe('v1');
    expect(component.stateVariables[0]).toEqual(new StateVariable('v1', 'renamed', 'val1'));
  });
});

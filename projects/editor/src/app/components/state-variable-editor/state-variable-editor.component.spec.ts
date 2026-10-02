import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StateVariable } from 'common/models/state-variable';
import { IDService } from 'editor/src/app/services/id.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  StateVariableEditorComponent
} from 'editor/src/app/components/state-variable-editor/state-variable-editor.component';

describe('StateVariableEditorComponent', () => {
  let component: StateVariableEditorComponent;
  let fixture: ComponentFixture<StateVariableEditorComponent>;
  let mockIDService: SpyObj<IDService>;

  const mockStateVariable = new StateVariable('v1', 'v1', 'val1');

  beforeEach(async () => {
    mockIDService = createSpyObj<IDService>(['isAliasAvailable', 'unregister', 'register']);
    mockIDService.isAliasAvailable.mockReturnValue(true);

    await TestBed.configureTestingModule({
      declarations: [StateVariableEditorComponent],
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: IDService, useValue: mockIDService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StateVariableEditorComponent);
    component = fixture.componentInstance;
    component.stateVariable = new StateVariable(
      mockStateVariable.id, mockStateVariable.alias, mockStateVariable.value
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update alias if available', () => {
    const spy = vi.spyOn(component.stateVariableChange, 'emit');
    component.checkId('new_v1');
    expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('new_v1', 'v1');
    expect(mockIDService.unregister).toHaveBeenCalledWith('v1', false, true);
    expect(mockIDService.register).toHaveBeenCalledWith('new_v1', false, true);
    expect(component.stateVariable.alias).toBe('new_v1');
    expect(spy).toHaveBeenCalled();
  });

  it('should set error if alias not available', () => {
    mockIDService.isAliasAvailable.mockReturnValue(false);
    component.checkId('taken_v1');
    expect(component.error).toBe(true);
    expect(component.errorMessage).toBe('idTaken');
    expect(mockIDService.register).not.toHaveBeenCalled();
  });

  it('should set error if alias contains invalid characters', () => {
    ['März', 'Lösung1', 'weiter ', ' weiter', 'a.b'].forEach(alias => {
      component.checkId(alias);
      expect(component.error, alias).toBe(true);
      expect(component.errorMessage, alias).toBe('idContainsInvalidCharacters');
    });
    expect(mockIDService.register).not.toHaveBeenCalled();
    expect(component.stateVariable.alias).toBe('v1');
  });

  /* The validation area sends the author here to correct a stored alias; the editor has to say what is wrong with it
     before anything is typed (#1129). */
  describe('an alias stored that way', () => {
    const open = (alias: string): void => {
      component.stateVariable = new StateVariable('state_1', alias, '');
      component.error = false;
      component.errorMessage = '';
      component.ngOnInit();
    };

    it('should be marked at once when it has characters the contract forbids', () => {
      open('März');

      expect(component.error).toBe(true);
      expect(component.errorMessage).toBe('idContainsInvalidCharacters');
    });

    it('should be marked at once when another holds it regardless of letter case', () => {
      mockIDService.isAliasAvailable.mockReturnValue(false);
      open('Wert');

      expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('Wert', 'Wert');
      expect(component.errorMessage).toBe('idTaken');
    });

    it('should not be marked when it is fine', () => {
      open('wert_1');

      expect(component.error).toBe(false);
    });
  });

  it('should clear error when alias becomes valid again', () => {
    component.checkId('März');
    expect(component.error).toBe(true);
    component.checkId('Maerz');
    expect(component.error).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.stateVariable.alias).toBe('Maerz');
  });
});

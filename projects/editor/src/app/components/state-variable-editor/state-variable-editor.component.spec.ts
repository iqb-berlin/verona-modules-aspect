import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StateVariable } from 'common/models/state-variable';
import { IDService } from 'editor/src/app/services/id.service';
import { StateVariableEditorComponent } from './state-variable-editor.component';

describe('StateVariableEditorComponent', () => {
  let component: StateVariableEditorComponent;
  let fixture: ComponentFixture<StateVariableEditorComponent>;

  const mockIDService = {
    isAliasAvailable: jasmine.createSpy('isAliasAvailable').and.returnValue(true),
    unregister: jasmine.createSpy('unregister'),
    register: jasmine.createSpy('register')
  };

  const mockStateVariable = new StateVariable('v1', 'v1', 'val1');

  beforeEach(async () => {
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
    const spy = spyOn(component.stateVariableChange, 'emit');
    component.checkId('new_v1');
    expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('new_v1');
    expect(mockIDService.unregister).toHaveBeenCalledWith('v1', false, true);
    expect(mockIDService.register).toHaveBeenCalledWith('new_v1', false, true);
    expect(component.stateVariable.alias).toBe('new_v1');
    expect(spy).toHaveBeenCalled();
  });

  it('should set error if alias not available', () => {
    mockIDService.isAliasAvailable.and.returnValue(false);
    component.checkId('taken_v1');
    expect(component.error).toBeTrue();
    expect(mockIDService.register).not.toHaveBeenCalled();
  });
});

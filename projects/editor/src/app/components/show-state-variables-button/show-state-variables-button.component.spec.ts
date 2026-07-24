import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { of } from 'rxjs';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ShowStateVariablesButtonComponent } from 'editor/src/app/components/show-state-variables-button/show-state-variables-button.component';

describe('ShowStateVariablesButtonComponent', () => {
  let component: ShowStateVariablesButtonComponent;
  let fixture: ComponentFixture<ShowStateVariablesButtonComponent>;

  const mockDialogService = {
    showStateVariablesDialog: vi.fn().mockReturnValue(of([]))
  };

  const mockUnitService = {
    unit: {
      stateVariables: []
    },
    updateStateVariables: vi.fn(),
    reRegisterAll: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowStateVariablesButtonComponent],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatBadgeModule
      ],
      providers: [
        { provide: DialogService, useValue: mockDialogService },
        { provide: UnitService, useValue: mockUnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowStateVariablesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog and update state variables on success', () => {
    const newStateVars = [{ id: 'v1', alias: 'v1', value: '' }];
    mockDialogService.showStateVariablesDialog.mockReturnValue(of(newStateVars));
    component.showStateVariablesDialog();
    expect(mockDialogService.showStateVariablesDialog).toHaveBeenCalled();
    expect(mockUnitService.updateStateVariables).toHaveBeenCalledWith(newStateVars);
  });

  it('should open dialog and re-register all on cancel', () => {
    mockDialogService.showStateVariablesDialog.mockReturnValue(of(null));
    component.showStateVariablesDialog();
    expect(mockDialogService.showStateVariablesDialog).toHaveBeenCalled();
    expect(mockUnitService.reRegisterAll).toHaveBeenCalled();
  });
});

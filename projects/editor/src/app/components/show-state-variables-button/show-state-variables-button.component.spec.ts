import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  ShowStateVariablesButtonComponent
} from 'editor/src/app/components/show-state-variables-button/show-state-variables-button.component';

describe('ShowStateVariablesButtonComponent', () => {
  let component: ShowStateVariablesButtonComponent;
  let fixture: ComponentFixture<ShowStateVariablesButtonComponent>;

  const mockUnitService = {
    editStateVariables: vi.fn()
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

  /* The validation area opens the same editing, so what happens with its result lives in the unit service. */
  it('should leave the editing of the state variables to the unit service', () => {
    component.showStateVariablesDialog();
    expect(mockUnitService.editStateVariables).toHaveBeenCalled();
  });
});

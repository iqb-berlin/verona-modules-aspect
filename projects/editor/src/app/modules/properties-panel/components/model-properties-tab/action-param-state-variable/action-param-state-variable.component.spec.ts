import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { StateVariable } from 'common/models/state-variable';
import {
  ActionParamStateVariableComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-param-state-variable/action-param-state-variable.component';

describe('ActionParamStateVariableComponent', () => {
  let component: ActionParamStateVariableComponent;
  let fixture: ComponentFixture<ActionParamStateVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionParamStateVariableComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionParamStateVariableComponent);
    component = fixture.componentInstance;
    component.stateVariable = new StateVariable('sv1', 'SV1', 'a');
    component.stateVariables = [
      new StateVariable('sv1', 'SV1', 'a'),
      new StateVariable('sv2', 'SV2', 'b')
    ];
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render fields for id and value', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<HTMLElement>
    ).map(label => label.textContent);
    expect(labels.some(label => label?.includes('stateVariableId'))).toBe(true);
    expect(labels.some(label => label?.includes('stateVariableValue'))).toBe(true);
  });

  it('should emit the changed state variable when the value is edited', () => {
    const emitted: StateVariable[] = [];
    component.stateVariableChange.subscribe(stateVariable => emitted.push(stateVariable));

    const valueInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    valueInput.value = 'new value';
    valueInput.dispatchEvent(new Event('input'));

    expect(emitted.length).toBe(1);
    expect(emitted[0].value).toBe('new value');
    expect(component.stateVariable.value).toBe('new value');
  });
});

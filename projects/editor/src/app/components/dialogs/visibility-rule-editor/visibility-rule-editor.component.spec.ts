import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { VisibilityRule } from 'common/models/visibility-rule';
import {
  VisibilityRuleEditorComponent
} from 'editor/src/app/components/dialogs/visibility-rule-editor/visibility-rule-editor.component';

describe('VisibilityRuleEditorComponent', () => {
  let component: VisibilityRuleEditorComponent;
  let fixture: ComponentFixture<VisibilityRuleEditorComponent>;
  let emittedRules: VisibilityRule[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisibilityRuleEditorComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VisibilityRuleEditorComponent);
    component = fixture.componentInstance;
    component.controlIds = [
      { id: 'checkbox_1', alias: 'Kontrollkästchen' },
      { id: 'text-field_1', alias: 'Eingabefeld' }
    ];
    component.visibilityRule = { id: 'checkbox_1', operator: '=', value: 'true' };
    emittedRules = [];
    component.visibilityRuleChange.subscribe(rule => emittedRules.push(rule));
    fixture.detectChanges();
  });

  const getNgModels = (): NgModel[] => fixture.debugElement
    .queryAll(By.directive(NgModel))
    .map(debugElement => debugElement.injector.get(NgModel));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind the given rule to the three form fields', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-form-field').length).toBe(3);
    const [idModel, operatorModel, valueModel] = getNgModels();
    expect(idModel.value).toBe('checkbox_1');
    expect(operatorModel.value).toBe('=');
    expect(valueModel.value).toBe('true');
  });

  it('should emit the updated rule when the control id changes', () => {
    getNgModels()[0].viewToModelUpdate('text-field_1');

    expect(component.visibilityRule.id).toBe('text-field_1');
    expect(emittedRules).toEqual([component.visibilityRule]);
  });

  it('should emit the updated rule when the operator changes', () => {
    getNgModels()[1].viewToModelUpdate('minLength');

    expect(component.visibilityRule.operator).toBe('minLength');
    expect(emittedRules.length).toBe(1);
  });

  it('should emit the updated rule when the value changes', () => {
    const valueInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    valueInput.value = 'false';
    valueInput.dispatchEvent(new Event('input'));

    expect(component.visibilityRule.value).toBe('false');
    expect(emittedRules).toEqual([component.visibilityRule]);
  });

  it('should always emit the same rule object', () => {
    getNgModels()[0].viewToModelUpdate('text-field_1');

    expect(emittedRules[0]).toBe(component.visibilityRule);
  });
});

import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { vi } from 'vitest';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  MathTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/math-table-properties/math-table-properties.component';

describe('MathTablePropertiesComponent', () => {
  let component: MathTablePropertiesComponent;
  let fixture: ComponentFixture<MathTablePropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [MathTablePropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MathTablePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'math-table',
      operation: 'addition',
      terms: ['12', '34'],
      result: '',
      resultHelperRow: '',
      variableLayoutOptions: {
        allowArithmeticChars: false,
        isFirstLineUnderlined: false,
        showResultRow: true,
        showTopHelperRows: false,
        allowFirstLineCrossOut: false
      }
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an input for every term', () => {
    const termInputs = Array.from(
      fixture.nativeElement.querySelectorAll('.term-list input') as NodeListOf<HTMLInputElement>
    );
    expect(termInputs.map(input => input.value)).toEqual(['12', '34']);
  });

  it('should append an empty term', () => {
    component.addTerm();

    expect(emitted).toEqual([{ property: 'terms', value: ['12', '34', ''] }]);
  });

  it('should emit the changed term and refocus its input', fakeAsync(() => {
    const focusSpy = vi.spyOn(component.termInputs.toArray()[1].nativeElement as HTMLInputElement, 'focus');

    component.changeTerm('56', 1);
    tick();

    expect(emitted).toEqual([{ property: 'terms', value: ['12', '56'] }]);
    expect(focusSpy).toHaveBeenCalled();
  }));

  it('should remove a term', () => {
    component.removeTerm(0);

    expect(emitted).toEqual([{ property: 'terms', value: ['34'] }]);
  });

  it('should emit the selected operation', () => {
    const operationSelect = fixture.debugElement.query(By.css('mat-select'));
    operationSelect.triggerEventHandler('selectionChange', { value: 'multiplication' });

    expect(emitted).toEqual([{ property: 'operation', value: 'multiplication' }]);
  });

  it('should not allow more than two terms for multiplications', () => {
    component.combinedProperties = {
      type: 'math-table',
      operation: 'multiplication',
      terms: ['12', '34'],
      result: '',
      resultHelperRow: '',
      variableLayoutOptions: { allowArithmeticChars: false }
    };
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.add-button') as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);
  });
});

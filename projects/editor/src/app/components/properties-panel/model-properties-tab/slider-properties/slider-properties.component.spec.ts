import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  SliderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/slider-properties/slider-properties.component';

describe('SliderPropertiesComponent', () => {
  let component: SliderPropertiesComponent;
  let fixture: ComponentFixture<SliderPropertiesComponent>;
  let emitted: { property: string; value: unknown; isInputValid?: boolean | null }[];
  let unitServiceMock: { expertMode: boolean };

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [SliderPropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SliderPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      minValue: 0,
      maxValue: 100,
      showValues: true,
      barStyle: false,
      thumbLabel: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current min and max values', () => {
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.map(input => input.value)).toEqual(['0', '100']);
  });

  it('should emit the new maximum value', () => {
    const maxValueInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    )[1];
    maxValueInput.value = '50';
    maxValueInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'maxValue', value: 50, isInputValid: true }]);
  });

  it('should emit updateModel when a checkbox is toggled', () => {
    const barStyleInput = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[1];
    barStyleInput.click();

    expect(emitted).toEqual([{ property: 'barStyle', value: true }]);
  });

  it('should hide the expert mode checkboxes in simple mode', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('input[type="number"]').length).toBe(2);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  SliderPropertiesComponent
} from './slider-properties.component';

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
      thumbLabel: false,
      value: 42
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current min and max values and the preset', () => {
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.map(input => input.value)).toEqual(['0', '100', '42']);
  });

  // Moved here from element-model-properties: it is gated on minValue, so it is the slider's.
  it('should emit the entered preset together with its validity', () => {
    const presetInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    )[2];
    presetInput.value = '7';
    presetInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'value', value: 7, isInputValid: true }]);
  });

  it('should offer no preset for an element without a minValue', () => {
    component.combinedProperties = { value: 42 };
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('input[type="number"]').length).toBe(0);
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
    expect(fixture.nativeElement.querySelectorAll('input[type="number"]').length).toBe(3);
  });
});

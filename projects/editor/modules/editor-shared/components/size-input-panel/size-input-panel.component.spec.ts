import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Measurement } from 'common/models/ui-element-interfaces';
import { SizeInputPanelComponent } from './size-input-panel.component';

describe('SizeInputPanelComponent', () => {
  let component: SizeInputPanelComponent;
  let fixture: ComponentFixture<SizeInputPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SizeInputPanelComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SizeInputPanelComponent);
    component = fixture.componentInstance;
    component.label = 'Breite 1';
    component.value = 3;
    component.unit = 'fr';
    component.allowedUnits = ['px', 'fr'];
    component.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the given label', () => {
    expect(fixture.nativeElement.textContent).toContain('Breite 1');
  });

  it('should emit the combined measurement', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });

    component.emitMeasurement();

    expect(emitted).toEqual({ value: 3, unit: 'fr' });
  });

  /*
   * The case a merged measurement produces: the selected elements disagree, so the field is empty.
   * This used to substitute 0 and write it to all of them - a value the author never entered.
   */
  it('should write nothing while the value is missing', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.value = null;
    fixture.detectChanges();

    const unitSelect: HTMLElement = fixture.nativeElement.querySelector('mat-select');
    unitSelect.dispatchEvent(new Event('selectionChange'));
    component.emitMeasurement();

    expect(emitted).toBeUndefined();
    expect(component.value).toBeNull();
  });

  it('should write nothing while the unit is missing', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.unit = null;

    component.emitMeasurement();

    expect(emitted).toBeUndefined();
  });

  // A value entered into the empty field still reaches the whole selection.
  it('should emit once the missing value is entered', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.value = null;
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('change'));

    expect(emitted).toEqual({ value: 5, unit: 'fr' });
  });

  it('should emit the combined measurement when the number input changes', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => {
      emitted = measurement;
    });

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '7';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('change'));

    expect(emitted).toEqual({ value: 7, unit: 'fr' });
  });

  it('should disable the number input when the panel is disabled', async () => {
    component.disabled = true;
    fixture.detectChanges();
    // NgModel applies the disabled state in a microtask
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators
} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SliderElement, SliderProperties } from 'common/models/elements/slider';
import { IsDisabledDirective } from 'common/directives/is-disabled.directive';
import { SliderComponent } from './slider.component';

registerLocaleData(localeDe);

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SliderComponent,
        IsDisabledDirective
      ],
      imports: [
        ReactiveFormsModule,
        MatSliderModule,
        MatFormFieldModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    component.elementModel = new SliderElement({
      type: 'slider',
      id: 'test-id',
      alias: 'test-alias',
      minValue: 0,
      maxValue: 1000
    } as Partial<SliderProperties>);
    component.parentForm = new UntypedFormGroup({
      'test-id': new UntypedFormControl(0)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label only if it is set', () => {
    component.elementModel.label = '';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Test Label');
    component.elementModel.label = 'Test Label';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Label');
  });

  it('should display min and max value in German number format when showValues is set', () => {
    component.elementModel.showValues = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.min-value').textContent.trim()).toBe('0');
    expect(fixture.nativeElement.querySelector('.max-value').textContent.trim()).toBe('1.000');
  });

  it('should NOT display min and max value when showValues is not set', () => {
    component.elementModel.showValues = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.min-value')).toBeNull();
    expect(fixture.nativeElement.querySelector('.max-value')).toBeNull();
  });

  it('should render additional bar elements when barStyle is set', () => {
    component.elementModel.barStyle = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.arrow-line')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.arrow-head')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.value-marker').length).toBe(2);
  });

  it('should NOT render bar elements when barStyle is not set', () => {
    component.elementModel.barStyle = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.arrow-line')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.value-marker').length).toBe(0);
  });

  it('should display the required warn message when the control has errors', () => {
    component.elementModel.requiredWarnMessage = 'Bitte einen Wert einstellen';
    component.elementFormControl.setValidators(Validators.required);
    component.elementFormControl.setValue(null);
    component.elementFormControl.markAsTouched();
    component.elementFormControl.updateValueAndValidity();
    fixture.detectChanges();
    const errorElement = fixture.nativeElement.querySelector('mat-error');
    expect(errorElement.textContent).toContain('Bitte einen Wert einstellen');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  FirstColumnRatioPropertiesComponent
} from './first-column-ratio-properties.component';

describe('FirstColumnRatioPropertiesComponent', () => {
  let component: FirstColumnRatioPropertiesComponent;
  let fixture: ComponentFixture<FirstColumnRatioPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FirstColumnRatioPropertiesComponent],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FirstColumnRatioPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { firstColumnSizeRatio: 3 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the current ratio', () => {
    expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('3');
  });

  it('should emit the entered ratio', () => {
    const emitted: { property: string; value: number | string }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = '5';
    input.triggerEventHandler('input', { target: input.nativeElement });

    expect(emitted).toEqual([{ property: 'firstColumnSizeRatio', value: '5' }]);
  });

  // The panel offers the control only for elements that have the property at all.
  it('should render nothing when the property is absent', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('mat-form-field'))).toBeNull();
  });

  // A divergent multi selection merges to null, which must not be shown as a value.
  it('should render nothing when the selected elements disagree', () => {
    component.combinedProperties = { firstColumnSizeRatio: null };
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('mat-form-field'))).toBeNull();
  });
});

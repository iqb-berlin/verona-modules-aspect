import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Measurement } from 'common/models/ui-element-interfaces';
import { SizeInputPanelComponent } from 'editor/modules/editor-shared/components/size-input-panel/size-input-panel.component';

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

  it('should combine value and unit', () => {
    expect(component.getCombinedString()).toEqual({ value: 3, unit: 'fr' });
  });

  it('should fall back to zero for an empty value', () => {
    component.value = null as unknown as number;

    expect(component.getCombinedString()).toEqual({ value: 0, unit: 'fr' });
    expect(component.value).toBe(0);
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

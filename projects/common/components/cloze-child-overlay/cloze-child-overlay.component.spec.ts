import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ToggleButtonElement } from 'common/models/elements/toggle-button';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/text-field-simple';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import {
  TextFieldSimpleComponent
} from 'common/components/elements/text-field-simple/text-field-simple.component';
import { ClozeChildOverlayComponent } from './cloze-child-overlay.component';

describe('ClozeChildOverlayComponent', () => {
  let component: ClozeChildOverlayComponent;
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
    component = fixture.componentInstance;
    component.element = {
      type: 'toggle-button',
      dimensions: {
        width: 100, height: 20, isWidthFixed: true, isHeightFixed: true
      }
    } as ToggleButtonElement;
    component.parentForm = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected state', () => {
    component.setSelected(true);
    expect(component.isSelected).toBe(true);
    component.setSelected(false);
    expect(component.isSelected).toBe(false);
  });
});

describe('ClozeChildOverlayComponent with a text field', () => {
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent, TextFieldSimpleComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
    /* The line height of a cloze paragraph at its defaults (180% of 20px). It is taller than the input,
       which is what pushed a field out of a lower gap; at the browser's default nothing would. */
    (fixture.nativeElement as HTMLElement).style.lineHeight = '36px';
  });

  const renderField = (dimensions: Partial<DimensionProperties>): { box: DOMRect; input: DOMRect } => {
    const element = new TextFieldSimpleElement({
      type: 'text-field-simple',
      id: 'field',
      alias: 'field'
    } as Partial<TextFieldSimpleProperties>);
    element.dimensions = { ...element.dimensions, ...dimensions };
    fixture.componentInstance.element = element;
    fixture.componentInstance.parentForm = new UntypedFormGroup({ field: new UntypedFormControl('') });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return {
      box: (host.querySelector('.gap-box') as HTMLElement).getBoundingClientRect(),
      input: (host.querySelector('input') as HTMLElement).getBoundingClientRect()
    };
  };

  /* One height below and one above the height an <input> gives itself, so a field that keeps its own
     height fails either way (#1619). */
  it.each([20, 50])('should make the input fill a gap fixed at %ipx', height => {
    const { box, input } = renderField({ isHeightFixed: true, height });

    expect(input.height).toBe(height);
    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });

  it('should make the input fill its gap when the height is not fixed', () => {
    const { box, input } = renderField({ isHeightFixed: false });

    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });

  it.each<{ label: string; limit: Partial<DimensionProperties>; height: number }>([
    { label: 'minimum', limit: { minHeight: 50 }, height: 50 },
    { label: 'maximum', limit: { maxHeight: 20 }, height: 20 }
  ])('should make the input as tall as a $label height of $height px', ({ limit, height }) => {
    const { box, input } = renderField({ isHeightFixed: false, ...limit });

    expect(input.height).toBe(height);
    expect(input.top).toBe(box.top);
    expect(input.bottom).toBe(box.bottom);
  });
});

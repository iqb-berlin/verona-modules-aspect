import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SimpleChange } from '@angular/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';

/**
 * The component is driven directly rather than through a test host: the AOT compiler cannot resolve
 * a `standalone: false` component inside a spec's inline template. Label projection is therefore
 * covered where it matters — the panel's characterization baseline reads the rendered label text.
 */
describe('MergedCheckboxComponent', () => {
  let component: MergedCheckboxComponent;
  let fixture: ComponentFixture<MergedCheckboxComponent>;
  let emitted: boolean[];

  const checkbox = (): HTMLInputElement => fixture.nativeElement.querySelector('mat-checkbox input');

  /**
   * ngOnChanges is not run for inputs set directly on the instance, so it is called explicitly —
   * with the change record Angular would pass, because the hook acts only on a changed `value`.
   */
  const setValue = (value: boolean | null | undefined): void => {
    const previousValue = component.value;
    component.value = value;
    component.ngOnChanges({ value: new SimpleChange(previousValue, value, false) });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MergedCheckboxComponent],
      imports: [MatCheckboxModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MergedCheckboxComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.valueChange.subscribe(value => emitted.push(value));
  });

  it('should create', () => {
    setValue(false);

    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeTruthy();
  });

  it('should be unchecked for false', () => {
    setValue(false);

    expect(checkbox().checked).toBe(false);
    expect(checkbox().indeterminate).toBe(false);
  });

  it('should be checked for true', () => {
    setValue(true);

    expect(checkbox().checked).toBe(true);
    expect(checkbox().indeterminate).toBe(false);
  });

  // The case this component exists for: null means the selected elements disagree.
  it('should be indeterminate for null', () => {
    setValue(null);

    expect(checkbox().indeterminate).toBe(true);
  });

  it('should be unchecked and not indeterminate for undefined', () => {
    setValue(undefined);

    expect(checkbox().checked).toBe(false);
    expect(checkbox().indeterminate).toBe(false);
  });

  it('should emit true when an unchecked box is clicked', () => {
    setValue(false);

    checkbox().click();

    expect(emitted).toEqual([true]);
  });

  it('should emit false when a checked box is clicked', () => {
    setValue(true);

    checkbox().click();

    expect(emitted).toEqual([false]);
  });

  // Same as a plain checkbox did before: clicking a mixed selection turns it on everywhere, so
  // only the display changes, not what a click does.
  it('should emit true when an indeterminate box is clicked', () => {
    setValue(null);

    checkbox().click();

    expect(emitted).toEqual([true]);
  });

  it('should not emit while disabled', () => {
    component.disabled = true;
    setValue(null);

    expect(checkbox().disabled).toBe(true);

    checkbox().click();

    expect(emitted).toEqual([]);
  });

  // Call sites read this through a template reference (#fixedWidth and friends) and expect the
  // same thing a mat-checkbox gave them.
  it('should expose the live state for template references', () => {
    setValue(null);

    expect(component.checked).toBe(false);
    expect(component.indeterminate).toBe(true);

    checkbox().click();

    expect(component.checked).toBe(true);
    expect(component.indeterminate).toBe(false);
  });

  // ngOnChanges fires for every input, and many call sites bind `disabled` to a sibling property.
  // Re-deriving the state there would revert a click whose write is still on its way.
  it('should keep the live state when an input other than value changes', () => {
    setValue(null);
    checkbox().click();

    component.disabled = true;
    component.ngOnChanges({ disabled: new SimpleChange(false, true, false) });
    fixture.detectChanges();

    expect(component.checked).toBe(true);
    expect(component.indeterminate).toBe(false);
    expect(checkbox().checked).toBe(true);
  });
});

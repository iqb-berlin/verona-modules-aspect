import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';

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
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeTruthy();
  });

  it('should be unchecked for false', () => {
    component.value = false;
    fixture.detectChanges();

    expect(checkbox().checked).toBe(false);
    expect(checkbox().indeterminate).toBe(false);
  });

  it('should be checked for true', () => {
    component.value = true;
    fixture.detectChanges();

    expect(checkbox().checked).toBe(true);
    expect(checkbox().indeterminate).toBe(false);
  });

  // The case this component exists for: null means the selected elements disagree.
  it('should be indeterminate for null', () => {
    component.value = null;
    fixture.detectChanges();

    expect(checkbox().indeterminate).toBe(true);
  });

  it('should be unchecked and not indeterminate for undefined', () => {
    component.value = undefined;
    fixture.detectChanges();

    expect(checkbox().checked).toBe(false);
    expect(checkbox().indeterminate).toBe(false);
  });

  it('should emit true when an unchecked box is clicked', () => {
    component.value = false;
    fixture.detectChanges();

    checkbox().click();

    expect(emitted).toEqual([true]);
  });

  it('should emit false when a checked box is clicked', () => {
    component.value = true;
    fixture.detectChanges();

    checkbox().click();

    expect(emitted).toEqual([false]);
  });

  // Same as a plain checkbox did before: clicking a mixed selection turns it on everywhere, so
  // only the display changes, not what a click does.
  it('should emit true when an indeterminate box is clicked', () => {
    component.value = null;
    fixture.detectChanges();

    checkbox().click();

    expect(emitted).toEqual([true]);
  });

  it('should not emit while disabled', () => {
    component.value = null;
    component.disabled = true;
    fixture.detectChanges();

    expect(checkbox().disabled).toBe(true);

    checkbox().click();

    expect(emitted).toEqual([]);
  });
});

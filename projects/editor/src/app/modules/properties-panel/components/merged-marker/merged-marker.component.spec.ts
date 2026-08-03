import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MergedMarkerComponent } from './merged-marker.component';

/**
 * Whether the marker is shown is the call site's decision (see the component's doc comment), so
 * what is left here is what it looks like when it is - and the one part of that which is easy to
 * get wrong.
 */
describe('MergedMarkerComponent', () => {
  let fixture: ComponentFixture<MergedMarkerComponent>;

  const icon = (): HTMLElement => fixture.nativeElement.querySelector('mat-icon') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MergedMarkerComponent],
      imports: [MatIconModule, MatTooltipModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MergedMarkerComponent);
    fixture.detectChanges();
  });

  it('should draw the dash an indeterminate checkbox uses', () => {
    expect(icon()).not.toBeNull();
    expect(icon().textContent?.trim()).toBe('remove');
  });

  /* The part that was wrong once and is invisible in every other test: MatIcon marks itself
     `aria-hidden="true"` unless the element carries one, and a bound `[attr.aria-hidden]` is too
     late. The label is then on an element no screen reader reports, so the marker exists for the
     eye alone - which is exactly what the tooltip already fails at. */
  it('should be reported to a screen reader rather than hidden from it', () => {
    expect(icon().getAttribute('aria-hidden')).toBe('false');
    // With no translations loaded the pipe yields the key.
    expect(icon().getAttribute('aria-label')).toBe('propertiesPanel.valuesDiffer');
  });

  it('should explain itself on hover as well', () => {
    expect(icon().classList).toContain('mat-mdc-tooltip-trigger');
  });
});

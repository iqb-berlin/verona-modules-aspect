import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MergedMarkerComponent } from './merged-marker.component';

describe('MergedMarkerComponent', () => {
  let component: MergedMarkerComponent;
  let fixture: ComponentFixture<MergedMarkerComponent>;

  const marker = (): HTMLElement | null => fixture.nativeElement.querySelector('mat-icon');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MergedMarkerComponent],
      imports: [MatIconModule, MatTooltipModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MergedMarkerComponent);
    component = fixture.componentInstance;
  });

  /* `null` is what the merge produces for "the selected elements disagree". It is the only state
     this marks - see the two cases below for what it must stay quiet about. */
  it('should mark a value the selection disagrees about', () => {
    component.value = null;
    fixture.detectChanges();

    expect(marker()).not.toBeNull();
  });

  it('should stay away where the selection agrees', () => {
    component.value = 42;
    fixture.detectChanges();

    expect(marker()).toBeNull();
  });

  /* A value that is falsy but shared: 0 is a width every selected element has, and marking it would
     claim a disagreement that is not there. */
  it('should stay away for a shared zero and a shared empty string', () => {
    component.value = 0;
    fixture.detectChanges();
    expect(marker()).toBeNull();

    component.value = '';
    fixture.detectChanges();
    expect(marker()).toBeNull();
  });

  /* `undefined` means the property is not part of the selection at all - such a field is not
     rendered in the first place, and it is not a disagreement. */
  it('should stay away for a property the selection does not have', () => {
    component.value = undefined;
    fixture.detectChanges();

    expect(marker()).toBeNull();
  });

  /* The tooltip never reaches a screen reader on its own, so the same text is on the element. */
  it('should carry the explanation for a screen reader too', () => {
    component.value = null;
    fixture.detectChanges();

    // With no translations loaded the pipe yields the key.
    expect(marker()?.getAttribute('aria-label')).toBe('propertiesPanel.valuesDiffer');
  });
});

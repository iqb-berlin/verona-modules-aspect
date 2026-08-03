import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  FirstColumnRatioPropertiesComponent
} from './first-column-ratio-properties.component';

describe('FirstColumnRatioPropertiesComponent', () => {
  let component: FirstColumnRatioPropertiesComponent;
  let fixture: ComponentFixture<FirstColumnRatioPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FirstColumnRatioPropertiesComponent, NumberFieldDirective, NumberFieldBadInputDirective,
        MergedMarkerComponent
      ],
      imports: [
        MatIconModule,
        FormsModule,
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

  /* `firstColumnSizeRatio` is declared `number`, and the box used to hand on `field.value` - the
     raw string - so the unit definition ended up with "5" where a 5 belongs (#1164). */
  it('should emit the entered ratio as a number', () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = '5';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toEqual([{ property: 'firstColumnSizeRatio', value: 5, isInputValid: true }]);
  });

  /* And `|| 0` turned every keystroke that left the box unreadable into a 0 - the first press of
     a minus sign, or clearing it to retype. It is refused on leaving now, and the box goes back. */
  it('should refuse an emptied ratio and put the box back', async () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = '';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toEqual([]);

    input.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'firstColumnSizeRatio', value: null, isInputValid: false }]);
    expect(input.nativeElement.value).toBe('3');
  });

  // The panel offers the control only for elements that have the property at all.
  it('should render nothing when the property is absent', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('mat-form-field'))).toBeNull();
  });

  /* A divergent multi selection merges to null. The field used to disappear for that, because its
     guard was `!= null` and so caught the merge's null along with the "not this element type"
     undefined - the author could not edit the ratio for such a selection at all. It is offered
     now, empty and marked; the null must still not be shown as a value (#1138). */
  it('should offer the field, empty and marked, when the selected elements disagree', async () => {
    component.combinedProperties = { firstColumnSizeRatio: null };
    fixture.detectChanges();
    await fixture.whenStable(); // NgModel writes the box in a microtask

    expect(fixture.debugElement.query(By.css('mat-form-field'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('');
    expect(fixture.nativeElement.querySelector('aspect-merged-marker mat-icon')).not.toBeNull();
  });

  /* And the other half of what the old guard did, which has to keep working: a property this
     element type does not have at all is `undefined`, and then there is no field. */
  it('should render nothing for an element without the property', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('mat-form-field'))).toBeNull();
  });

  /* The ratio ends up in `grid-template-columns: Nfr 1fr`, so a 0 collapses the label column and a
     negative one is not a length at all. Nothing enforced that before (#1164). */
  it('should refuse a ratio below one', async () => {
    const emitted: { property: string; value: unknown; isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = '0';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual([{ property: 'firstColumnSizeRatio', value: 0, isInputValid: false }]);
    expect(input.nativeElement.value).toBe('3');
  });
});

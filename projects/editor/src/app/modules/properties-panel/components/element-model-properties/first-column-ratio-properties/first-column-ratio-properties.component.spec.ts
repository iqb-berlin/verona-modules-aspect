import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  FirstColumnRatioPropertiesComponent
} from './first-column-ratio-properties.component';

describe('FirstColumnRatioPropertiesComponent', () => {
  let component: FirstColumnRatioPropertiesComponent;
  let fixture: ComponentFixture<FirstColumnRatioPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FirstColumnRatioPropertiesComponent, NumberFieldDirective, NumberFieldBadInputDirective
      ],
      imports: [
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

  // A divergent multi selection merges to null, which must not be shown as a value.
  it('should render nothing when the selected elements disagree', () => {
    component.combinedProperties = { firstColumnSizeRatio: null };
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

// eslint-disable-next-line max-classes-per-file
import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NumberFieldModule } from './number-field.module';

/**
 * A host rather than a bare directive instance: what is being tested is the interplay of the
 * template binding, `NgModel` and the browser's number input - none of which a direct call sees.
 *
 * `required` is what marks a box whose property is declared `number`, i.e. where an empty box is
 * refused rather than written. It is the everyday case, so it is the main host here.
 */
@Component({
  standalone: false,
  template: `
    <input type="number" min="0" required aspectNumberField
           [ngModel]="value"
           (numberChange)="emitted.push($event)">
  `
})
class HostComponent {
  value: number | null = 10;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* A second host without `min`, for the fields that legitimately take negative values - the z-index
   and the slider bounds. It has to be its own component: `MinValidator` reads its input, so taking
   the attribute off the element at runtime would not reach it. */
@Component({
  standalone: false,
  template: `
    <input type="number" required aspectNumberField
           [ngModel]="value"
           (numberChange)="emitted.push($event)">
  `
})
class UnboundedHostComponent {
  value: number | null = 3;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* And a third without `required`, for the `number | null` properties - minLength, the slider
   preset, maxWidth - where an empty box is the legitimate "no limit" and has to reach the model:
   without it a limit once set could never be taken off again. */
@Component({
  standalone: false,
  template: `
    <input type="number" min="0" aspectNumberField
           [ngModel]="value"
           (numberChange)="emitted.push($event)">
  `
})
class OptionalHostComponent {
  value: number | null = 50;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* The misuse the selector cannot rule out. Two-way binding writes the refused value into the
   caller before the directive gets to refuse it, so the directive rejects the call site itself. */
@Component({
  standalone: false,
  template: '<input type="number" required aspectNumberField [(ngModel)]="value">'
})
class TwoWayHostComponent {
  value: number | null = 10;
}

/* Declaring the hosts through a module rather than through `TestBed.declarations`: the AOT compiler
   resolves an inline template against the NgModule the component belongs to, and a component that
   belongs to none knows neither `ngModel` nor the directive under test. The directive itself is
   pulled in through its own module - declaring it here as well would make it part of two modules. */
@NgModule({
  declarations: [HostComponent, UnboundedHostComponent, OptionalHostComponent, TwoWayHostComponent],
  imports: [FormsModule, NumberFieldModule]
})
class TestHostModule {}

describe('NumberFieldDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const field = (): HTMLInputElement => fixture.nativeElement.querySelector('input') as HTMLInputElement;

  /** One keystroke: set what the browser would report and let the accessor pick it up. */
  const type = (value: string): void => {
    field().value = value;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const leave = async (): Promise<void> => {
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should emit a typed value together with its validity', () => {
    type('42');

    expect(host.emitted).toEqual([{ value: 42, isInputValid: true }]);
  });

  /* The states a number input passes through while being typed - an empty box, or a lone "-" the
     browser cannot parse - are reported as null by the accessor. Emitting then means the value is
     written and comes straight back into the box, over what is being typed. */
  it('should stay silent while the box cannot be parsed', () => {
    type(''); // first keystroke of "-2"

    expect(host.emitted).toEqual([]);
  });

  /* The regression that made the empty box wait for the end of the edit in the first place: the
     z-index of a frame defaults to -1, and answering for the empty box on the keystroke that leaves
     it unparsable turned a typed `-2` into `2`. */
  it('should let a negative value be typed where nothing forbids it', async () => {
    const unbounded = TestBed.createComponent(UnboundedHostComponent);
    unbounded.detectChanges();
    await unbounded.whenStable();
    const box = unbounded.nativeElement.querySelector('input') as HTMLInputElement;

    box.value = ''; // first keystroke of "-2": a lone "-" reads as empty
    box.dispatchEvent(new Event('input'));
    unbounded.detectChanges();
    box.value = '-2';
    box.dispatchEvent(new Event('input'));
    unbounded.detectChanges();

    expect(unbounded.componentInstance.emitted).toEqual([{ value: -2, isInputValid: true }]);
    expect(box.value).toBe('-2');
  });

  it('should refuse a call site that binds two-way', () => {
    const twoWay = TestBed.createComponent(TwoWayHostComponent);

    expect(() => twoWay.detectChanges()).toThrowError(/one-way/);
  });

  describe('leaving the field', () => {
    /* The point of #1161: an empty box is not a number and is refused like any other invalid entry,
       rather than standing in for a 0 the user never typed. */
    it('should refuse an emptied box and put it back', async () => {
      type('');
      expect(host.emitted).toEqual([]);

      await leave();

      expect(host.emitted).toEqual([{ value: null, isInputValid: false }]);
      expect(field().value).toBe('10');
    });

    /* `number | null` properties, where empty says "no limit". It must still be reported: without
       it a limit once set could never be cleared, because nothing else tells anyone about the
       empty box. */
    it('should report null where the box may be empty', async () => {
      const optional = TestBed.createComponent(OptionalHostComponent);
      optional.detectChanges();
      await optional.whenStable();
      const box = optional.nativeElement.querySelector('input') as HTMLInputElement;

      box.value = '';
      box.dispatchEvent(new Event('input'));
      optional.detectChanges();
      expect(optional.componentInstance.emitted).toEqual([]); // still mid-edit

      box.dispatchEvent(new Event('blur'));
      optional.detectChanges();
      await optional.whenStable();

      expect(optional.componentInstance.emitted).toEqual([{ value: null, isInputValid: true }]);
      expect(box.value).toBe('');
    });

    /* `min="0"` makes -5 invalid. Nothing is emitted while it is typed, the refusal is reported
       once so the caller can warn, and the box goes back to what the model holds. */
    it('should report a refused value once and put the box back', async () => {
      type('-5');
      type('-50');
      expect(host.emitted).toEqual([]);

      await leave();

      expect(host.emitted).toEqual([{ value: -50, isInputValid: false }]);
      expect(field().value).toBe('10');
    });

    /* Why this listens on `blur` and not on `change`. A `change` event is only fired when the value
       at blur differs from the value at focus, so an edit that ends where it started is never
       reported - typing a number into an empty box and clearing it again left the number in the
       model with an empty box on top of it. Measured in a real browser; the dispatched events
       below cannot tell the two apart on their own. */
    it('should answer for an edit that ends where it started', async () => {
      host.value = null; // nothing set yet, so the box starts empty
      fixture.detectChanges();
      await fixture.whenStable();

      type('50');
      expect(host.emitted).toEqual([{ value: 50, isInputValid: true }]);
      type('');

      await leave();

      expect(host.emitted).toEqual([
        { value: 50, isInputValid: true },
        { value: null, isInputValid: false }
      ]);
    });

    /* Putting the box back writes to the control, which would otherwise look like the user typing.
       This pins the observable effect, not the mechanism: two things prevent the re-emit, the
       `emitViewToModelChange: false` flag and the validity guard, and the guard alone is enough
       (see the note in the directive). Removing the flag therefore does not turn this red. */
    it('should not emit the model value it puts back', async () => {
      type('-5');
      await leave();

      expect(host.emitted.filter(update => update.isInputValid)).toEqual([]);
    });

    /* Writing the box back must not leave `NgModel.viewModel` behind. `ngOnChanges` decides whether
       to redraw by comparing the incoming value against `viewModel`, so a stale one silently
       swallows a later binding change that happens to equal it.

       The path: clear a width that reads 0 and leave - the entry is refused and the 0 goes back
       into the box - then add an element of a different width to the selection. The merge answers
       null for "the selection disagrees", `viewModel` is still the null from typing, and without
       the fix the box goes on showing 0 - ready to write that 0 onto both elements. */
    it('should follow the binding after a write-back', async () => {
      host.value = 0;
      fixture.detectChanges();
      await fixture.whenStable();

      type('');
      await leave();
      expect(field().value).toBe('0');

      host.value = null; // a second element joins the selection and the widths disagree
      fixture.detectChanges();
      await fixture.whenStable();

      expect(field().value).toBe('');
    });

    /* `blur` fires whether or not anything was typed, so what tells an edit from tabbing through is
       the control being dirty. Without it, every field bound to a property the selection has no
       common value for would warn on the way past. */
    it('should stay silent for a box that was only tabbed through', async () => {
      host.value = null; // a box that is empty of its own accord, i.e. invalid
      fixture.detectChanges();
      await fixture.whenStable();

      await leave();

      expect(host.emitted).toEqual([]);
    });

    /* And the other half of that: the marker has to be cleared again, or leaving the field a second
       time would answer for the first edit once more. */
    it('should answer for an edit once, not on every later blur', async () => {
      type('-5');
      await leave();
      host.emitted.length = 0;

      await leave();

      expect(host.emitted).toEqual([]);
    });

    it('should not emit for a box that holds a value', async () => {
      type('7');
      host.emitted.length = 0;

      await leave();

      expect(host.emitted).toEqual([]);
    });
  });
});

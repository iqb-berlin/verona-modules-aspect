// eslint-disable-next-line max-classes-per-file
import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NumberFieldModule } from './number-field.module';

/**
 * A host rather than a bare directive instance: what is being tested is the interplay of the
 * template binding, `NgModel` and the browser's number input - none of which a direct call sees.
 */
@Component({
  standalone: false,
  template: `
    <input type="number" min="0" aspectNumberField
           [ngModel]="value"
           [emptyValue]="emptyValue"
           (numberChange)="emitted.push($event)">
  `
})
class HostComponent {
  value: number | null = 10;
  emptyValue: number | null = 0;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* A second host without `min`, for the fields that legitimately take negative values - the z-index
   and the slider bounds. It has to be its own component: `MinValidator` reads its input, so taking
   the attribute off the element at runtime would not reach it. */
@Component({
  standalone: false,
  template: `
    <input type="number" aspectNumberField [emptyValue]="0"
           [ngModel]="value"
           (numberChange)="emitted.push($event)">
  `
})
class UnboundedHostComponent {
  value: number | null = 3;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* Declaring the host through a module rather than through `TestBed.declarations`: the AOT compiler
   resolves an inline template against the NgModule the component belongs to, and a component that
   belongs to none knows neither `ngModel` nor the directive under test. */
@NgModule({
  declarations: [HostComponent, UnboundedHostComponent],
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
    field().dispatchEvent(new Event('change'));
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

  /* The regression that made the zero move to commit time in the first place: the z-index of a
     frame defaults to -1, and writing a 0 on the keystroke that leaves the box unparsable turned a
     typed `-2` into `2`. */
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

  describe('leaving the field', () => {
    it('should emit the substitute for an emptied box', async () => {
      type('');
      expect(host.emitted).toEqual([]);

      await leave();

      expect(host.emitted).toEqual([{ value: 0, isInputValid: true }]);
    });

    /* `number | null` properties - minLength, the slider preset, maxWidth - where an empty box is
       the legitimate "no limit". It must not become a 0, but it must still be sent: without it a
       limit once set could never be cleared, because nothing else reports the empty box. */
    it('should send null where that is what empty stands for', async () => {
      host.emptyValue = null;
      fixture.detectChanges();

      type('');
      expect(host.emitted).toEqual([]); // still mid-edit

      await leave();

      expect(host.emitted).toEqual([{ value: null, isInputValid: true }]);
      expect(field().value).toBe('');
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

    /* Putting the box back writes to the control, which would otherwise look like the user typing.
       This pins the observable effect, not the mechanism: two things prevent the re-emit, the
       `emitViewToModelChange: false` flag and the validity guard, and the guard alone is enough
       (see the note in the directive). Removing the flag therefore does not turn this red. */
    it('should not emit the model value it puts back', async () => {
      type('-5');
      await leave();

      expect(host.emitted.filter(update => update.isInputValid)).toEqual([]);
    });

    /* Emitting the substitute is not enough to make it appear. If the model already holds it, the
       bound expression does not change, `ngOnChanges` never fires, and the box would stay empty
       over a property that reads 0 - an x position at 0 is the everyday case. Same mechanism as
       the browser's bad input, where `1e` leaves `value` empty while the text stays on screen. */
    it('should put the substitute into the box, not only into the emit', async () => {
      host.value = 0;
      fixture.detectChanges();
      await fixture.whenStable();
      expect(field().value).toBe('0');

      type('');
      await leave();

      expect(host.emitted).toEqual([{ value: 0, isInputValid: true }]);
      expect(field().value).toBe('0');
    });

    /* Writing the box back must not leave `NgModel.viewModel` behind. `ngOnChanges` decides whether
       to redraw by comparing the incoming value against `viewModel`, so a stale one silently
       swallows a later binding change that happens to equal it.

       The path: clear a width that already reads 0 and leave, then add an element of a different
       width to the selection. The merge answers null for "the selection disagrees", `viewModel` is
       still the null from typing, and without the fix the box goes on showing 0 - ready to write
       that 0 onto both elements. */
    it('should follow the binding after a write-back', async () => {
      host.value = 0;
      fixture.detectChanges();
      await fixture.whenStable();

      type('');
      await leave();

      host.value = null; // a second element joins the selection and the widths disagree
      fixture.detectChanges();
      await fixture.whenStable();

      expect(field().value).toBe('');
    });

    /* Not every empty box means 0 or null. A grid range counts a span, and the consumers render
       `grid-row: N / (N + range)` - a stored 0 collapses to `auto`, so the layout would show 1
       while the unit definition claims 0. */
    it('should send whatever the caller says empty stands for', async () => {
      host.emptyValue = 1;
      fixture.detectChanges();

      type('');
      await leave();

      expect(host.emitted).toEqual([{ value: 1, isInputValid: true }]);
    });

    it('should not emit for a box that holds a value', async () => {
      type('7');
      host.emitted.length = 0;

      await leave();

      expect(host.emitted).toEqual([]);
    });
  });
});

// eslint-disable-next-line max-classes-per-file
import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { userEvent } from 'vitest/browser';
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
           (numberChange)="emitted.push($event)"
           (numberCommit)="commits = commits + 1">
  `
})
class HostComponent {
  value: number | null = 10;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
  commits: number = 0;
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

/* And one inside a `mat-form-field`, which is where `required` becomes visible: the asterisk on the
   label and the red invalid state. */
@Component({
  standalone: false,
  template: `
    <mat-form-field>
      <mat-label>Breite</mat-label>
      <input matInput type="number" min="0" required aspectNumberField [ngModel]="value">
    </mat-form-field>
  `
})
class FormFieldHostComponent {
  value: number | null = null;
}

/* And one for real typing and real focus changes, which needs somewhere to move the focus to. */
@Component({
  standalone: false,
  template: `
    <input id="box" type="number" min="0" required aspectNumberField
           [ngModel]="value"
           (numberChange)="emitted.push($event)">
    <input id="other" type="text">
  `
})
class RealInputHostComponent {
  value: number | null = null;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* The same without `required`, for what the browser cannot read: only a box that may legitimately
   be empty can mistake bad input for a clearing, and only real typing produces bad input at all.
   In a `mat-form-field`, because whether an unreadable entry looks refused is half the question. */
@Component({
  standalone: false,
  template: `
    <mat-form-field>
      <input id="box" matInput type="number" min="0" aspectNumberField
             [ngModel]="value"
             (numberChange)="emitted.push($event)">
    </mat-form-field>
    <input id="other" type="text">
  `
})
class OptionalRealInputHostComponent {
  value: number | null = 300;
  emitted: { value: number | null; isInputValid: boolean }[] = [];
}

/* Declaring the hosts through a module rather than through `TestBed.declarations`: the AOT compiler
   resolves an inline template against the NgModule the component belongs to, and a component that
   belongs to none knows neither `ngModel` nor the directive under test. The directive itself is
   pulled in through its own module - declaring it here as well would make it part of two modules. */
@NgModule({
  declarations: [
    HostComponent, UnboundedHostComponent, OptionalHostComponent, TwoWayHostComponent,
    RealInputHostComponent, OptionalRealInputHostComponent, FormFieldHostComponent
  ],
  imports: [FormsModule, MatFormFieldModule, MatInputModule, NumberFieldModule]
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
  /** The other way an edit ends: confirmed where it stands, with the focus staying put. */
  const confirm = async (): Promise<void> => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
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

  /* While developing, which is where a test runs: the built editor logs the same message instead,
     so a template that slipped through does not take the panel down with it. That branch is not
     covered here - `enableProdMode()` cannot be undone, so calling it would settle the question for
     every test that follows in the same run. */
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

  /* The fields that hold an entry back until the edit is over ask for `numberCommit` to tell them
     when that is. The arrows on the field are the case that was missing: Firefox does not move the
     focus into the box when they are clicked, so nothing that waits for a blur ever happens (#1433). */
  describe('committing an entry', () => {
    /** What the browser sends for a click on the field's own arrows: no focus, no blur. */
    const step = (value: string): void => {
      field().value = value;
      field().dispatchEvent(new Event('input'));
      field().dispatchEvent(new Event('change'));
      fixture.detectChanges();
    };

    /* Real time rather than `tick`, and deliberately: zone.js hands a DOM event to the zone its
       listener was REGISTERED in, which for a field built in `beforeEach` is not the fake one -- the
       waiting is then scheduled in real time and `tick` never reaches it. The two waits below are the
       shortest that clear the 300 ms. */
    const afterTheWait = (): Promise<void> => new Promise(resolve => { setTimeout(resolve, 400); });
    const shorterThanTheWait = (): Promise<void> => new Promise(resolve => { setTimeout(resolve, 100); });

    it('should commit a value stepped with the arrows, without a blur', async () => {
      step('11');
      await afterTheWait();

      expect(host.emitted).toEqual([{ value: 11, isInputValid: true }]);
      expect(host.commits).toBe(1);
    });

    /* Four clicks from 2 to 6 are one edit. Committing each step on the way would apply every
       number in between, and where the number is a count that means the sizes below it are cut and
       refilled with defaults on the way back up (#1164). */
    it('should treat a run of steps as a single edit', async () => {
      step('11');
      await shorterThanTheWait();
      step('12');
      await shorterThanTheWait();
      step('13');
      await afterTheWait();

      expect(host.commits).toBe(1);
    });

    it('should commit an entry that is confirmed by leaving the field', async () => {
      type('42');
      await leave();

      expect(host.commits).toBe(1);
    });

    it('should commit an entry confirmed with Enter', async () => {
      type('42');
      await confirm();

      expect(host.commits).toBe(1);
    });

    // A refused entry has been put back; there is nothing for the caller to write.
    it('should not commit an entry that is refused', async () => {
      type('-5');
      await leave();

      expect(host.emitted).toEqual([{ value: -5, isInputValid: false }]);
      expect(host.commits).toBe(0);
    });

    /* The browser says `change` when a box that was typed in is left, empty or not. An empty one is
       answered for in `settle`, on the blur right after, and must not be committed before that. */
    it('should not commit an emptied box', async () => {
      type('');
      field().dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await afterTheWait();

      expect(host.commits).toBe(0);

      await leave();

      expect(host.commits).toBe(0);
    });

    it('should stay silent for a box that was only tabbed through', async () => {
      await leave();

      expect(host.commits).toBe(0);
    });
  });

  /* The second way an edit ends. The call sites write their pending entry on Enter as well, so a
     refusal answered for on `blur` alone was skipped entirely: a number typed and deleted again was
     written when Enter followed, while the same keystrokes ending in a `blur` were refused (#1169). */
  describe('confirming with Enter', () => {
    it('should refuse an emptied box and put it back', async () => {
      type('5');
      type('');

      await confirm();

      expect(host.emitted).toEqual([
        { value: 5, isInputValid: true },
        { value: null, isInputValid: false }
      ]);
      expect(field().value).toBe('10');
    });

    it('should report a refused value and put the box back', async () => {
      type('-5');

      await confirm();

      expect(host.emitted).toEqual([{ value: -5, isInputValid: false }]);
      expect(field().value).toBe('10');
    });

    it('should report null where the box may be empty', async () => {
      const optional = TestBed.createComponent(OptionalHostComponent);
      optional.detectChanges();
      await optional.whenStable();
      const box = optional.nativeElement.querySelector('input') as HTMLInputElement;

      box.value = '';
      box.dispatchEvent(new Event('input'));
      optional.detectChanges();
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      optional.detectChanges();
      await optional.whenStable();

      expect(optional.componentInstance.emitted).toEqual([{ value: null, isInputValid: true }]);
      expect(box.value).toBe('');
    });

    /* Enter answers for the edit, so the blur that follows finds nothing left - otherwise a refusal
       confirmed with Enter would be reported again when the focus moves on, and the call site would
       warn twice for one entry. */
    it('should answer for an edit once, not again when the field is then left', async () => {
      type('-5');
      await confirm();
      host.emitted.length = 0;

      await leave();

      expect(host.emitted).toEqual([]);
    });

    /* Enter in a box nobody typed in is a confirmation of what is already there - most often the
       Enter that closes a dialog. Answering for it would warn at every box the selection has no
       common value for. */
    it('should stay silent for a box that was not typed in', async () => {
      host.value = null; // empty of its own accord, i.e. invalid
      fixture.detectChanges();
      await fixture.whenStable();

      await confirm();

      expect(host.emitted).toEqual([]);
    });

    it('should not emit for a box that holds a value', async () => {
      type('7');
      host.emitted.length = 0;

      await confirm();

      expect(host.emitted).toEqual([]);
    });

    /* And with a real keypress in a real browser, which is what the call sites see. */
    it('should refuse an emptied box on a real Enter', async () => {
      const real = TestBed.createComponent(RealInputHostComponent);
      real.componentInstance.value = 10;
      real.detectChanges();
      await real.whenStable();
      const box = real.nativeElement.querySelector('#box') as HTMLInputElement;

      await userEvent.click(box);
      await userEvent.type(box, '5');
      await userEvent.clear(box);
      await userEvent.keyboard('{Enter}');
      real.detectChanges();
      await real.whenStable();

      expect(real.componentInstance.emitted.at(-1)).toEqual({ value: null, isInputValid: false });
      expect(box.value).toBe('10');
    });
  });

  /* Everything above dispatches its own events, and a dispatched `change` fires whether or not the
     value moved - so those tests cannot tell the two events apart, whichever one the directive
     listens on. These three drive the browser instead, with real keystrokes and a real focus
     change, and the first is the one that decided the question: it passes as written and fails
     with the listener put back on `change`. */
  describe('with real typing and real focus changes', () => {
    let real: ComponentFixture<RealInputHostComponent>;

    const box = (): HTMLInputElement => real.nativeElement.querySelector('#box') as HTMLInputElement;
    const other = (): HTMLInputElement => real.nativeElement.querySelector('#other') as HTMLInputElement;
    const settle = async (): Promise<void> => {
      real.detectChanges();
      await real.whenStable();
    };

    beforeEach(async () => {
      real = TestBed.createComponent(RealInputHostComponent);
      await settle();
    });

    /* `change` is only fired when the value at blur differs from the value at focus. An edit that
       ends where it started therefore never reported the ending: the 50 below reached the model on
       the keystroke and the clearing that took it back never did, leaving a saved number under an
       empty box. */
    it('should answer for an edit that ends where it started', async () => {
      await userEvent.click(box());
      await userEvent.type(box(), '50');
      await settle();
      expect(real.componentInstance.emitted.at(-1)).toEqual({ value: 50, isInputValid: true });

      await userEvent.clear(box());
      await userEvent.click(other());
      await settle();

      expect(real.componentInstance.emitted.at(-1)).toEqual({ value: null, isInputValid: false });
      expect(box().value).toBe('');
    });

    it('should put a refused value back on a real blur', async () => {
      real.componentInstance.value = 10;
      await settle();

      await userEvent.click(box());
      await userEvent.clear(box());
      await userEvent.type(box(), '-5');
      await settle();
      await userEvent.click(other());
      await settle();

      expect(real.componentInstance.emitted.filter(update => !update.isInputValid).length).toBe(1);
      expect(box().value).toBe('10');
    });

    /* The other half of listening on `blur`: it fires for a field that was only passed through,
       and the box here is empty and therefore invalid from the start - as any box is whose
       property the selection has no common value for. */
    it('should stay silent when the field is only tabbed through', async () => {
      await userEvent.click(box());
      await userEvent.click(other());
      await settle();

      expect(real.componentInstance.emitted).toEqual([]);
    });
  });

  /* Text the browser could not read is not the same as a box the user emptied, and only a box that
     may legitimately be empty can confuse the two. `5e` is a half-typed exponent: `value` reads
     empty while the box shows the text, so a maximum width would have come off, its checkbox
     unticked and its field disabled, with nothing said. `validity.badInput` is only ever set by
     real typing, so none of this can be tested with dispatched events. */
  describe('with text the browser cannot read', () => {
    let optional: ComponentFixture<OptionalRealInputHostComponent>;

    const box = (): HTMLInputElement => optional.nativeElement.querySelector('#box') as HTMLInputElement;
    const other = (): HTMLInputElement => optional.nativeElement.querySelector('#other') as HTMLInputElement;
    const isRed = (): boolean => !!optional.nativeElement.querySelector('.mat-form-field-invalid');
    const settle = async (): Promise<void> => {
      optional.detectChanges();
      await optional.whenStable();
    };

    beforeEach(async () => {
      optional = TestBed.createComponent(OptionalRealInputHostComponent);
      await settle();
    });

    it('should refuse it, rather than clear the property', async () => {
      await userEvent.click(box());
      await userEvent.clear(box());
      await userEvent.type(box(), '5e');
      await settle();
      expect(box().validity.badInput).toBe(true); // the state this exists for

      await userEvent.click(other());
      await settle();

      expect(optional.componentInstance.emitted.at(-1)).toEqual({ value: null, isInputValid: false });
      expect(box().value).toBe('300');
    });

    /* And it has to look refused while it stands there. The control cannot see bad input by itself,
       so without the validator the box stayed neutral until the field was left - while the same
       keystrokes in a `required` box went red at once. */
    it('should look refused while it is still in the box', async () => {
      await userEvent.click(box());
      await userEvent.clear(box());
      await userEvent.type(box(), '5e');
      await settle();

      expect(isRed()).toBe(true);
    });

    /* And the clearing it must not swallow: the same box, actually emptied, still reports null as a
       value of its own - and does not look refused, because it is not. */
    it('should still report a box that was really emptied', async () => {
      await userEvent.click(box());
      await userEvent.clear(box());
      await settle();
      expect(isRed()).toBe(false);

      await userEvent.click(other());
      await settle();

      expect(optional.componentInstance.emitted.at(-1)).toEqual({ value: null, isInputValid: true });
      expect(box().value).toBe('');
    });
  });

  /* What `required` looks like, which is the part of this that the user sees. */
  describe('inside a form field', () => {
    let formField: ComponentFixture<FormFieldHostComponent>;

    const box = (): HTMLInputElement => formField.nativeElement.querySelector('input') as HTMLInputElement;
    const isRed = (): boolean => !!formField.nativeElement.querySelector('.mat-form-field-invalid');
    const settle = async (): Promise<void> => {
      formField.detectChanges();
      await formField.whenStable();
    };

    beforeEach(async () => {
      formField = TestBed.createComponent(FormFieldHostComponent);
      await settle();
    });

    it('should mark the label as required', () => {
      expect(formField.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).not.toBeNull();
    });

    /* Material's own rule is `invalid && touched`, and touched means the field was left - clicking
       in and tabbing on is enough. The boxes here are empty whenever the panel has no single value
       to show, so that rule paints a mistake nobody made: select two elements of different widths
       and walk past the box. Hence the matcher of our own (#1161). */
    it('should not go red for a box that was only visited', async () => {
      await userEvent.click(box());
      await userEvent.click(document.body);
      await settle();

      expect(box().matches(':not(:focus)')).toBe(true); // it really was left
      expect(isRed()).toBe(false);
    });

    /* The other side of it: while a box is being typed into, red is live feedback and shows as soon
       as what is in it would be refused. */
    it('should go red while an entry that would be refused is being typed', async () => {
      formField.componentInstance.value = 10;
      await settle();

      await userEvent.click(box());
      await userEvent.clear(box());
      await settle();

      expect(isRed()).toBe(true);
    });

    /* And it goes away with the entry itself. Leaving the field puts the model value back and takes
       the dirty marker off with it, so there is nothing left to be red about - what is left is the
       warning the caller shows, which says more than a red border can. */
    it('should stop being red once the refused entry has been put back', async () => {
      formField.componentInstance.value = 10;
      await settle();

      await userEvent.click(box());
      await userEvent.clear(box());
      await settle();
      await userEvent.click(document.body);
      await settle();

      expect(box().value).toBe('10');
      expect(isRed()).toBe(false);
    });
  });
});

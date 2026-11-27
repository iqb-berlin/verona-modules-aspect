import { fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { NgControl, UntypedFormControl } from '@angular/forms';
import { IsDisabledDirective } from './is-disabled.directive';

// The directive is instantiated directly: property bindings on native elements
// in spec-local host templates are rejected by the AOT compiler (NG8002), and
// this way the setTimeout is scheduled inside the fakeAsync zone.
describe('IsDisabledDirective', () => {
  let control: UntypedFormControl;
  let directive: IsDisabledDirective;

  const changeIsDisabled = (value: boolean, firstChange: boolean = false): void => {
    directive.isDisabled = value;
    directive.ngOnChanges({ isDisabled: new SimpleChange(!value, value, firstChange) });
  };

  beforeEach(() => {
    control = new UntypedFormControl('');
    directive = new IsDisabledDirective({ control } as unknown as NgControl);
  });

  it('should disable the control when isDisabled becomes true', fakeAsync(() => {
    changeIsDisabled(true, true);
    tick();
    expect(control.disabled).toBe(true);
  }));

  it('should re-enable the control when isDisabled becomes false again', fakeAsync(() => {
    changeIsDisabled(true, true);
    tick();
    changeIsDisabled(false);
    tick();
    expect(control.disabled).toBe(false);
  }));

  /* The player reports every value change of an element's control to the host as an answer, so the
     state set on loading made an element nobody had touched count as changed (#1732). */
  it('should report no value change when it enables or disables the control (#1732)', fakeAsync(() => {
    const values: unknown[] = [];
    control.valueChanges.subscribe(value => values.push(value));
    changeIsDisabled(false, true);
    tick();
    changeIsDisabled(true);
    tick();
    expect(control.disabled).toBe(true);
    expect(values).toEqual([]);
  }));

  it('should leave the control untouched when isDisabled did not change', fakeAsync(() => {
    directive.ngOnChanges({});
    tick();
    expect(control.disabled).toBe(false);
  }));
});

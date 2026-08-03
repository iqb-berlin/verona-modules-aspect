import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Measurement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import { SizeInputPanelComponent } from './size-input-panel.component';

describe('SizeInputPanelComponent', () => {
  let component: SizeInputPanelComponent;
  let fixture: ComponentFixture<SizeInputPanelComponent>;
  let messageService: SpyObj<MessageService>;

  beforeEach(async () => {
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [SizeInputPanelComponent, NumberFieldDirective, NumberFieldBadInputDirective],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: MessageService, useValue: messageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SizeInputPanelComponent);
    component = fixture.componentInstance;
    component.label = 'Breite 1';
    component.value = 3;
    component.unit = 'fr';
    component.allowedUnits = ['px', 'fr'];
    component.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the given label', () => {
    expect(fixture.nativeElement.textContent).toContain('Breite 1');
  });

  it('should emit the combined measurement', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });

    component.emitMeasurement();

    expect(emitted).toEqual({ value: 3, unit: 'fr' });
  });

  /*
   * The case a merged measurement produces: the selected elements disagree, so the field is empty.
   * This used to substitute 0 and write it to all of them - a value the author never entered.
   */
  it('should write nothing while the value is missing', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.value = null;
    fixture.detectChanges();

    const unitSelect: HTMLElement = fixture.nativeElement.querySelector('mat-select');
    unitSelect.dispatchEvent(new Event('selectionChange'));
    component.emitMeasurement();

    expect(emitted).toBeUndefined();
    expect(component.value).toBeNull();
  });

  it('should write nothing while the unit is missing', () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.unit = null;

    component.emitMeasurement();

    expect(emitted).toBeUndefined();
  });

  // A value entered into the empty field still reaches the whole selection.
  it('should emit once the missing value is entered', async () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    component.value = null;
    fixture.detectChanges();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual({ value: 5, unit: 'fr' });
  });

  /* On leaving the field, which is where the original `(change)` handler had it - so an edit
     reaches the model once rather than once per keystroke. */
  it('should emit the combined measurement when the number input is left', async () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => {
      emitted = measurement;
    });

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '7';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted).toBeUndefined(); // not while it is being typed

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual({ value: 7, unit: 'fr' });
  });

  it('should disable the number input when the panel is disabled', async () => {
    component.disabled = true;
    fixture.detectChanges();
    // NgModel applies the disabled state in a microtask
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  /* An emptied box wrote nothing - which is right, a measurement needs both halves - but it also
     said nothing and put nothing back, so the field sat empty over a measurement that still held
     its old value, and no later render brought it back (#1164). */
  describe('leaving the number box', () => {
    const box = (): HTMLInputElement => fixture.nativeElement.querySelector('input') as HTMLInputElement;

    const edit = async (value: string): Promise<void> => {
      box().value = value;
      box().dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should put an emptied box back and say why', async () => {
      let emitted: Measurement | undefined;
      component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });

      await edit('');

      expect(emitted).toBeUndefined();
      expect(box().value).toBe('3');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* The floor comes from the call site: this panel is a grid track size here, and a track shorter
       than nothing is not a length. Where it serves a margin no floor is passed, because a negative
       margin pulls the element up and is meant. */
    it('should refuse a track size below the floor its call site gives it', async () => {
      component.min = 0;
      fixture.detectChanges();
      await fixture.whenStable();
      let emitted: Measurement | undefined;
      component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });

      await edit('-2');

      expect(emitted).toBeUndefined();
      expect(box().value).toBe('3');
    });

    it('should take a negative measurement where no floor is given', async () => {
      let emitted: Measurement | undefined;
      component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });

      await edit('-20');

      expect(emitted).toEqual({ value: -20, unit: 'fr' });
    });
  });

  /* Enter is how a number gets confirmed without leaving the field, and the old `(change)` handler
     fired on it. Hanging the write on `blur` alone silently dropped that: the box showed 15 and the
     model kept the old value until the focus moved on (#1164). */
  it('should write on Enter, not only on leaving the field', async () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    const box = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    box.value = '15';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toEqual({ value: 15, unit: 'fr' });
  });

  /* And then not a second time when the field is left: what was pending has been used up. */
  it('should not write the same entry twice after Enter', async () => {
    let emits = 0;
    component.valueUpdated.subscribe(() => { emits += 1; });
    const box = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    box.value = '15';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    box.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emits).toBe(1);
  });

  /* A refused entry has to drop what an earlier keystroke made pending, or leaving the field would
     warn and write the deleted value anyway. This is what pins the order the whole pending scheme
     rests on: the directive's blur listener runs before the template's. */
  it('should not write a value that was typed and then deleted again', async () => {
    let emitted: Measurement | undefined;
    component.valueUpdated.subscribe((measurement: Measurement) => { emitted = measurement; });
    const box = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    box.value = '5';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    box.value = '';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    box.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emitted).toBeUndefined();
    expect(box.value).toBe('3');
    expect(messageService.showWarning).toHaveBeenCalledTimes(1);
  });

  /* Retyping what is already there is not an edit. The old `(change)` handler did not fire for it,
     because the value at blur equalled the value at focus. */
  it('should not write an entry that changes nothing', async () => {
    let emits = 0;
    component.valueUpdated.subscribe(() => { emits += 1; });
    const box = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    box.value = '3';
    box.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    box.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emits).toBe(0);
  });
});

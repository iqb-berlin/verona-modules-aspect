import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  LimitEnabledStatePipe
} from 'editor/src/app/modules/properties-panel/pipes/limit-enabled-state.pipe';
import {
  PropertyDivergesPipe
} from 'editor/src/app/modules/properties-panel/pipes/property-diverges.pipe';
import {
  SelectPropertiesComponent
} from './select-properties.component';

describe('SelectPropertiesComponent', () => {
  let component: SelectPropertiesComponent;
  let fixture: ComponentFixture<SelectPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [
        SelectPropertiesComponent, MergedCheckboxComponent, MergedMarkerComponent,
        NumberFieldDirective, NumberFieldBadInputDirective,
        LimitEnabledStatePipe, PropertyDivergesPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      strikeOtherOptions: false,
      strikeSelectedOption: false,
      allowUnset: false,
      itemsPerRow: 4
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* alignment and verticalOrientation moved here from the grab bag: they belong to the radio group
     and the toggle button, both of which this component already served. The baseline says the move
     is order-neutral - alignment renders directly before strikeOtherOptions for the radio group,
     verticalOrientation directly after strikeSelectedOption for the toggle button. */
  describe('the two properties that came from the grab bag', () => {
    it('should offer the alignment of a radio group and emit the choice', () => {
      component.combinedProperties = { alignment: 'column', strikeOtherOptions: false };
      fixture.detectChanges();

      const select = fixture.debugElement.query(By.directive(MatSelect));
      expect(select.componentInstance.value).toBe('column');

      select.triggerEventHandler('selectionChange', { value: 'row' });

      expect(emitted).toEqual([{ property: 'alignment', value: 'row' }]);
    });

    it('should offer the vertical orientation of a toggle button and emit the toggle', () => {
      component.combinedProperties = { strikeSelectedOption: false, verticalOrientation: false };
      fixture.detectChanges();

      const boxes = fixture.debugElement.queryAll(By.directive(MergedCheckboxComponent));
      expect(boxes.length).toBe(2);

      boxes[1].triggerEventHandler('valueChange', true);

      expect(emitted).toEqual([{ property: 'verticalOrientation', value: true }]);
    });

    it('should show neither for an element that has neither', () => {
      component.combinedProperties = { allowUnset: false };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(MatSelect))).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.verticalOrientation');
    });
  });

  it('should render a checkbox for every defined property', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.strikeOtherOptions');
  });

  it('should hide the expert mode properties in simple mode', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(3);
    expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.strikeOtherOptions');
  });

  it('should set a default of four items per row when the limit is activated', () => {
    component.setItemsPerRow(true);

    expect(emitted).toEqual([{ property: 'itemsPerRow', value: 4 }]);
  });

  it('should reset the items per row when the limit is deactivated', () => {
    component.setItemsPerRow(false);

    expect(emitted).toEqual([{ property: 'itemsPerRow', value: null }]);
  });

  // A divergent multi selection merges to null; the merged checkboxes show that as indeterminate.
  it('should show divergent booleans as indeterminate', () => {
    component.combinedProperties = {
      strikeOtherOptions: null, strikeSelectedOption: null, allowUnset: null
    };
    fixture.detectChanges();

    const boxes = fixture.debugElement.queryAll(By.directive(MergedCheckboxComponent));
    expect(boxes.length).toBe(3);
    expect(boxes.every(box => box.componentInstance.indeterminate)).toBe(true);
  });

  /**
   * NOT `fakeAsync`, and that is the point of this comment.
   *
   * `[disabled]` sits on an input that also carries `[ngModel]`, so NgModel gets the binding too and
   * disables the form control - but it does that inside `resolvedPromise.then(...)`, chained onto a
   * promise NgModel created at module load, outside any fake zone. Neither `tick()` nor
   * `flushMicrotasks()` reaches that callback, so under `fakeAsync` the field looks like it stayed
   * editable. It only settles with `await fixture.whenStable()`.
   *
   * An earlier version of this test asserted the field stays editable and called that the product's
   * behaviour. It is not: the switch-over disables the field correctly. This is a documented
   * exception to rule 7 - prefer `fakeAsync`, except where the code under test waits on a promise
   * from outside the zone.
   */
  it('should disable the items per row input when the limit is switched off', async () => {
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.disabled).toBe(false);

    component.combinedProperties = { itemsPerRow: null };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  });

  it('should re-enable the items per row input when the limit is switched back on', async () => {
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    component.combinedProperties = { itemsPerRow: null };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    component.combinedProperties = { itemsPerRow: 4 };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.disabled).toBe(false);
  });

  /* `itemsPerRow` is nullable in the model, so "no limit" and "the selection disagrees" arrive as
     the same null and the box needs the panel's set to tell them apart (#1167). Before that, two
     image radio groups limited to different counts were shown as not limited at all, with the
     number box disabled on top - no way to give them a common limit without unticking first. */
  describe('the items per row limit under a diverging selection', () => {
    const limitBox = (): HTMLInputElement => Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[3];
    const numberBox = (): HTMLInputElement => fixture.nativeElement
      .querySelector('input[type="number"]') as HTMLInputElement;

    beforeEach(async () => {
      component.combinedProperties = { ...component.combinedProperties, itemsPerRow: null };
      component.divergingProperties = new Set(['itemsPerRow']);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should show the limit box as indeterminate', () => {
      expect(limitBox().getAttribute('aria-checked')).toBe('mixed');
    });

    it('should keep the number box editable and marked', () => {
      expect(numberBox().disabled).toBe(false);
      expect(fixture.nativeElement.querySelector('aspect-merged-marker')).not.toBeNull();
    });

    /* Clicking the indeterminate box means "give them all a limit" and writes the same default a
       plain checkbox wrote before - only the state shown ahead of the click has changed. */
    it('should give the whole selection the default limit when clicked', () => {
      limitBox().click();
      fixture.detectChanges();

      expect(emitted).toEqual([{ property: 'itemsPerRow', value: 4 }]);
    });
  });

  it('should render nothing for an element with none of the properties', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('input[type="number"]').length).toBe(0);
  });

  it('should reset the items per row when the limit checkbox is unchecked', () => {
    const limitCheckboxInput = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[3];
    expect(limitCheckboxInput.checked).toBe(true);

    limitCheckboxInput.click();

    expect(emitted).toEqual([{ property: 'itemsPerRow', value: null }]);
  });

  /*
   * The tooltip needs an anchor whose rect covers its checkbox: MatTooltip both positions the overlay
   * and takes its hover target from that rect. `aspect-merged-checkbox` is `display: contents` and has
   * none, and a `span` wrapper does not help either - a block inside an inline element splits the
   * inline box, so the span's rect was a 17px fragment beside the checkbox. The tooltip then appeared
   * next to the box and hovering the box did nothing at all.
   */
  it('should anchor the strikeSelectedOption tooltip on a box around its checkbox', () => {
    const anchor = fixture.debugElement.query(By.directive(MatTooltip)).nativeElement as HTMLElement;
    const anchorRect = anchor.getBoundingClientRect();
    const checkboxRect = (anchor.querySelector('mat-checkbox') as HTMLElement).getBoundingClientRect();

    expect(anchorRect.height).toBeGreaterThan(0);
    expect(anchorRect.top).toBeLessThanOrEqual(checkboxRect.top);
    expect(anchorRect.bottom).toBeGreaterThanOrEqual(checkboxRect.bottom);
    expect(anchorRect.left).toBeLessThanOrEqual(checkboxRect.left);
    expect(anchorRect.right).toBeGreaterThanOrEqual(checkboxRect.right);
  });
});

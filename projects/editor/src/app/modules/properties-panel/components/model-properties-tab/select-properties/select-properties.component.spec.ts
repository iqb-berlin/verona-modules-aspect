import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  SelectPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/select-properties/select-properties.component';

describe('SelectPropertiesComponent', () => {
  let component: SelectPropertiesComponent;
  let fixture: ComponentFixture<SelectPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [SelectPropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
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
});

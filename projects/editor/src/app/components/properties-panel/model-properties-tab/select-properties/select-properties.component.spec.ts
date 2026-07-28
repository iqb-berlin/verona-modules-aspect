import {
  ComponentFixture, fakeAsync, TestBed, tick
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
   * Characterizes today's behaviour, which looks wrong: the template binds [disabled] on an input
   * that also carries [ngModel], so the binding reaches NgModel as well and the form control's
   * state wins. Switching the limit off therefore leaves the field editable. It *is* disabled when
   * the panel is built with itemsPerRow already null — see the "(disabled)" in the
   * radio-group-images baseline entry — so only the switch-over is affected. Recorded rather than
   * fixed: changing it is a behaviour change, not part of typing this component.
   */
  it('should leave the items per row input editable after the limit is switched off', fakeAsync(() => {
    component.combinedProperties = { itemsPerRow: null };
    fixture.detectChanges();
    tick();

    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.disabled).toBe(false);
  }));

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

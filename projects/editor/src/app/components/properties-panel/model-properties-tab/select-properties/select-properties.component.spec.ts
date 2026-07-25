import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  CombinedProperties
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  SelectPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/select-properties/select-properties.component';

describe('SelectPropertiesComponent', () => {
  let component: SelectPropertiesComponent;
  let fixture: ComponentFixture<SelectPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  const checkboxChange = (checked: boolean): MatCheckboxChange => ({ checked } as MatCheckboxChange);

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [SelectPropertiesComponent],
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
    } as unknown as CombinedProperties;
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
    component.setItemsPerRow(checkboxChange(true));

    expect(emitted).toEqual([{ property: 'itemsPerRow', value: 4 }]);
  });

  it('should reset the items per row when the limit is deactivated', () => {
    component.setItemsPerRow(checkboxChange(false));

    expect(emitted).toEqual([{ property: 'itemsPerRow', value: null }]);
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

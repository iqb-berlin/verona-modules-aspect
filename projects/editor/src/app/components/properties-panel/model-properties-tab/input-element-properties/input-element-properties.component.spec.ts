import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import {
  InputElementPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-element-properties/input-element-properties.component';

describe('InputElementPropertiesComponent', () => {
  let component: InputElementPropertiesComponent;
  let fixture: ComponentFixture<InputElementPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [InputElementPropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputElementPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      label: 'Frage 1',
      readOnly: false,
      required: false,
      requiredWarnMessage: 'Pflichtfeld'
    } as unknown as UIElement;
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current label', () => {
    const labelInput = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(labelInput.value).toBe('Frage 1');
  });

  it('should emit the edited label', () => {
    const labelInput = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    labelInput.value = 'Frage 2';
    labelInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'label', value: 'Frage 2' }]);
  });

  it('should emit updateModel when readOnly is toggled', () => {
    const readOnlyInput = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    readOnlyInput.click();

    expect(emitted).toEqual([{ property: 'readOnly', value: true }]);
  });

  it('should hide the required field settings in simple mode', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(2);

    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('input[type="text"]').length).toBe(0);
  });

  it('should omit the label field for elements without a label', () => {
    component.combinedProperties = { readOnly: false, required: false } as unknown as UIElement;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });
});

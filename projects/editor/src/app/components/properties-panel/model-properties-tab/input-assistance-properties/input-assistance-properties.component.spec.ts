import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  CombinedProperties
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import {
  InputAssistancePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-assistance-properties/input-assistance-properties.component';

describe('InputAssistancePropertiesComponent', () => {
  let component: InputAssistancePropertiesComponent;
  let fixture: ComponentFixture<InputAssistancePropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputAssistancePropertiesComponent],
      imports: [
        CommonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputAssistancePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'text-field',
      showSoftwareKeyboard: false,
      hideNativeKeyboard: false,
      addInputAssistanceToKeyboard: false,
      inputAssistancePreset: null,
      inputAssistancePosition: 'floating',
      inputAssistanceCustomKeys: ''
    } as unknown as CombinedProperties;
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the keyboard fieldset only for elements with a software keyboard', () => {
    expect(fixture.nativeElement.querySelectorAll('fieldset').length).toBe(2);

    component.combinedProperties = { type: 'button' } as unknown as CombinedProperties;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('fieldset').length).toBe(0);
  });

  it('should reset the native keyboard when no preset and no software keyboard are set', () => {
    component.updateInputAssistancePreset(null);

    expect(emitted).toEqual([
      { property: 'inputAssistancePreset', value: null },
      { property: 'hideNativeKeyboard', value: false }
    ]);
  });

  it('should keep the native keyboard setting when a preset is selected', () => {
    component.updateInputAssistancePreset('numbers');

    expect(emitted).toEqual([{ property: 'inputAssistancePreset', value: 'numbers' }]);
  });

  it('should hide the native keyboard when the software keyboard is enabled', () => {
    component.updateShowSoftwareKeyboard(true);

    expect(emitted).toEqual([
      { property: 'showSoftwareKeyboard', value: true },
      { property: 'hideNativeKeyboard', value: true }
    ]);
  });

  it('should restore the native keyboard when the software keyboard is disabled without a preset', () => {
    component.updateShowSoftwareKeyboard(false);

    expect(emitted).toEqual([
      { property: 'showSoftwareKeyboard', value: false },
      { property: 'hideNativeKeyboard', value: false }
    ]);
  });

  it('should emit the custom keys of a custom preset', () => {
    component.combinedProperties = {
      type: 'text-field',
      showSoftwareKeyboard: false,
      inputAssistancePreset: 'custom',
      inputAssistancePosition: 'right',
      inputAssistanceCustomKeys: 'abc'
    } as unknown as CombinedProperties;
    fixture.detectChanges();

    const customKeysInput = fixture.debugElement
      .query(By.css('input[type="text"]')).nativeElement as HTMLInputElement;
    expect(customKeysInput.value).toBe('abc');

    customKeysInput.value = 'xyz';
    customKeysInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'inputAssistanceCustomKeys', value: 'xyz' }]);
  });
});

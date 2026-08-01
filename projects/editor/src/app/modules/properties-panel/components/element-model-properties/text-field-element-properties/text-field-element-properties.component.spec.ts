import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  TextFieldElementPropertiesComponent
} from './text-field-element-properties.component';

describe('TextFieldElementPropertiesComponent', () => {
  let component: TextFieldElementPropertiesComponent;
  let fixture: ComponentFixture<TextFieldElementPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  const blurEvent = (value: string): FocusEvent => ({ target: { value } } as unknown as FocusEvent);

  beforeEach(async () => {
    unitServiceMock = { expertMode: true };

    await TestBed.configureTestingModule({
      declarations: [TextFieldElementPropertiesComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextFieldElementPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'text-field',
      textAlign: 'left',
      appearance: 'fill',
      minLength: 0,
      maxLength: 10,
      isLimitedToMaxLength: false,
      pattern: '[a-z]+',
      clearable: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the pattern form control with the current pattern', () => {
    expect(component.regexPatternFormControl.value).toBe('[a-z]+');
  });

  it('should update the pattern form control on input changes', () => {
    const previousProperties = component.combinedProperties;
    component.combinedProperties = {
      type: 'text-field', pattern: '[0-9]+'
    };
    const changes: SimpleChanges = {
      combinedProperties: new SimpleChange(previousProperties, component.combinedProperties, false)
    };

    component.ngOnChanges(changes);

    expect(component.regexPatternFormControl.value).toBe('[0-9]+');
  });

  it('should emit a valid regular expression', () => {
    component.validateRegex(blurEvent('[0-9]+'));

    expect(emitted).toEqual([{ property: 'pattern', value: '[0-9]+' }]);
    expect(component.regexPatternFormControl.errors).toBeNull();
  });

  it('should mark an invalid regular expression instead of emitting it', () => {
    component.validateRegex(blurEvent('[a-z'));

    expect(emitted).toEqual([]);
    expect(component.regexPatternFormControl.errors).toEqual({ invalidPattern: true });
  });

  it('should emit the selected text alignment', () => {
    const textAlignGroup = fixture.debugElement.query(By.css('mat-button-toggle-group'));
    textAlignGroup.triggerEventHandler('change', { value: 'center' });

    expect(emitted).toEqual([{ property: 'textAlign', value: 'center' }]);
  });

  /* `min="0"` makes -1 invalid, so the guard in the host refuses it. Nothing then puts the box
     back on its own, and it would keep showing a number the model never took (#1154). */
  it('should put a rejected maximum length back to the model value', async () => {
    const maxLengthInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    )[1];
    maxLengthInput.value = '-1';
    maxLengthInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    emitted.length = 0;

    maxLengthInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(maxLengthInput.value).toBe('10');
    expect(emitted).toEqual([]); // putting the box back is not a write
  });

  /* Unlike the `number` properties elsewhere, these are `number | null` - an empty box means
     "no limit" and must stay empty rather than being turned into a 0. */
  it('should leave an emptied maximum length empty', async () => {
    const maxLengthInput = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    )[1];
    maxLengthInput.value = '';
    maxLengthInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    maxLengthInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(maxLengthInput.value).toBe('');
    expect(emitted).toEqual([{ property: 'maxLength', value: null, isInputValid: true }]);
  });

  it('should hide the expert mode fields in simple mode', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.minLength');
    expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.pattern');
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.textAlign');
  });
});

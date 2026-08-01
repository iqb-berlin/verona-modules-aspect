import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { PresetOptionTextPipe } from 'editor/src/app/modules/properties-panel/pipes/preset-option-text.pipe';
import {
  PresetValuePropertiesComponent
} from './preset-value-properties.component';

@Component({ selector: 'aspect-math-input', standalone: false, template: '' })
class MockMathInputComponent {
  @Input() value!: string;
  @Input() enableModeSwitch: boolean = false;
  @Input() mathKeyboardPresets: MathKeyboardPreset[] = [];
  @Input() placeholder: string = '';
  @Output() valueChange = new EventEmitter<string>();
}

describe('PresetValuePropertiesComponent', () => {
  let component: PresetValuePropertiesComponent;
  let fixture: ComponentFixture<PresetValuePropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PresetValuePropertiesComponent,
        MockMathInputComponent,
        PresetOptionTextPipe,
        SafeResourceHTMLPipe
      ],
      imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PresetValuePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { type: 'text-area', value: 'preset text' };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the edited preset of a text area', () => {
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('preset text');

    textarea.value = 'new preset';
    textarea.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'value', value: 'new preset' }]);
  });

  it('should offer an option for every entry of an option list', () => {
    component.combinedProperties = {
      type: 'dropdown', value: 0, options: [{ text: 'A' }, { text: 'B' }]
    };
    fixture.detectChanges();

    const optionSelect = fixture.debugElement.query(By.css('mat-select'));
    expect(optionSelect).not.toBeNull();

    optionSelect.triggerEventHandler('selectionChange', { value: 1 });

    expect(emitted).toEqual([{ property: 'value', value: 1 }]);
  });

  /* Option lists that disagree across the selection merge to null, while a preset index shared by
     the elements survives. Offering the select then meant indexing into null - on every change
     detection cycle, because the trigger renders in the closed state too (#1151). */
  it('should not offer the select when the option lists disagree', () => {
    component.combinedProperties = { type: 'dropdown', value: 0, options: null };

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.debugElement.query(By.css('mat-select'))).toBeNull();
  });

  // The likert has options but no single preset of its own, so it keeps the select away.
  it('should not offer the select for an element with option rows', () => {
    component.combinedProperties = {
      type: 'likert', options: [{ text: 'A' }], rows: []
    };
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('mat-select'))).toBeNull();
  });

  it('should emit the value of the math input', () => {
    component.combinedProperties = { type: 'math-field', value: '1+1' };
    fixture.detectChanges();

    const mathInput = fixture.debugElement
      .query(By.directive(MockMathInputComponent)).componentInstance as MockMathInputComponent;
    expect(mathInput.value).toBe('1+1');

    mathInput.valueChange.emit('2+2');

    expect(emitted).toEqual([{ property: 'value', value: '2+2' }]);
  });

  it('should switch between formula and latex editor', () => {
    component.combinedProperties = { type: 'math-field', value: '1+1' };
    fixture.detectChanges();

    const toggleButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    toggleButton.click();
    fixture.detectChanges();

    expect(component.showLatexEditor).toBe(true);
    expect(fixture.debugElement.query(By.directive(MockMathInputComponent))).toBeNull();
    const latexInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(latexInput.value).toBe('1+1');
  });
});

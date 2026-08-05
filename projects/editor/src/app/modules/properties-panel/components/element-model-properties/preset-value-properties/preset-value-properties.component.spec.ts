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
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MathKeyboardPreset } from 'common/models/input-element-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import { PresetOptionTextPipe } from 'editor/src/app/modules/properties-panel/pipes/preset-option-text.pipe';
import {
  PropertyDivergesPipe
} from 'editor/src/app/modules/properties-panel/pipes/property-diverges.pipe';
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
        MergedMarkerComponent,
        PresetOptionTextPipe,
        PropertyDivergesPipe,
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

  /* The closed select shows the preset's text, and the option it names can be renamed while the
     panel stays open. The merge hands down the element's own option array (`{...elements[0]}`) and
     `UIElement.setProperty` splices into it to keep the reference intact, so that rename reaches
     the trigger as an in-place mutation - nothing the binding could be keyed on changes. */
  it('should follow a renamed option in the closed select', async () => {
    const options = [{ text: 'A' }, { text: 'B' }];
    component.combinedProperties = { type: 'dropdown', value: 1, options };
    fixture.detectChanges();

    /* MatSelect keeps its options in the overlay and renders the custom trigger only once
       something is selected, so the preset has to be picked up before the trigger exists. */
    const select = fixture.debugElement.query(By.directive(MatSelect)).componentInstance as MatSelect;
    select.open();
    fixture.detectChanges();
    await fixture.whenStable();
    select.close();
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = () => fixture.debugElement.query(By.css('mat-select-trigger')).nativeElement;
    expect(trigger().textContent).toBe('B');

    options[1].text = 'B neu';
    fixture.detectChanges();

    expect(trigger().textContent).toBe('B neu');
  });

  /* The preset is nullable, so an empty control is either "no preset" or "the elements disagree", and
     only the panel's divergence set tells them apart (#1173). One case per shape. */
  describe('the marker on a diverging preset', () => {
    const marker = (): HTMLElement | null => fixture.nativeElement.querySelector('aspect-merged-marker');

    it('should mark a text area', () => {
      component.combinedProperties = { type: 'text-area', value: null };
      component.divergingProperties = new Set(['value']);
      fixture.detectChanges();

      expect(marker()).not.toBeNull();
    });

    it('should mark a text field', () => {
      component.combinedProperties = { type: 'text-field', value: null };
      component.divergingProperties = new Set(['value']);
      fixture.detectChanges();

      expect(marker()).not.toBeNull();
    });

    it('should not mark a preset the selection agrees is unset', () => {
      component.combinedProperties = { type: 'text-area', value: null };
      component.divergingProperties = new Set<string>();
      fixture.detectChanges();

      expect(marker()).toBeNull();
    });

    /* At the start of the closed display, as a form field prefix. It cannot go into
       `mat-select-trigger`, where the chosen option's text sits: a diverging preset is `null`, and
       MatSelect never selects an option with a null value, so the field stays `empty` and renders its
       placeholder rather than the custom trigger. Written as a test first, and it failed - hence the
       prefix. */
    it('should mark the closed select', async () => {
      component.combinedProperties = {
        type: 'dropdown', value: null, options: [{ text: 'A' }, { text: 'B' }]
      };
      component.divergingProperties = new Set(['value']);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(marker()).not.toBeNull();
    });

    // And it stays out of the way of a preset that is actually set.
    it('should not mark a select whose preset the elements agree on', async () => {
      component.combinedProperties = {
        type: 'dropdown', value: 1, options: [{ text: 'A' }, { text: 'B' }]
      };
      component.divergingProperties = new Set<string>();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(marker()).toBeNull();
    });

    /* The formula editor is no mat-form-field, so the marker sits in the label row and speaks for
       both views - the formula one is the default, where a suffix would never be seen. */
    it('should mark the formula field in both views', () => {
      component.combinedProperties = { type: 'math-field', value: null };
      component.divergingProperties = new Set(['value']);
      fixture.detectChanges();
      expect(marker()).not.toBeNull();

      component.showLatexEditor = true;
      fixture.detectChanges();

      expect(marker()).not.toBeNull();
    });
  });

  /* Option lists that disagree across the selection merge to null, while a preset index shared by
     the elements survives. Offering the select then meant indexing into null - on every change
     detection cycle, because the trigger renders in the closed state too (#1151). */
  it('should not offer the select when the option lists disagree', () => {
    component.combinedProperties = { type: 'dropdown', value: 0, options: null };

    expect(() => fixture.detectChanges()).not.toThrow();
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

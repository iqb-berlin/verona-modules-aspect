import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  MathKeyboardPresetsIncompletePipe
} from 'editor/src/app/modules/properties-panel/pipes/math-keyboard-presets-incomplete.pipe';
import {
  MathKeyboardPropertiesComponent
} from './math-keyboard-properties.component';

describe('MathKeyboardPropertiesComponent', () => {
  let component: MathKeyboardPropertiesComponent;
  let fixture: ComponentFixture<MathKeyboardPropertiesComponent>;
  const unitServiceMock = { expertMode: true } as unknown as UnitService;

  const select = () => fixture.debugElement.query(By.css('mat-select'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathKeyboardPropertiesComponent, MathKeyboardPresetsIncompletePipe],
      imports: [MatFormFieldModule, MatSelectModule, MatIconModule, TranslateModule.forRoot()],
      providers: [{ provide: UnitService, useValue: unitServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(MathKeyboardPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = { mathKeyboardPresets: ['math'] };
    fixture.detectChanges();
  });

  it('should emit the selected presets', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    select().triggerEventHandler('selectionChange', { value: ['math', 'greek'] });

    expect(emitted).toEqual([
      { property: 'mathKeyboardPresets', value: ['math', 'greek'] }
    ]);
  });

  it('should render nothing when the property is absent', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(select()).toBeNull();
  });

  it('should render nothing outside expert mode', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(select()).toBeNull();
  });

  // An empty selection is a value, not an absent property, so the control stays.
  it('should keep the control for an empty preset list', () => {
    component.combinedProperties = { mathKeyboardPresets: [] };
    fixture.detectChanges();

    expect(select()).not.toBeNull();
  });

  describe('in a math field whose input mode can be switched (#1692)', () => {
    const disabledPresets = (): string[] => (select().componentInstance as MatSelect).options
      .filter(option => option.disabled)
      .map(option => option.value);

    it('should warn when the Latin letters are missing, and leave every preset free', () => {
      component.combinedProperties = { mathKeyboardPresets: ['math', 'greek'], enableModeSwitch: true };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('formulaPreset.modeSwitchHint');
      expect(disabledPresets()).toEqual([]);
    });

    it('should not warn when the presets of both modes are selected', () => {
      component.combinedProperties = { mathKeyboardPresets: ['math', 'latin'], enableModeSwitch: true };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('formulaPreset.modeSwitchHint');
    });
  });
});

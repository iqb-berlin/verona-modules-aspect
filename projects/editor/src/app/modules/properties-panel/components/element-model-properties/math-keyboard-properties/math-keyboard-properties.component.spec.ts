import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
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
      declarations: [MathKeyboardPropertiesComponent],
      imports: [MatFormFieldModule, MatSelectModule, TranslateModule.forRoot()],
      providers: [{ provide: UnitService, useValue: unitServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(MathKeyboardPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = { mathKeyboardPresets: ['math'] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});

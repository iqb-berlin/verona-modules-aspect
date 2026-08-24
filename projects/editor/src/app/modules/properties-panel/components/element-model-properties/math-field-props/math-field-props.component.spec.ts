import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  MathFieldPropsComponent
} from './math-field-props.component';

describe('MathFieldPropsComponent', () => {
  let component: MathFieldPropsComponent;
  let fixture: ComponentFixture<MathFieldPropsComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathFieldPropsComponent, MergedCheckboxComponent],
      imports: [
        MatCheckboxModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MathFieldPropsComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { enableModeSwitch: false };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the mode switch checkbox unchecked', () => {
    const checkbox = fixture.nativeElement.querySelector('mat-checkbox') as HTMLElement;
    expect(checkbox.textContent).toContain('propertiesPanel.enableModeSwitch');
    expect((checkbox.querySelector('input') as HTMLInputElement).checked).toBe(false);
  });

  it('should reflect an enabled mode switch', () => {
    component.combinedProperties = { enableModeSwitch: true };
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('should emit updateModel when the checkbox is toggled', () => {
    const input = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    input.click();

    expect(emitted).toEqual([{ property: 'enableModeSwitch', value: true }]);
  });
});

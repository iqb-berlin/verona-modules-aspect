import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import {
  CombinedProperties
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/highlight-properties/highlight-properties.component';

describe('HighlightPropertiesComponent', () => {
  let component: HighlightPropertiesComponent;
  let fixture: ComponentFixture<HighlightPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HighlightPropertiesComponent],
      imports: [
        CommonModule,
        MatCheckboxModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      highlightableYellow: false,
      highlightableTurquoise: true,
      highlightableOrange: false
    } as unknown as CombinedProperties;
    component.disabled = false;
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a checkbox for every highlight color', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).map(checkbox => checkbox.textContent);
    expect(labels.length).toBe(3);
    ['highlightableYellow', 'highlightableTurquoise', 'highlightableOrange'].forEach(property => {
      expect(labels.some(label => label?.includes(`propertiesPanel.${property}`))).toBe(true);
    });
  });

  it('should only render checkboxes for defined properties', () => {
    component.combinedProperties = { highlightableYellow: false } as unknown as CombinedProperties;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(1);
  });

  it('should reflect the current values', () => {
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.map(input => input.checked)).toEqual([false, true, false]);
  });

  it('should emit updateModel when a checkbox is toggled', () => {
    const yellowInput = fixture.nativeElement.querySelector('mat-checkbox input') as HTMLInputElement;
    yellowInput.click();

    expect(emitted).toEqual([{ property: 'highlightableYellow', value: true }]);
  });

  it('should disable all checkboxes when disabled is set', () => {
    component.disabled = true;
    fixture.detectChanges();

    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.every(input => input.disabled)).toBe(true);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import {
  WidgetMoleculeEditorPropertiesComponent
} from './widget-molecule-editor-properties.component';

describe('WidgetMoleculeEditorPropertiesComponent', () => {
  let component: WidgetMoleculeEditorPropertiesComponent;
  let fixture: ComponentFixture<WidgetMoleculeEditorPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WidgetMoleculeEditorPropertiesComponent, MergedCheckboxComponent],
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetMoleculeEditorPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      bondingType: 'VALENCE', showInfoName: false, showInfoOrder: true, highlightBlocks: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the bonding type field', () => {
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.bondingType');
    expect(fixture.debugElement.query(By.css('mat-select'))).not.toBeNull();
  });

  it('should emit the selected bonding type', () => {
    const bondingTypeSelect = fixture.debugElement.query(By.css('mat-select'));
    bondingTypeSelect.triggerEventHandler('selectionChange', { value: 'ELECTRONS' });

    expect(emitted).toEqual([{ property: 'bondingType', value: 'ELECTRONS' }]);
  });

  /* The three settings of the periodic table the widget offers for picking an atom (#1420). */
  it('should reflect and emit the element picker settings', () => {
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    );
    expect(inputs.map(input => input.checked)).toEqual([false, true, false]);

    inputs.forEach(input => input.click());

    expect(emitted).toEqual([
      { property: 'showInfoName', value: true },
      { property: 'showInfoOrder', value: false },
      { property: 'highlightBlocks', value: true }
    ]);
  });
});

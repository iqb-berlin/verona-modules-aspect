import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  WidgetMoleculeEditorPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-molecule-editor-properties/widget-molecule-editor-properties.component';

describe('WidgetMoleculeEditorPropertiesComponent', () => {
  let component: WidgetMoleculeEditorPropertiesComponent;
  let fixture: ComponentFixture<WidgetMoleculeEditorPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WidgetMoleculeEditorPropertiesComponent],
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetMoleculeEditorPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { bondingType: 'VALENCE' };
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
});

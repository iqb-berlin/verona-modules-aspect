import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonAlignmentPropertiesComponent } from './button-alignment-properties.component';

// Declared instead of importing PropertiesPanelModule: a module import alongside declarations
// trips the AOT scope check in these specs (NG0304).
@Component({
  selector: 'aspect-merged-marker',
  standalone: false,
  template: ''
})
class MockMergedMarkerComponent {}

describe('ButtonAlignmentPropertiesComponent', () => {
  let component: ButtonAlignmentPropertiesComponent;
  let fixture: ComponentFixture<ButtonAlignmentPropertiesComponent>;

  const field = () => fixture.debugElement.query(By.css('mat-form-field'));
  const select = () => fixture.debugElement.query(By.css('mat-select'));
  const marker = () => fixture.debugElement.query(By.directive(MockMergedMarkerComponent));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonAlignmentPropertiesComponent, MockMergedMarkerComponent],
      imports: [MatFormFieldModule, MatSelectModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonAlignmentPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { verticalButtonAlignment: 'auto' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer both alignments', async () => {
    select().nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const options = document.querySelectorAll('mat-option');
    expect(Array.from(options).map(option => option.textContent?.trim()))
      .toEqual(['propertiesPanel.buttonAlignmentFirstLine', 'propertiesPanel.buttonAlignmentCentered']);
  });

  it('should emit the chosen alignment', async () => {
    const emitted: { property: string; value: string | null }[] = [];
    component.updateModel.subscribe(event => emitted.push(event));

    select().nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    (document.querySelectorAll('mat-option')[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(emitted).toEqual([{ property: 'verticalButtonAlignment', value: 'center' }]);
  });

  it('should hide itself for an element without the property', () => {
    component.combinedProperties = {};
    fixture.detectChanges();
    expect(field()).toBeNull();
  });

  /* A divergent selection merges to null, which has to keep the field visible and mark it (#1138). */
  it('should stay visible and marked when the selected elements disagree', () => {
    component.combinedProperties = { verticalButtonAlignment: null };
    fixture.detectChanges();
    expect(field()).not.toBeNull();
    expect(marker()).not.toBeNull();
  });

  it('should show no marker when the selection agrees', () => {
    expect(marker()).toBeNull();
  });
});

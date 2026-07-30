import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  CheckboxPropertiesComponent
} from './checkbox-properties.component';

// Declared instead of importing PropertiesPanelModule: a module import alongside declarations
// trips the AOT scope check in these specs (NG0304).
@Component({
  selector: 'aspect-merged-checkbox',
  standalone: false,
  template: '<ng-content></ng-content>'
})
class MockMergedCheckboxComponent {
  @Input() value: boolean | null | undefined;
  @Input() disabled: boolean = false;
}

describe('CheckboxPropertiesComponent', () => {
  let component: CheckboxPropertiesComponent;
  let fixture: ComponentFixture<CheckboxPropertiesComponent>;
  const unitServiceMock = { expertMode: true } as unknown as UnitService;

  const imageButton = () => fixture.debugElement.query(By.css('.media-src-button'));
  const toggleGroup = () => fixture.debugElement.query(By.css('mat-button-toggle-group'));
  const crossOutBox = () => fixture.debugElement.query(By.directive(MockMergedCheckboxComponent));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckboxPropertiesComponent, MockMergedCheckboxComponent],
      imports: [
        MatButtonToggleModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: DialogService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = {
      type: 'checkbox', imgSrc: null, value: false, crossOutChecked: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all three controls for a checkbox in expert mode', () => {
    expect(imageButton()).not.toBeNull();
    expect(toggleGroup()).not.toBeNull();
    expect(crossOutBox()).not.toBeNull();
  });

  it('should emit the chosen preset value', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    toggleGroup().triggerEventHandler('change', { value: true });

    expect(emitted).toEqual([{ property: 'value', value: true }]);
  });

  it('should emit the toggled crossOutChecked', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    crossOutBox().triggerEventHandler('valueChange', true);

    expect(emitted).toEqual([{ property: 'crossOutChecked', value: true }]);
  });

  it('should hide crossOutChecked outside expert mode, keeping the other two', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(crossOutBox()).toBeNull();
    expect(imageButton()).not.toBeNull();
    expect(toggleGroup()).not.toBeNull();
  });

  /* Since #1137 whether this component appears at all is decided by PANEL_SECTIONS, not by the
     component - see panel-sections.spec.ts and the characterization net. What stays its own job is
     the field level: an element that has no imgSrc gets no image button, even though the section is
     offered. */
  it('should leave out a control the element does not have', () => {
    component.combinedProperties = { type: 'checkbox', value: false, crossOutChecked: false };
    fixture.detectChanges();

    expect(imageButton()).toBeNull();
    expect(toggleGroup()).not.toBeNull();
  });

  // A divergent multi selection merges to null; the checkbox renders that as indeterminate.
  it('should pass a divergent crossOutChecked through as null', () => {
    component.combinedProperties = {
      type: 'checkbox', imgSrc: null, value: false, crossOutChecked: null
    };
    fixture.detectChanges();

    expect(crossOutBox().componentInstance.value).toBeNull();
  });

  it('should keep the image button when an image is set', () => {
    component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/png;base64,abc' };
    fixture.detectChanges();

    expect(imageButton()).not.toBeNull();
  });
});

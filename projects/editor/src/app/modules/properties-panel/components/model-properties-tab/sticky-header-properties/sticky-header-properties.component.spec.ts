import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  StickyHeaderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/sticky-header-properties/sticky-header-properties.component';

// Declared instead of importing PropertiesPanelModule: a module import alongside declarations
// trips the AOT scope check in these specs (NG0304).
@Component({
  selector: 'aspect-merged-checkbox',
  standalone: false,
  template: ''
})
class MockMergedCheckboxComponent {
  @Input() value: boolean | null | undefined;
  @Input() disabled: boolean = false;
}

describe('StickyHeaderPropertiesComponent', () => {
  let component: StickyHeaderPropertiesComponent;
  let fixture: ComponentFixture<StickyHeaderPropertiesComponent>;
  const unitServiceMock = { expertMode: true } as unknown as UnitService;

  const checkbox = () => fixture.debugElement.query(By.directive(MockMergedCheckboxComponent));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StickyHeaderPropertiesComponent, MockMergedCheckboxComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: UnitService, useValue: unitServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(StickyHeaderPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = { type: 'table', stickyHeader: false, headerEnabled: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the new value', () => {
    const emitted: { property: string; value: boolean }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    checkbox().triggerEventHandler('valueChange', true);

    expect(emitted).toEqual([{ property: 'stickyHeader', value: true }]);
  });

  it('should render nothing when the property is absent', () => {
    component.combinedProperties = { type: 'text' };
    fixture.detectChanges();

    expect(checkbox()).toBeNull();
  });

  it('should disable the checkbox for a table whose header is off', () => {
    component.combinedProperties = { type: 'table', stickyHeader: false, headerEnabled: false };
    fixture.detectChanges();

    expect(checkbox().componentInstance.disabled).toBe(true);
  });

  it('should not disable the checkbox for a likert, which has no header switch', () => {
    component.combinedProperties = { type: 'likert', stickyHeader: false };
    fixture.detectChanges();

    expect(checkbox().componentInstance.disabled).toBe(false);
  });

  it('should hide the control for a likert outside expert mode', () => {
    unitServiceMock.expertMode = false;
    component.combinedProperties = { type: 'likert', stickyHeader: false };
    fixture.detectChanges();

    expect(checkbox()).toBeNull();
  });

  it('should keep the control for a table outside expert mode', () => {
    unitServiceMock.expertMode = false;
    component.combinedProperties = { type: 'table', stickyHeader: false, headerEnabled: true };
    fixture.detectChanges();

    expect(checkbox()).not.toBeNull();
  });

  // A divergent multi selection merges to null; the checkbox renders that as indeterminate.
  it('should pass a divergent value through as null', () => {
    component.combinedProperties = { type: 'table', stickyHeader: null, headerEnabled: true };
    fixture.detectChanges();

    expect(checkbox().componentInstance.value).toBeNull();
  });
});

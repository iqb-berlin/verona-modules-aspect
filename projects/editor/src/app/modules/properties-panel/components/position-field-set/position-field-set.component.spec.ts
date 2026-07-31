import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { PositionProperties } from 'common/models/elements/property-group-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  PositionFieldSetComponent
} from 'editor/src/app/modules/properties-panel/components/position-field-set/position-field-set.component';

@Component({
  selector: 'aspect-size-input-panel',
  standalone: false,
  template: ''
})
class MockSizeInputPanelComponent {
  @Input() label!: string;
  @Input() value: number | null | undefined;
  @Input() unit: string | null | undefined;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<{ value: number, unit: string }>();
}

describe('PositionFieldSetComponent', () => {
  let component: PositionFieldSetComponent;
  let fixture: ComponentFixture<PositionFieldSetComponent>;

  // Rebuilt per test: one test switches the section to dynamic positioning.
  let unitServiceMock: UnitService;
  const selectionServiceMock = {
    selectedPageIndex: 0,
    selectedSectionIndex: 0
  } as unknown as SelectionService;

  beforeEach(async () => {
    unitServiceMock = {
      unit: { pages: [{ sections: [{ dynamicPositioning: false }] }] }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [PositionFieldSetComponent, MockSizeInputPanelComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SelectionService, useValue: selectionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PositionFieldSetComponent);
    component = fixture.componentInstance;
    component.positionProperties = {
      xPosition: 10,
      yPosition: 20,
      zIndex: 0
    } as PositionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show x/y position fields for static positioning', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<HTMLElement>
    ).map(label => label.textContent);
    expect(labels.some(label => label?.includes('propertiesPanel.xPosition'))).toBe(true);
    expect(labels.some(label => label?.includes('propertiesPanel.yPosition'))).toBe(true);
  });

  it('should emit updateModel when the x position is changed', () => {
    const emitted: { property: string; value: unknown, isInputValid?: boolean | null }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const xInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    xInput.value = '42';
    xInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'xPosition', value: 42, isInputValid: true }]);
  });

  /*
   * A multi-selection whose margins disagree merges the measurement's parts to null. The panel has
   * to see that null - substituting 0 here would let it write a margin nobody entered.
   */
  it('should pass a divergent margin on as null', () => {
    // The margin fields belong to the dynamic-positioning branch of the template.
    unitServiceMock.unit.pages[0].sections[0].dynamicPositioning = true;
    component.positionProperties = {
      ...component.positionProperties, marginTop: { value: null, unit: 'px' }
    } as typeof component.positionProperties;
    fixture.detectChanges();

    const topPanel = fixture.debugElement.queryAll(By.directive(MockSizeInputPanelComponent))
      .map(panel => panel.componentInstance as MockSizeInputPanelComponent)
      .find(panel => panel.label.includes('propertiesPanel.top'));

    expect(topPanel?.value).toBeNull();
    expect(topPanel?.unit).toBe('px');
  });

  it('should hide the z-index field when disabled', async () => {
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.zIndex');

    component.isZIndexDisabled = true;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain('propertiesPanel.zIndex');
  });
});

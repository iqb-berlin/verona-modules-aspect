import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DimensionFieldSetComponent } from 'editor/src/app/components/properties-panel/dimension-field-set/dimension-field-set.component';

describe('DimensionFieldSetComponent', () => {
  let component: DimensionFieldSetComponent;
  let fixture: ComponentFixture<DimensionFieldSetComponent>;
  let elementService: SpyObj<ElementService>;

  const selectedElements = [{ id: 'el1' } as UIElement];
  const unitServiceMock = {
    unit: { pages: [{ sections: [{ dynamicPositioning: true }] }] }
  } as unknown as UnitService;
  const selectionServiceMock = {
    selectedPageIndex: 0,
    selectedSectionIndex: 0,
    isCompoundChildSelected: false,
    getSelectedElements: () => selectedElements
  } as unknown as SelectionService;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateElementsDimensionsProperty']);

    await TestBed.configureTestingModule({
      declarations: [DimensionFieldSetComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: ElementService, useValue: elementService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DimensionFieldSetComponent);
    component = fixture.componentInstance;
    component.dimensions = {
      width: 100,
      height: 50,
      isWidthFixed: false,
      isHeightFixed: false,
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null
    } as DimensionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the fixed width checkbox in dynamic positioning mode', () => {
    const checkboxLabels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).map(checkbox => checkbox.textContent);
    expect(checkboxLabels.some(label => label?.includes('propertiesPanel.isWidthFixed'))).toBe(true);
  });

  it('should delegate dimension updates to the element service', () => {
    component.updateDimensionProperty('width', 200);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'width', 200);
  });

  it('should reset the property to null when a toggle is unchecked', () => {
    component.toggleProperty('minWidth', false);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'minWidth', null);
  });

  it('should not update anything when a toggle is checked', () => {
    component.toggleProperty('minWidth', true);

    expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
  });
});

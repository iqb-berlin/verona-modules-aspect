import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { StateVariable } from 'common/models/state-variable';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { GetStateVariablePipe } from 'editor/src/app/components/properties-panel/pipes/get-state-variable.pipe';
import { ScrollPageIndexPipe } from 'editor/src/app/components/properties-panel/pipes/scroll-page-index.pipe';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  ActionPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-properties/action-properties.component';

@Component({
  selector: 'aspect-action-param-state-variable',
  standalone: false,
  template: ''
})
class MockActionParamStateVariableComponent {
  @Input() stateVariable!: StateVariable;
  @Input() stateVariables!: StateVariable[];
  @Output() stateVariableChange = new EventEmitter<StateVariable>();
}

describe('ActionPropertiesComponent', () => {
  let component: ActionPropertiesComponent;
  let fixture: ComponentFixture<ActionPropertiesComponent>;

  const textElementMock = { getAnchorIDs: () => ['anchor-1', 'anchor-2'] };
  const unitServiceMock = {
    unit: {
      getAllElements: () => [textElementMock],
      stateVariables: [],
      pages: []
    }
  } as unknown as UnitService;
  const selectionServiceMock = { selectedPageIndex: 0 } as unknown as SelectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionPropertiesComponent,
        MockActionParamStateVariableComponent,
        GetStateVariablePipe,
        ScrollPagesPipe,
        ScrollPageIndexPipe
      ],
      imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SelectionService, useValue: selectionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { action: null, actionParam: null } as unknown as UIElement;
    component.actions = ['unitNav', 'pageNav', 'highlightText', 'stateVariableChange'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should collect anchor ids from all text elements', () => {
    expect(component.anchorIds).toEqual(['anchor-1', 'anchor-2']);
  });

  it('should emit a null actionParam on reset', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    component.resetActionParam();

    expect(emitted).toEqual([{ property: 'actionParam', value: null }]);
  });

  it('should reset the actionParam and emit the new action on selection change', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const actionSelect = fixture.debugElement.query(By.css('mat-select'));
    actionSelect.triggerEventHandler('selectionChange', { value: 'unitNav' });

    expect(emitted).toEqual([
      { property: 'actionParam', value: null },
      { property: 'action', value: 'unitNav' }
    ]);
  });

  it('should show a hint instead of the state variable editor when none exist', () => {
    component.combinedProperties = {
      action: 'stateVariableChange', actionParam: null
    } as unknown as UIElement;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.addStateVariables');
    expect(fixture.debugElement.query(By.css('aspect-action-param-state-variable'))).toBeNull();
  });
});

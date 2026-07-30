import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import {
  CombinedProperties
} from 'editor/src/app/modules/properties-panel/components/element-properties-panel/element-properties-panel.component';
import {
  MarkingPanelPropertiesComponent
} from './marking-panel-properties.component';

@Component({ selector: 'aspect-highlight-properties', standalone: false, template: '' })
class MockHighlightPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() disabled!: boolean;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

describe('MarkingPanelPropertiesComponent', () => {
  let component: MarkingPanelPropertiesComponent;
  let fixture: ComponentFixture<MarkingPanelPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarkingPanelPropertiesComponent,
        MockHighlightPropertiesComponent
      ],
      imports: [
        CommonModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarkingPanelPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'marking-panel',
      highlightableYellow: true,
      highlightableTurquoise: false,
      highlightableOrange: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the highlight properties for marking panels', () => {
    const highlightProperties = fixture.debugElement.query(By.directive(MockHighlightPropertiesComponent));
    expect(highlightProperties).not.toBeNull();
    expect((highlightProperties.componentInstance as MockHighlightPropertiesComponent).disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.marking');
  });

  /* The component no longer checks the element type: since #1137 PANEL_SECTIONS decides whether
     this section is offered, and it is offered to the marking panel alone. Covered by
     panel-sections.spec.ts and by the characterization net, which renders all 30 types. */

  it('should forward updateModel events of the highlight properties', () => {
    const highlightProperties = fixture.debugElement
      .query(By.directive(MockHighlightPropertiesComponent))
      .componentInstance as MockHighlightPropertiesComponent;

    highlightProperties.updateModel.emit({ property: 'highlightableOrange', value: true });

    expect(emitted).toEqual([{ property: 'highlightableOrange', value: true }]);
  });
});

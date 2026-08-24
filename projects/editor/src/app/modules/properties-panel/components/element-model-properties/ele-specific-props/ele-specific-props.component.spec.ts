// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { UIElementType, UIElementValue } from 'common/models/ui-element-interfaces';
import { UIElement } from 'common/models/elements/element';
import { panelSectionsOf } from 'editor/src/app/modules/properties-panel/models/panel-sections';
import {
  CombinedProperties
} from 'editor/src/app/modules/properties-panel/components/element-properties-panel/element-properties-panel.component';
import {
  EleSpecificPropsComponent
} from './ele-specific-props.component';

@Component({ selector: 'aspect-math-field-props', standalone: false, template: '' })
class MockMathFieldPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-border-properties', standalone: false, template: '' })
class MockBorderPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-math-table-properties', standalone: false, template: '' })
class MockMathTablePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-button-properties', standalone: false, template: '' })
class MockButtonPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-drop-list-properties', standalone: false, template: '' })
class MockDropListPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-geometry-props', standalone: false, template: '' })
class MockGeometryPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-hotspot-props', standalone: false, template: '' })
class MockHotspotPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-slider-properties', standalone: false, template: '' })
class MockSliderPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-text-props', standalone: false, template: '' })
class MockTextPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-marking-panel-properties', standalone: false, template: '' })
class MockMarkingPanelPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-table-properties', standalone: false, template: '' })
class MockTablePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-widget-periodic-table-properties', standalone: false, template: '' })
class MockWidgetPeriodicTablePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-widget-molecule-editor-properties', standalone: false, template: '' })
class MockWidgetMoleculeEditorPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

describe('EleSpecificPropsComponent', () => {
  let component: EleSpecificPropsComponent;
  let fixture: ComponentFixture<EleSpecificPropsComponent>;

  /** What the real parent passes down: the sections the selected element type has (#1137). */
  const showFor = (type: UIElementType) => panelSectionsOf([{ type } as UIElement]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EleSpecificPropsComponent,
        MockMathFieldPropsComponent,
        MockBorderPropertiesComponent,
        MockMathTablePropertiesComponent,
        MockButtonPropertiesComponent,
        MockDropListPropertiesComponent,
        MockGeometryPropsComponent,
        MockHotspotPropsComponent,
        MockSliderPropertiesComponent,
        MockTextPropsComponent,
        MockMarkingPanelPropertiesComponent,
        MockTablePropertiesComponent,
        MockWidgetPeriodicTablePropertiesComponent,
        MockWidgetMoleculeEditorPropertiesComponent
      ],
      imports: [CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EleSpecificPropsComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { type: 'frame' };
    component.show = showFor('frame');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the border properties for frame elements only', () => {
    expect(fixture.debugElement.query(By.css('aspect-border-properties'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('aspect-button-properties'))).toBeNull();
    expect(fixture.debugElement.query(By.css('aspect-math-field-props'))).toBeNull();
  });

  it('should switch the rendered panel with the element type', () => {
    component.combinedProperties = { type: 'button' };
    component.show = showFor('button');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('aspect-border-properties'))).toBeNull();
    expect(fixture.debugElement.query(By.css('aspect-button-properties'))).not.toBeNull();
  });

  /* The section map is the outer gate: without it nothing is offered, whatever the type says. That
     is what makes a new element type without a `PANEL_SECTIONS` entry visible instead of silent. */
  it('should render nothing while no sections are given', () => {
    component.show = panelSectionsOf([]);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('aspect-border-properties'))).toBeNull();
  });

  it('should forward updateModel events from child panels', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    const borderProperties = fixture.debugElement
      .query(By.directive(MockBorderPropertiesComponent))
      .componentInstance as MockBorderPropertiesComponent;
    borderProperties.updateModel.emit({ property: 'hasBorderTop', value: true });

    expect(emitted).toEqual([{ property: 'hasBorderTop', value: true }]);
  });
});

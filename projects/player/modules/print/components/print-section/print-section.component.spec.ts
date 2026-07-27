/* eslint-disable max-classes-per-file */
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { UIElement } from 'common/models/elements/element';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/utils/section-counter';
import { PrintMode } from 'player/modules/verona/models/verona';
import { PrintSectionComponent } from './print-section.component';

@Component({
  selector: 'aspect-print-element',
  template: '',
  standalone: false
})
class MockPrintElementComponent {
  @Input() elementModel!: UIElement;
  @Input() printMode!: PrintMode;
  @Input() pageIndex!: number;
}

@Pipe({ name: 'measure', standalone: false })
class MockMeasurePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(): string {
    return 'auto';
  }
}

describe('PrintSectionComponent', () => {
  let component: PrintSectionComponent;
  let fixture: ComponentFixture<PrintSectionComponent>;

  /* The playerModules test target keeps the strict model instantiation, so the section is
     created from complete properties; the elements are added afterwards. */
  const createSection = (elements: UIElement[], dynamicPositioning: boolean): Section => {
    const section = new Section({
      elements: [],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      visibilityDelay: 0,
      animatedVisibility: false,
      enableReHide: false,
      logicalConnectiveOfRules: 'disjunction',
      visibilityRules: [],
      ignoreNumbering: false
    });
    section.elements = elements as PositionedUIElement[];
    return section;
  };

  const createElement = (id: string): UIElement => new TextFieldElement({ type: 'text-field', id, alias: id });

  beforeEach(async () => {
    SectionCounter.reset();

    await TestBed.configureTestingModule({
      declarations: [PrintSectionComponent, MockPrintElementComponent, MockMeasurePipe],
      imports: [CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintSectionComponent);
    component = fixture.componentInstance;
    component.printMode = 'on';
    component.pageIndex = 0;
    component.section = createSection([createElement('text-field_1')], false);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should print every element of a static section', () => {
    component.section = createSection([createElement('text-field_1'), createElement('text-field_2')], false);

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(MockPrintElementComponent)).length).toBe(2);
    expect(fixture.debugElement.query(By.css('.static-section'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.dynamic-section'))).toBeNull();
  });

  it('should print the elements of a dynamic section in a grid', () => {
    component.section = createSection([createElement('text-field_1')], true);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.dynamic-section'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.static-section'))).toBeNull();
  });

  it('should hand print mode and page index over to the elements', () => {
    component.printMode = 'on-with-ids';
    component.pageIndex = 2;

    fixture.detectChanges();

    const printElement = fixture.debugElement.query(By.directive(MockPrintElementComponent))
      .componentInstance as MockPrintElementComponent;
    expect(printElement.printMode).toBe('on-with-ids');
    expect(printElement.pageIndex).toBe(2);
  });

  it('should not number the section without section numbering', () => {
    fixture.detectChanges();

    expect(component.sectionCounter).toBeUndefined();
  });

  it('should number the section with section numbering', () => {
    component.sectionNumbering = { enableSectionNumbering: true, sectionNumberingPosition: 'left' };

    fixture.detectChanges();

    expect(component.sectionCounter).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('1.');
  });

  it('should skip sections that are excluded from numbering', () => {
    component.sectionNumbering = { enableSectionNumbering: true, sectionNumberingPosition: 'left' };
    component.section.ignoreNumbering = true;

    fixture.detectChanges();

    expect(component.sectionCounter).toBeUndefined();
  });

  it('should align the numbering according to its position', () => {
    component.sectionNumbering = { enableSectionNumbering: true, sectionNumberingPosition: 'above' };

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.section-wrapper')).nativeElement.classList)
      .toContain('column-align');
  });
});

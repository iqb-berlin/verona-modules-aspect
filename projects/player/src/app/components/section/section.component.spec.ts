/* eslint-disable max-classes-per-file */
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { UIElement } from 'common/models/elements/element';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/utils/section-counter';
import { SectionComponent } from './section.component';

@Pipe({
  name: 'measure',
  standalone: false
})
class MockMeasurePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(): string {
    return '';
  }
}

@Component({
  selector: 'aspect-element-group-selection',
  template: '',
  standalone: false
})
class MockElementGroupSelectionComponent {
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;
}

describe('SectionComponent', () => {
  let component: SectionComponent;
  let fixture: ComponentFixture<SectionComponent>;

  const createSection = (elements: UIElement[], dynamicPositioning: boolean): Section => {
    const section = new Section();
    section.elements = elements as PositionedUIElement[];
    section.dynamicPositioning = dynamicPositioning;
    return section;
  };

  const createElement = (id: string): UIElement => new TextFieldElement({ type: 'text-field', id, alias: id });

  beforeEach(async () => {
    SectionCounter.reset();

    await TestBed.configureTestingModule({
      declarations: [
        SectionComponent,
        MockMeasurePipe,
        MockElementGroupSelectionComponent
      ],
      imports: [MatDialogModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionComponent);
    component = fixture.componentInstance;
    component.pageIndex = 0;
    component.section = createSection([createElement('text-field_1')], true);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show the elements of a dynamic section in a grid', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.dynamic-section'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.static-section'))).toBeNull();
    expect(fixture.debugElement.queryAll(By.directive(MockElementGroupSelectionComponent)).length).toBe(1);
  });

  it('should show the elements of a static section at their position', () => {
    component.section = createSection([createElement('text-field_1'), createElement('text-field_2')], false);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.static-section'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.directive(MockElementGroupSelectionComponent)).length).toBe(2);
  });

  it('should hand the page index over to the elements', () => {
    component.pageIndex = 3;

    fixture.detectChanges();

    expect((fixture.debugElement.query(By.directive(MockElementGroupSelectionComponent))
      .componentInstance as MockElementGroupSelectionComponent).pageIndex).toBe(3);
  });

  it('should not number the section without section numbering', () => {
    fixture.detectChanges();

    expect(component.sectionCounter).toBeUndefined();
  });

  it('should number the sections consecutively', () => {
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

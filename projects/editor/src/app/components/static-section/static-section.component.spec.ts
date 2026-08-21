import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { Section } from 'common/models/section';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { StaticSectionComponent } from 'editor/src/app/components/static-section/static-section.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-editor-static-overlay',
  standalone: false,
  template: ''
})
class MockStaticOverlayComponent {
  @Input() section!: Section;
  @Input() element!: PositionedUIElement;
  @Output() elementSelected = new EventEmitter<unknown>();
}

describe('StaticSectionComponent', () => {
  let component: StaticSectionComponent;
  let fixture: ComponentFixture<StaticSectionComponent>;
  let elementService: SpyObj<ElementService>;
  let section: Section;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['addElementToSection']);
    section = {
      elements: [
        { id: 'text_1' } as unknown as PositionedUIElement,
        { id: 'text_2' } as unknown as PositionedUIElement
      ],
      height: 400,
      backgroundColor: '#ffffff'
    } as unknown as Section;

    await TestBed.configureTestingModule({
      declarations: [StaticSectionComponent, MockStaticOverlayComponent],
      imports: [CommonModule],
      providers: [
        { provide: UnitService, useValue: {} as UnitService },
        { provide: ElementService, useValue: elementService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StaticSectionComponent);
    component = fixture.componentInstance;
    component.section = section;
    component.isSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one overlay per section element', () => {
    expect(fixture.nativeElement.querySelectorAll('aspect-editor-static-overlay').length).toBe(2);
  });

  it('should mark the section wrapper as selected', () => {
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.section-wrapper');
    expect(wrapper.style.outline).toBe('dotted 1px');

    component.isSelected = true;
    fixture.detectChanges();

    // the browser normalises the shorthand to "<color> <style> <width>"
    expect(wrapper.style.outline).toBe('rgb(255, 64, 129) solid 2px');
  });

  it('should add a dropped element at the position relative to the section', () => {
    vi.spyOn(component.sectionElement.nativeElement as HTMLElement, 'getBoundingClientRect')
      .mockReturnValue({ left: 20, top: 50 } as DOMRect);
    const preventDefault = vi.fn();
    const dragEvent = {
      preventDefault,
      clientX: 120,
      clientY: 90,
      dataTransfer: { getData: vi.fn().mockReturnValue('button') }
    } as unknown as DragEvent;

    component.newElementDropped(dragEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(elementService.addElementToSection)
      .toHaveBeenCalledWith('button', section, { x: 100, y: 40 });
  });
});

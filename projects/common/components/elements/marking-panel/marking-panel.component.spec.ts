import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  MarkingPanelElement, MarkingPanelProperties
} from 'common/models/elements/marking-panel';
import { TextElement } from 'common/models/elements/text';
import { MarkingData } from 'common/models/marking-data';
import { MarkingPanelComponent } from './marking-panel.component';

@Component({
  selector: 'aspect-text-marking-bar',
  template: '',
  standalone: false
})
class MockTextMarkingBarComponent {
  @Input() elementModel!: TextElement | MarkingPanelElement;
  @Input() selectedColor!: string;
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Input() showHint!: boolean;
  @Output() markingDataChanged = new EventEmitter<MarkingData>();
}

describe('MarkingPanelComponent', () => {
  let component: MarkingPanelComponent;
  let fixture: ComponentFixture<MarkingPanelComponent>;

  const getMarkingBar = (): MockTextMarkingBarComponent => fixture.debugElement
    .query(element => element.componentInstance instanceof MockTextMarkingBarComponent)
    .componentInstance as MockTextMarkingBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarkingPanelComponent,
        MockTextMarkingBarComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkingPanelComponent);
    component = fixture.componentInstance;
    component.elementModel = new MarkingPanelElement({
      type: 'marking-panel',
      id: 'test-id',
      alias: 'test-alias'
    } as Partial<MarkingPanelProperties>);
    component.markingMode = 'selection';
    component.showHint = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass "none" to the marking bar when no color is selected', () => {
    expect(getMarkingBar().selectedColor).toBe('none');
  });

  it('should pass the selected color to the marking bar', () => {
    component.selectedColor = 'yellow';
    fixture.detectChanges();
    expect(getMarkingBar().selectedColor).toBe('yellow');
  });

  it('should re-emit marking data with the element id', () => {
    const emitSpy = vi.spyOn(component.markingPanelMarkingDataChanged, 'emit');
    const markingData: MarkingData = {
      active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow'
    };
    getMarkingBar().markingDataChanged.emit(markingData);
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test-id', markingData });
  });
});

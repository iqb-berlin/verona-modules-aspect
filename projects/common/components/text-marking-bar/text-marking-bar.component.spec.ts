import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TextElement, TextProperties } from 'common/models/elements/text';
import { TextMarkingBarComponent } from './text-marking-bar.component';

@Component({
  selector: 'aspect-text-marking-button',
  template: '',
  standalone: false
})
class MockTextMarkingButtonComponent {
  @Input() color!: string;
  @Input() isMarkingSelected!: boolean;
  @Input() mode!: 'mark' | 'delete';
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Output() selectedMarkingChanged = new EventEmitter<{
    isSelected: boolean,
    mode: 'mark' | 'delete',
    color: string,
  }>();
}

describe('TextMarkingBarComponent', () => {
  let component: TextMarkingBarComponent;
  let fixture: ComponentFixture<TextMarkingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextMarkingBarComponent,
        MockTextMarkingButtonComponent
      ],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextMarkingBarComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextElement({
      type: 'text',
      id: 'test-id',
      alias: 'test-alias',
      text: '<p>Test text</p>',
      highlightableYellow: true,
      highlightableTurquoise: false,
      highlightableOrange: true
    } as Partial<TextProperties>);
    component.markingMode = 'selection';
    component.selectedColor = 'none';
    component.sticky = false;
    component.showHint = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one button per enabled color plus a delete button', () => {
    const buttons = fixture.debugElement.queryAll(By.directive(MockTextMarkingButtonComponent));
    expect(buttons.length).toBe(3);
    const colors = buttons.map(button => button.componentInstance.color);
    expect(colors).toEqual([
      TextElement.selectionColors.yellow,
      TextElement.selectionColors.orange,
      TextElement.selectionColors.delete
    ]);
  });

  it('should NOT render a delete button in word marking mode', () => {
    component.markingMode = 'word';
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.directive(MockTextMarkingButtonComponent));
    const modes = buttons.map(button => button.componentInstance.mode);
    expect(buttons.length).toBe(2);
    expect(modes).not.toContain('delete');
  });

  it('should emit marking data with the resolved color name on selection', () => {
    const emitSpy = vi.spyOn(component.markingDataChanged, 'emit');
    component.changeMarkingData({ isSelected: true, color: TextElement.selectionColors.yellow, mode: 'mark' });
    expect(emitSpy).toHaveBeenCalledWith({
      active: true,
      mode: 'mark',
      color: TextElement.selectionColors.yellow,
      colorName: 'yellow'
    });
    expect(component.selectedColor).toBe('yellow');
  });

  it('should emit marking data with colorName "none" on deselection', () => {
    const emitSpy = vi.spyOn(component.markingDataChanged, 'emit');
    component.changeMarkingData({ isSelected: false, color: TextElement.selectionColors.yellow, mode: 'mark' });
    expect(emitSpy).toHaveBeenCalledWith({
      active: false,
      mode: 'mark',
      color: TextElement.selectionColors.yellow,
      colorName: 'none'
    });
    expect(component.selectedColor).toBe('none');
  });

  it('should resolve color names from color values', () => {
    expect(component.getColorName(TextElement.selectionColors.turquoise)).toBe('turquoise');
    expect(component.getColorName('#123456')).toBe('none');
  });

  it('should pass button events through to markingDataChanged', () => {
    const emitSpy = vi.spyOn(component.markingDataChanged, 'emit');
    const firstButton = fixture.debugElement
      .query(By.directive(MockTextMarkingButtonComponent)).componentInstance;
    firstButton.selectedMarkingChanged
      .emit({ isSelected: true, color: TextElement.selectionColors.yellow, mode: 'mark' });
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should show the hint only when showHint is set', () => {
    expect(fixture.nativeElement.querySelector('.hint')).toBeNull();
    component.showHint = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.hint')).not.toBeNull();
  });
});

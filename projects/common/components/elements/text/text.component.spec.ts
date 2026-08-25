import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement, TextProperties } from 'common/models/elements/text';
import { MarkingData } from 'common/models/marking-data';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { TextComponent } from './text.component';

@Component({
  selector: 'aspect-text-marking-bar',
  template: '',
  standalone: false
})
class MockTextMarkingBarComponent {
  @Input() elementModel!: TextElement;
  @Input() sticky!: boolean;
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Input() showHint!: boolean;
  @Input() selectedColor!: string;
  @Output() markingDataChanged = new EventEmitter<MarkingData>();
}

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  const createTextElement = (properties: Partial<TextProperties> = {}): TextElement => new TextElement({
    type: 'text',
    id: 'test-id',
    alias: 'test-alias',
    text: '<p>Test text</p>',
    markingMode: 'selection',
    markingPanels: [],
    highlightableOrange: false,
    highlightableTurquoise: false,
    highlightableYellow: false,
    hasSelectionPopup: false,
    columnCount: 1,
    styling: {
      ...PropertyGroupGenerators.generateBasicStyleProps(),
      lineHeight: 135
    },
    ...properties
  } as Partial<TextProperties>);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextComponent,
        MockTextMarkingBarComponent,
        SafeResourceHTMLPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    component.elementModel = createTextElement();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the text of the element model', () => {
    fixture.detectChanges();
    const textContainer: HTMLElement = fixture.nativeElement.querySelector('.text-container');
    expect(textContainer.querySelector('p')?.textContent).toBe('Test text');
  });

  it('should render the saved text instead of the element model text', () => {
    component.savedText = '<p>Saved text</p>';
    fixture.detectChanges();
    const textContainer: HTMLElement = fixture.nativeElement.querySelector('.text-container');
    expect(textContainer.textContent).toContain('Saved text');
    expect(textContainer.textContent).not.toContain('Test text');
  });

  it('should show the marking bar only when a highlight color is enabled', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-text-marking-bar')).toBeNull();

    component.elementModel = createTextElement({ highlightableYellow: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-text-marking-bar')).not.toBeNull();
  });

  it('should emit selectedColorChanged when the selected color changes', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.selectedColorChanged, 'emit');
    component.selectedColor.next('yellow');
    expect(emitSpy).toHaveBeenCalledWith('yellow');
  });

  it('should emit textSelectionStart on pointerdown in selection mode with highlightable colors', () => {
    component.elementModel = createTextElement({ markingMode: 'selection', highlightableYellow: true });
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.textSelectionStart, 'emit');
    const event = new PointerEvent('pointerdown');
    fixture.nativeElement.querySelector('.text-container').dispatchEvent(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should NOT emit textSelectionStart when nothing is highlightable or mode is not selection', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.textSelectionStart, 'emit');
    component.startTextSelection(new PointerEvent('pointerdown'));
    expect(emitSpy).not.toHaveBeenCalled();

    component.elementModel = createTextElement({ markingMode: 'word', highlightableYellow: true });
    component.startTextSelection(new PointerEvent('pointerdown'));
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should only show the hint for an incomplete marking range in range mode', () => {
    component.elementModel = createTextElement({ markingMode: 'range', highlightableYellow: true });
    fixture.detectChanges();
    expect(component.markingRange).not.toBeNull();

    component.markingRange?.next({ first: 1, second: null });
    expect(component.showHint).toBe(true);

    component.markingRange?.next({ first: 1, second: 5 });
    expect(component.showHint).toBe(false);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import {
  TextMarkingButtonSvgComponent
} from 'common/components/text-group-elements/text-marking-button-svg/text-marking-button-svg.component';
import { TextMarkingButtonComponent } from './text-marking-button.component';

describe('TextMarkingButtonComponent', () => {
  let component: TextMarkingButtonComponent;
  let fixture: ComponentFixture<TextMarkingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextMarkingButtonComponent, TextMarkingButtonSvgComponent],
      imports: [MatButtonModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextMarkingButtonComponent);
    component = fixture.componentInstance;
    component.color = '#f9f871';
    component.mode = 'mark';
    component.markingMode = 'selection';
    component.isMarkingSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the selection state and emit it on selectMarking', () => {
    const emitSpy = vi.spyOn(component.selectedMarkingChanged, 'emit');
    component.selectMarking();
    expect(component.isMarkingSelected).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith({ isSelected: true, mode: 'mark', color: '#f9f871' });

    component.selectMarking();
    expect(component.isMarkingSelected).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith({ isSelected: false, mode: 'mark', color: '#f9f871' });
  });

  it('should select the marking on pointerdown', () => {
    const emitSpy = vi.spyOn(component.selectedMarkingChanged, 'emit');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.marking-button');
    button.dispatchEvent(new PointerEvent('pointerdown'));
    expect(emitSpy).toHaveBeenCalledWith({ isSelected: true, mode: 'mark', color: '#f9f871' });
  });

  it('should pass the marking mode as button type to the icon in mark mode', () => {
    const svgComponent = fixture.debugElement
      .query(By.directive(TextMarkingButtonSvgComponent)).componentInstance;
    expect(svgComponent.buttonType).toBe('selection');
  });

  it('should pass "delete" as button type to the icon in delete mode', () => {
    component.mode = 'delete';
    fixture.detectChanges();
    const svgComponent = fixture.debugElement
      .query(By.directive(TextMarkingButtonSvgComponent)).componentInstance;
    expect(svgComponent.buttonType).toBe('delete');
  });

  it('should mark the button border black only while selected', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.marking-button');
    expect(button.style.borderColor).not.toBe('black');
    component.isMarkingSelected = true;
    fixture.detectChanges();
    expect(button.style.borderColor).toBe('black');
  });
});

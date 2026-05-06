import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { MathKeyboardPreset } from 'common/interfaces';
import { AreaSegmentComponent } from './area-segment.component';

@Component({
  selector: 'aspect-math-input',
  template: '',
  standalone: false
})
class MockMathInputComponent {
  @Input() value!: string;
  @Input() readonly!: boolean;
  @Input() mathKeyboardPresets!: MathKeyboardPreset[];
  @Input() fullWidth!: boolean;
  @Output() valueChange = new EventEmitter<string>();
  @Output() focusIn = new EventEmitter<HTMLElement>();
  @Output() focusOut = new EventEmitter<HTMLElement>();
  // eslint-disable-next-line class-methods-use-this
  setFocus() {}
}

describe('AreaSegmentComponent', () => {
  let component: AreaSegmentComponent;
  let fixture: ComponentFixture<AreaSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockMathInputComponent],
      imports: [AreaSegmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AreaSegmentComponent);
    component = fixture.componentInstance;
    component.type = 'text';
    component.value = 'test';
    component.index = 0;
    component.selectedFocus = new BehaviorSubject<number>(0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render aspect-area-input when type is text', () => {
    const areaInput = fixture.nativeElement.querySelector('aspect-area-input');
    expect(areaInput).toBeTruthy();
    const mathInput = fixture.nativeElement.querySelector('aspect-math-input');
    expect(mathInput).toBeFalsy();
  });

  it('should render aspect-math-input when type is math', () => {
    component.type = 'math';
    fixture.detectChanges();
    const areaInput = fixture.nativeElement.querySelector('aspect-area-input');
    expect(areaInput).toBeFalsy();
    const mathInput = fixture.nativeElement.querySelector('aspect-math-input');
    expect(mathInput).toBeTruthy();
  });

  it('should emit remove event with correct index', () => {
    spyOn(component.remove, 'emit');
    component.onRemove('Backspace');
    expect(component.remove.emit).toHaveBeenCalledWith(-1);
    component.onRemove('Delete');
    expect(component.remove.emit).toHaveBeenCalledWith(1);
  });
});

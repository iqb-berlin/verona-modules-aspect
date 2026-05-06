import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaTextInputComponent } from './area-text-input.component';

describe('AreaTextInputComponent', () => {
  let component: AreaTextInputComponent;
  let fixture: ComponentFixture<AreaTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaTextInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AreaTextInputComponent);
    component = fixture.componentInstance;
    component.value = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueChanged on input', () => {
    spyOn(component.valueChanged, 'emit');
    const span = fixture.nativeElement.querySelector('span');
    span.textContent = 'new value';
    component.onInput();
    expect(component.valueChanged.emit).toHaveBeenCalledWith('new value');
  });

  it('should set display type based on value', () => {
    const span = fixture.nativeElement.querySelector('span');
    span.textContent = '';
    component.onInput();
    expect(component.displayType).toBe('inline-block');

    span.textContent = 'content';
    component.onInput();
    expect(component.displayType).toBe('inline');
  });

  it('should emit remove event on keyup if removePressed was set', () => {
    spyOn(component.remove, 'emit');
    component.removePressed = true;
    const event = new KeyboardEvent('keyup', { key: 'Backspace' });
    component.keyUp(event);
    expect(component.remove.emit).toHaveBeenCalledWith('Backspace');
    expect(component.removePressed).toBeFalse();
  });
});

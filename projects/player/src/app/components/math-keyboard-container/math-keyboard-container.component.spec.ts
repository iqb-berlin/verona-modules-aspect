import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MathKeyboardService } from 'player/src/app/services/math-keyboard.service';
import { MathKeyboardContainerComponent } from './math-keyboard-container.component';

describe('MathKeyboardContainerComponent', () => {
  let component: MathKeyboardContainerComponent;
  let fixture: ComponentFixture<MathKeyboardContainerComponent>;
  let mathKeyboardService: SpyObj<MathKeyboardService> & { keyboardHeight: number };
  let addEventListener: ReturnType<typeof vi.spyOn>;

  /* window.mathVirtualKeyboard is provided by mathlive and cannot be replaced, so its
     members are stubbed individually. */
  const setKeyboardHeight = (height: number): void => {
    vi.spyOn(window.mathVirtualKeyboard, 'boundingRect', 'get')
      .mockReturnValue({ height } as DOMRect);
  };

  beforeEach(async () => {
    addEventListener = vi.spyOn(window.mathVirtualKeyboard, 'addEventListener');
    setKeyboardHeight(0);

    mathKeyboardService = Object.assign(
      createSpyObj<MathKeyboardService>(['scrollElement']),
      { keyboardHeight: 0 }
    );

    await TestBed.configureTestingModule({
      declarations: [MathKeyboardContainerComponent],
      providers: [{ provide: MathKeyboardService, useValue: mathKeyboardService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MathKeyboardContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should offer its container element to the math virtual keyboard', () => {
    expect(window.mathVirtualKeyboard.container)
      .toBe(fixture.debugElement.query(By.css('.math-keyboard-container')).nativeElement);
  });

  it('should listen for geometry changes of the math virtual keyboard', () => {
    expect(addEventListener).toHaveBeenCalledWith('geometrychange', expect.any(Function));
  });

  it('should stop listening for geometry changes when destroyed', () => {
    const removeEventListener = vi.spyOn(window.mathVirtualKeyboard, 'removeEventListener');
    const registeredListener = addEventListener.mock.calls[0][1];

    component.ngOnDestroy();

    /* The same reference, not merely a function: removeEventListener matches by identity (#1123). */
    expect(removeEventListener).toHaveBeenCalledWith('geometrychange', registeredListener);
  });

  it('should take over the keyboard height and scroll the input into view', fakeAsync(() => {
    setKeyboardHeight(300);

    component.updateKeyboard();
    tick();

    expect(mathKeyboardService.keyboardHeight).toBe(300);
    expect(mathKeyboardService.scrollElement).toHaveBeenCalled();
  }));

  it('should not scroll while the keyboard has no height', fakeAsync(() => {
    setKeyboardHeight(0);

    component.updateKeyboard();
    tick();

    expect(mathKeyboardService.keyboardHeight).toBe(0);
    expect(mathKeyboardService.scrollElement).not.toHaveBeenCalled();
  }));

  it('should size its container according to the keyboard height', fakeAsync(() => {
    setKeyboardHeight(300);

    component.updateKeyboard();
    tick();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.math-keyboard-container')).nativeElement.style.height)
      .toBe('300px');
  }));
});

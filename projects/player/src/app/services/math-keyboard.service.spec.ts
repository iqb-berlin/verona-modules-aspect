import { TestBed } from '@angular/core/testing';
import { MathfieldElement } from '@iqb/mathlive';
import { MathFieldComponent } from 'common/components/elements/math-field/math-field.component';
import { MathKeyboardService } from './math-keyboard.service';

describe('MathKeyboardService', () => {
  let service: MathKeyboardService;
  let inputElement: MathfieldElement;
  let elementComponent: MathFieldComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MathKeyboardService);
    inputElement = document.createElement('div') as unknown as MathfieldElement;
    elementComponent = { domElement: document.createElement('div') } as unknown as MathFieldComponent;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open for a focused math input', () => {
    const isOpen = service.toggle({ inputElement, focused: true }, elementComponent);

    expect(isOpen).toBe(true);
    expect(service.isOpen).toBe(true);
    expect(service.inputElement).toBe(inputElement);
    expect(service.elementComponent).toBe(elementComponent);
  });

  it('should close for a blurred math input', () => {
    service.toggle({ inputElement, focused: true }, elementComponent);

    const isOpen = service.toggle({ inputElement, focused: false }, elementComponent);

    expect(isOpen).toBe(false);
    expect(service.isOpen).toBe(false);
  });

  it('should keep the current input element when closing', () => {
    service.toggle({ inputElement, focused: true }, elementComponent);

    service.close();

    expect(service.inputElement).toBe(inputElement);
    expect(service.isOpen).toBe(false);
  });
});

import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { ScrollToInputService } from './scroll-to-input.service';

/* The service is abstract, so it is tested through a minimal concrete subclass. */
@Injectable()
class TestScrollToInputService extends ScrollToInputService {}

describe('ScrollToInputService', () => {
  let service: TestScrollToInputService;
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let viewportHeight: number;
  let keyboardHeight: number;

  const setElementBounds = (bottom: number, height: number): void => {
    service.elementComponent = {
      domElement: {
        scrollIntoView,
        getBoundingClientRect: () => ({ bottom, height } as DOMRect)
      }
    } as unknown as TextInputComponentType;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TestScrollToInputService] });
    service = TestBed.inject(TestScrollToInputService);
    scrollIntoView = vi.fn();
    viewportHeight = window.innerHeight;
    keyboardHeight = Math.round(viewportHeight / 2);
    service.keyboardHeight = keyboardHeight;
    service.isOpen = true;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should center an element that is hidden by the keyboard', () => {
    setElementBounds(viewportHeight - keyboardHeight + 10, 10);

    service.scrollElement();

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
  });

  it('should scroll a hidden element to the start when the remaining view is too small', () => {
    setElementBounds(viewportHeight - keyboardHeight + 10, viewportHeight);

    service.scrollElement();

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });

  it('should not scroll an element that is not hidden by the keyboard', () => {
    setElementBounds(viewportHeight - keyboardHeight - 10, 10);

    service.scrollElement();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('should not scroll while the keyboard is closed', () => {
    service.isOpen = false;
    setElementBounds(viewportHeight - keyboardHeight + 10, 10);

    service.scrollElement();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

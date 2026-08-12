import { fakeAsync, tick } from '@angular/core/testing';
import { config, Subject } from 'rxjs';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from './text-marking-support';

describe('TextMarkingSupport', () => {
  let support: TextMarkingSupport;
  let pointerUp: Subject<PointerEvent>;
  let pointerDown: Subject<PointerEvent>;
  let textContainer: HTMLElement;
  let elementComponent: TextComponent;

  /*
   * RxJS reports the error of a subscription without an error handler asynchronously through
   * setTimeout. Collecting those errors here keeps them out of the console and lets a test
   * assert their absence instead.
   */
  const collectUnhandledErrors = (action: () => void): unknown[] => {
    const unhandledErrors: unknown[] = [];
    const restoreOnUnhandledError = config.onUnhandledError;
    config.onUnhandledError = (error: unknown) => { unhandledErrors.push(error); };
    try {
      action();
      tick();
    } finally {
      config.onUnhandledError = restoreOnUnhandledError;
    }
    return unhandledErrors;
  };

  const selectTextContainerContent = (): void => {
    const range = document.createRange();
    range.selectNodeContents(textContainer.firstChild as Node);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  /* Opens the marking bar the way the component does: a text selection that is released
   * without an active marking colour. The bar opens delayed by 100ms. */
  const openMarkingBar = (): void => {
    selectTextContainerContent();
    support.startTextSelection(new PointerEvent('pointerdown'), elementComponent);
    pointerUp.next(new PointerEvent('pointerup'));
    tick(100);
  };

  beforeEach(() => {
    pointerUp = new Subject<PointerEvent>();
    pointerDown = new Subject<PointerEvent>();

    textContainer = document.createElement('div');
    textContainer.textContent = 'Lorem ipsum';
    document.body.appendChild(textContainer);
    elementComponent = {
      domElement: textContainer,
      textContainerRef: { nativeElement: textContainer }
    } as unknown as TextComponent;

    support = new TextMarkingSupport(
      {
        pointerUp: pointerUp.asObservable(),
        pointerDown: pointerDown.asObservable()
      } as unknown as NativeEventService,
      { hideAllAnchors: vi.fn() } as unknown as AnchorService
    );
  });

  afterEach(() => {
    window.getSelection()?.removeAllRanges();
    textContainer.remove();
  });

  it('should open the marking bar when a selection is released without a marking colour', fakeAsync(() => {
    openMarkingBar();

    expect(support.isMarkingBarOpen).toBeTruthy();
  }));

  it('should close the marking bar on the next pointer down', fakeAsync(() => {
    openMarkingBar();

    pointerDown.next(new PointerEvent('pointerdown'));

    expect(support.isMarkingBarOpen).toBeFalsy();
  }));

  it('should not report an error when it is destroyed while a text selection is pending', fakeAsync(() => {
    support.startTextSelection(new PointerEvent('pointerdown'), elementComponent);

    const unhandledErrors = collectUnhandledErrors(() => support.destroy());

    expect(unhandledErrors).toEqual([]);
  }));

  it('should not report an error when it is destroyed while the marking bar is open', fakeAsync(() => {
    openMarkingBar();

    const unhandledErrors = collectUnhandledErrors(() => support.destroy());

    expect(unhandledErrors).toEqual([]);
  }));

  it('should stop reacting on a released pointer after destruction', fakeAsync(() => {
    support.startTextSelection(new PointerEvent('pointerdown'), elementComponent);
    selectTextContainerContent();
    support.destroy();

    const pointerUpEvent = new PointerEvent('pointerup');
    const preventDefault = vi.spyOn(pointerUpEvent, 'preventDefault');
    pointerUp.next(pointerUpEvent);
    tick(100);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(support.isMarkingBarOpen).toBeFalsy();
  }));

  it('should stop reacting on a pointer down after destruction', fakeAsync(() => {
    openMarkingBar();
    support.destroy();

    pointerDown.next(new PointerEvent('pointerdown'));

    expect(support.isMarkingBarOpen).toBeTruthy();
  }));

  it('should not open the marking bar when it is destroyed within the opening delay', fakeAsync(() => {
    selectTextContainerContent();
    support.startTextSelection(new PointerEvent('pointerdown'), elementComponent);
    pointerUp.next(new PointerEvent('pointerup'));

    support.destroy();
    tick(100);

    expect(support.isMarkingBarOpen).toBeFalsy();
  }));

  /*
   * A completed ngUnsubscribe no longer stops takeUntil: it reacts to the notifier emitting,
   * not to its completion. A subscription created after the teardown would therefore never be
   * unsubscribed, which is why the delayed opening has to be cancelled.
   */
  it('should leave no pointer subscription behind when it is destroyed within the opening delay', fakeAsync(() => {
    selectTextContainerContent();
    support.startTextSelection(new PointerEvent('pointerdown'), elementComponent);
    pointerUp.next(new PointerEvent('pointerup'));

    support.destroy();
    tick(100);

    expect(pointerDown.observed).toBeFalsy();
    expect(pointerUp.observed).toBeFalsy();
  }));
});

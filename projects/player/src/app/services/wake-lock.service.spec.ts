import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { Mock, vi } from 'vitest';
import { LogService } from 'player/modules/logging/services/log.service';
import { MediaPlayerService } from './media-player.service';
import { WakeLockService } from './wake-lock.service';

describe('WakeLockService', () => {
  let service: WakeLockService;
  let mediaPlayerService: MediaPlayerService;
  let request: Mock<(type: WakeLockType) => Promise<WakeLockSentinel>>;
  let sentinels: { released: boolean; release: Mock<() => Promise<void>> }[];

  const createSentinel = (): WakeLockSentinel => {
    const sentinel = {
      released: false,
      release: vi.fn(() => {
        sentinel.released = true;
        return Promise.resolve();
      })
    };
    sentinels.push(sentinel);
    return sentinel as unknown as WakeLockSentinel;
  };

  const stubWakeLock = (): void => {
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true
    });
  };

  const setVisibility = (state: DocumentVisibilityState): void => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
    document.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(() => {
    sentinels = [];
    request = vi.fn(() => Promise.resolve(createSentinel()));
    stubWakeLock();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WakeLockService);
    mediaPlayerService = TestBed.inject(MediaPlayerService);
    service.start();
  });

  afterEach(() => {
    service.ngOnDestroy();
    // Removes the own property again, which uncovers the browser's own `wakeLock`, if it has one.
    delete (navigator as { wakeLock?: WakeLock }).wakeLock;
    vi.restoreAllMocks();
  });

  it('should ask for a screen wake lock when a media element starts playing', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();

    expect(request).toHaveBeenCalledExactlyOnceWith('screen');
  }));

  it('should give the lock back when the media stops', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    mediaPlayerService.setActualPlayingId(null);
    flushMicrotasks();

    expect(sentinels[0].release).toHaveBeenCalledTimes(1);
  }));

  it('should not ask a second time while it still holds the lock', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    mediaPlayerService.setActualPlayingId('audio_2');
    flushMicrotasks();

    expect(request).toHaveBeenCalledTimes(1);
  }));

  it('should not ask a second time while the first request is pending', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    mediaPlayerService.setActualPlayingId('audio_2');
    flushMicrotasks();

    expect(request).toHaveBeenCalledTimes(1);
  }));

  it('should give back a lock that arrives after the media has already stopped', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    mediaPlayerService.setActualPlayingId(null);
    flushMicrotasks();

    expect(sentinels[0].release).toHaveBeenCalledTimes(1);
  }));

  it('should ask again when the page becomes visible while the media is still playing', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    // The browser drops the lock by itself while the page is hidden.
    sentinels[0].released = true;
    setVisibility('hidden');
    setVisibility('visible');
    flushMicrotasks();

    expect(request).toHaveBeenCalledTimes(2);
  }));

  it('should not ask when the page becomes visible and nothing is playing', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    mediaPlayerService.setActualPlayingId(null);
    flushMicrotasks();
    setVisibility('visible');
    flushMicrotasks();

    expect(request).toHaveBeenCalledTimes(1);
  }));

  it('should ask again on the next play after a refused request', fakeAsync(() => {
    request.mockReturnValueOnce(Promise.reject(new DOMException('denied', 'NotAllowedError')));
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    mediaPlayerService.setActualPlayingId(null);
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();

    expect(request).toHaveBeenCalledTimes(2);
    expect(sentinels.length).toBe(1);
  }));

  it('should log a refused request', fakeAsync(() => {
    const refusal = new DOMException('denied', 'NotAllowedError');
    const debugSpy = vi.spyOn(LogService, 'debug').mockImplementation(() => {});
    request.mockReturnValueOnce(Promise.reject(refusal));
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();

    expect(debugSpy).toHaveBeenCalledWith('player: screen wake lock refused', refusal);
  }));

  it('should give back a lock that arrives after it was destroyed', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    service.ngOnDestroy();
    flushMicrotasks();

    expect(sentinels[0].release).toHaveBeenCalledTimes(1);
  }));

  it('should do nothing where the browser has no Screen Wake Lock API', fakeAsync(() => {
    Object.defineProperty(navigator, 'wakeLock', { value: undefined, configurable: true });

    expect(() => {
      mediaPlayerService.setActualPlayingId('audio_1');
      flushMicrotasks();
    }).not.toThrow();
    expect(request).not.toHaveBeenCalled();
  }));

  it('should give the lock back and stop following the media when destroyed', fakeAsync(() => {
    mediaPlayerService.setActualPlayingId('audio_1');
    flushMicrotasks();
    service.ngOnDestroy();
    mediaPlayerService.setActualPlayingId('audio_2');
    flushMicrotasks();

    expect(sentinels[0].release).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
  }));
});

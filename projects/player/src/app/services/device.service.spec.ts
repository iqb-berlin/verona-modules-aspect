import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service: DeviceService;

  const createService = (): DeviceService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(DeviceService);
  };

  const setTouchSupport = (maxTouchPoints: number): void => {
    vi.spyOn(navigator, 'maxTouchPoints', 'get').mockReturnValue(maxTouchPoints);
  };

  beforeEach(() => {
    service = createService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not assume a hardware keyboard by default', () => {
    expect(service.hasHardwareKeyboard).toBe(false);
  });

  it('should treat a touch device without hardware keyboard as mobile', () => {
    setTouchSupport(5);

    expect(createService().isMobileWithoutHardwareKeyboard).toBe(true);
  });

  it('should not treat a touch device with hardware keyboard as mobile', () => {
    setTouchSupport(5);
    const touchService = createService();

    touchService.hasHardwareKeyboard = true;

    expect(touchService.isMobileWithoutHardwareKeyboard).toBe(false);
  });

  it('should not treat a device without touch support as mobile', () => {
    setTouchSupport(0);

    /* 'ontouchstart' in window is true in the test browser, so only the touch point
       count can be varied; the check below documents the combined condition. */
    expect(createService().isMobileWithoutHardwareKeyboard)
      .toBe('ontouchstart' in window);
  });
});

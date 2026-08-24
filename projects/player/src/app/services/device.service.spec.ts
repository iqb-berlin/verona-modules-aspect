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
    vi.unstubAllGlobals();
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

    expect(createService().isMobileWithoutHardwareKeyboard).toBe(false);
  });

  it('should not treat a machine that merely exposes the touch events API as mobile', () => {
    /* The situation in the Safe Exam Browser (#1122): it enables the touch events API
       unconditionally, so 'ontouchstart' in window says nothing about the hardware. Reading it
       made every desktop machine look like a touch device and covered task content with the
       software keyboard. The test browser does not expose the API, hence it is stubbed here. */
    vi.stubGlobal('ontouchstart', null);
    setTouchSupport(0);

    expect('ontouchstart' in window).toBe(true);
    expect(createService().isMobileWithoutHardwareKeyboard).toBe(false);
  });

  it('should not treat a single point digitizer as a touch device', () => {
    setTouchSupport(1);

    expect(createService().isMobileWithoutHardwareKeyboard).toBe(false);
  });
});

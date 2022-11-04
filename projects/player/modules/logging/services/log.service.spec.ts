import { TestBed } from '@angular/core/testing';
import { LogLevel, LogService } from './log.service';

describe('LoggerService', () => {
  let service: LogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call LogService.debug', () => {
    spyOn(LogService, 'debug')
      .withArgs('test', 'test2');
    LogService.debug('test', 'test2');
    expect(LogService.debug).toHaveBeenCalled();
    expect(LogService.debug).toHaveBeenCalledWith('test', 'test2');
  });

  it('should call LogService.info', () => {
    spyOn(LogService, 'info')
      .withArgs('test', 'test2');
    LogService.info('test', 'test2');
    expect(LogService.info).toHaveBeenCalled();
    expect(LogService.info).toHaveBeenCalledWith('test', 'test2');
  });

  it('should call LogService.warn', () => {
    spyOn(LogService, 'warn')
      .withArgs('test', 'test2');
    LogService.warn('test', 'test2');
    expect(LogService.warn).toHaveBeenCalled();
    expect(LogService.warn).toHaveBeenCalledWith('test', 'test2');
  });

  it('should call LogService.error', () => {
    spyOn(LogService, 'error')
      .withArgs('test', 'test2');
    LogService.error('test', 'test2');
    expect(LogService.error).toHaveBeenCalled();
    expect(LogService.error).toHaveBeenCalledWith('test', 'test2');
  });

  it('should set LogService.level to "NONE"', () => {
    LogService.level = 0;
    expect(LogService.level).toEqual(LogLevel.NONE);
  });
  it('should set LogService.level to "ERROR"', () => {
    LogService.level = 1;
    expect(LogService.level).toEqual(LogLevel.ERROR);
  });
  it('should set LogService.level to "WARN"', () => {
    LogService.level = 2;
    expect(LogService.level).toEqual(LogLevel.WARN);
  });
  it('should set LogService.level to "INFO"', () => {
    LogService.level = 3;
    expect(LogService.level).toEqual(LogLevel.INFO);
  });
  it('should set LogService.level to "DEBUG"', () => {
    LogService.level = 4;
    expect(LogService.level).toEqual(LogLevel.DEBUG);
  });
});

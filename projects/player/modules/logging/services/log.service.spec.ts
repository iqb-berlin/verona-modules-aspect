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

  it('should call LogService.log', () => {
    spyOn(LogService, 'log')
      .withArgs('test');
    LogService.log('test');
    expect(LogService.log).toHaveBeenCalled();
    expect(LogService.log).toHaveBeenCalledWith('test');
  });

  it('should call LogService.info', () => {
    spyOn(LogService, 'info')
      .withArgs('test');
    LogService.info('test');
    expect(LogService.info).toHaveBeenCalled();
    expect(LogService.info).toHaveBeenCalledWith('test');
  });

  it('should call LogService.warn', () => {
    spyOn(LogService, 'warn')
      .withArgs('test');
    LogService.warn('test');
    expect(LogService.warn).toHaveBeenCalled();
    expect(LogService.warn).toHaveBeenCalledWith('test');
  });

  it('should call LogService.error', () => {
    spyOn(LogService, 'error')
      .withArgs('test');
    LogService.error('test');
    expect(LogService.error).toHaveBeenCalled();
    expect(LogService.error).toHaveBeenCalledWith('test');
  });

  it('should set LogService.level to "LOG"', () => {
    LogService.level = 0;
    expect(LogService.level).toEqual(LogLevel.LOG);
  });

  it('should set LogService.level to "INFO"', () => {
    LogService.level = 1;
    expect(LogService.level).toEqual(LogLevel.INFO);
  });
  it('should set LogService.level to "WARN"', () => {
    LogService.level = 2;
    expect(LogService.level).toEqual(LogLevel.WARN);
  });
  it('should set LogService.level to "ERROR"', () => {
    LogService.level = 3;
    expect(LogService.level).toEqual(LogLevel.ERROR);
  });
  it('should set LogService.level to "NONE"', () => {
    LogService.level = 4;
    expect(LogService.level).toEqual(LogLevel.NONE);
  });

});

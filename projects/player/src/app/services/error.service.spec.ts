import { TestBed } from '@angular/core/testing';
import { AspectError } from 'common/classes/aspect-error';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let veronaPostService: SpyObj<VeronaPostService>;

  beforeEach(() => {
    veronaPostService = createSpyObj<VeronaPostService>(['sendVopRuntimeErrorNotification']);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        { provide: VeronaPostService, useValue: veronaPostService }
      ]
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should notify the host about an aspect error', () => {
    const error = new AspectError('unit-load-error', 'Unit konnte nicht geladen werden');

    service.handleError(error);

    expect(veronaPostService.sendVopRuntimeErrorNotification).toHaveBeenCalledWith(error);
  });

  it('should not notify the host about other errors', () => {
    service.handleError(new Error('any other error') as AspectError);

    expect(veronaPostService.sendVopRuntimeErrorNotification).not.toHaveBeenCalled();
  });

  it('should log every error to the console', () => {
    const aspectError = new AspectError('code', 'message');
    const otherError = new Error('other') as AspectError;

    service.handleError(aspectError);
    service.handleError(otherError);

    expect(console.error).toHaveBeenCalledWith(aspectError);
    expect(console.error).toHaveBeenCalledWith(otherError);
  });
});

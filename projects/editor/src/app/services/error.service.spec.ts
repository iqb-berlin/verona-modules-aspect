import { TranslateService } from '@ngx-translate/core';
import { AspectError } from 'common/classes/aspect-error';
import { IDError } from 'common/classes/id-error';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ErrorService } from 'editor/src/app/services/error.service';
import { MessageService } from 'editor/src/app/services/message.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let messageServiceSpy: SpyObj<MessageService>;
  let translateServiceSpy: SpyObj<TranslateService>;

  beforeEach(() => {
    messageServiceSpy = createSpyObj<MessageService>(['showPrompt', 'showError', 'showErrorPrompt']);
    translateServiceSpy = createSpyObj<TranslateService>(['instant']);
    translateServiceSpy.instant.mockImplementation((key: string | string[]) => key as string);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    service = new ErrorService(translateServiceSpy, messageServiceSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show a prompt for high severity ID errors', () => {
    service.handleError(new IDError('ID ist bereits vergeben', undefined, true));

    expect(messageServiceSpy.showPrompt).toHaveBeenCalledWith('ID ist bereits vergeben');
    expect(messageServiceSpy.showError).not.toHaveBeenCalled();
  });

  it('should show a dismissable error for low severity ID errors', () => {
    service.handleError(new IDError('ID länger als 20 Zeichen'));

    expect(messageServiceSpy.showError).toHaveBeenCalledWith('ID länger als 20 Zeichen');
    expect(messageServiceSpy.showPrompt).not.toHaveBeenCalled();
  });

  it('should show a translated prompt for aspect errors', () => {
    service.handleError(new AspectError('sanitization-needed', 'Elementfehler'));

    expect(translateServiceSpy.instant)
      .toHaveBeenCalledWith('error.corruptElement', { errorMsg: 'Elementfehler' });
    expect(messageServiceSpy.showPrompt).toHaveBeenCalledWith('error.corruptElement');
  });

  it('should treat geogebra loading errors as unexpected errors', () => {
    const error = new AspectError('geogebra-not-loading', 'GeoGebra lädt nicht');
    service.handleError(error);

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledWith(error);
    expect(messageServiceSpy.showPrompt).not.toHaveBeenCalled();
  });

  it('should show the unexpected error prompt and log generic errors', () => {
    const error = new Error('Unerwartet');
    service.handleError(error);

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledWith(error);
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(error);
  });
});

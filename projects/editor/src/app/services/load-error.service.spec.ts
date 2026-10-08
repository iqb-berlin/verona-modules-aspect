import { LoadErrorService } from 'editor/src/app/services/load-error.service';

describe('LoadErrorService', () => {
  let service: LoadErrorService;

  beforeEach(() => {
    service = new LoadErrorService();
  });

  it('should list a reported error and call it new', () => {
    expect(service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' })).toBe(true);

    expect(service.errors.value).toEqual([{ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' }]);
  });

  /* An element reports again each time it is built anew. */
  it('should list the same error of the same element once', () => {
    service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' });

    expect(service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' })).toBe(false);
    expect(service.errors.value.length).toBe(1);
  });

  it('should list the same error of two elements, and two errors of one element', () => {
    service.report({ code: 'media-timeout', message: 'Failed', elementId: 'audio_1' });
    service.report({ code: 'media-timeout', message: 'Failed', elementId: 'audio_2' });
    service.report({ code: 'media-duration-error', message: 'Failed', elementId: 'audio_1' });

    expect(service.errors.value.length).toBe(3);
  });

  /* GeoGebra is loaded once per application; a failed load holds for every unit that follows. */
  it('should keep an error without an element when a unit is loaded anew', () => {
    service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' });
    service.report({ code: 'geogebra-not-loading', message: 'Failed' });

    service.clearElementErrors();

    expect(service.errors.value).toEqual([{ code: 'geogebra-not-loading', message: 'Failed' }]);
  });

  it('should forget the errors of one element only', () => {
    service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' });
    service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_2' });

    service.clearErrorsOf('image_1');

    expect(service.errors.value.map(error => error.elementId)).toEqual(['image_2']);
  });

  it('should take a forgotten error as new when it is reported again', () => {
    service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' });
    service.clearErrorsOf('image_1');

    expect(service.report({ code: 'image-not-loading', message: 'Failed', elementId: 'image_1' })).toBe(true);
  });

  /* Only a picture reports again for a new source; a medium's timeout does not restart. */
  it('should name the picture\'s source as the one write that loads anew', () => {
    expect(LoadErrorService.reloadsOnWrite('image', 'src')).toBe(true);
    expect(LoadErrorService.reloadsOnWrite('image', 'alt')).toBe(false);
    expect(LoadErrorService.reloadsOnWrite('audio', 'src')).toBe(false);
    expect(LoadErrorService.reloadsOnWrite('geometry', 'appDefinition')).toBe(false);
  });

  it('should not announce a change when there was nothing to forget', () => {
    let emissions = 0;
    service.errors.subscribe(() => { emissions += 1; });

    service.clearElementErrors();
    service.clearErrorsOf('image_1');

    expect(emissions).toBe(1);
  });
});

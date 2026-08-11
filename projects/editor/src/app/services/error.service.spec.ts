import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AspectError } from 'common/classes/aspect-error';
import { IDError } from 'common/classes/id-error';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ErrorService } from 'editor/src/app/services/error.service';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';

/** Errors with a fixed V8-shaped stack, so two of them are the same fault only when meant to be. */
const errorFrom = (message: string, frame: string): Error => {
  const error = new Error(message);
  error.stack = `Error: ${message}\n    at ${frame}`;
  return error;
};

/** The same, in the shape Firefox and Safari produce: no header line, no "at" prefix. */
const firefoxErrorFrom = (message: string, frame: string): Error => {
  const error = new Error(message);
  error.stack = `${frame}@http://localhost/main.js:12:5\nrefreshView@http://localhost/main.js:99:1`;
  return error;
};

describe('ErrorService', () => {
  let service: ErrorService;
  let messageServiceSpy: SpyObj<MessageService>;
  let translateServiceSpy: SpyObj<TranslateService>;
  let dialogClosed: Subject<void>;

  beforeEach(() => {
    messageServiceSpy = createSpyObj<MessageService>(['showPrompt', 'showError', 'showErrorPrompt']);
    dialogClosed = new Subject<void>();
    messageServiceSpy.showErrorPrompt.mockReturnValue({
      afterClosed: () => dialogClosed.asObservable()
    } as unknown as MatDialogRef<UnexpectedErrorComponent>);
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

  it('should keep repeating ID error feedback for a repeated user action', () => {
    service.handleError(new IDError('ID ist bereits vergeben', undefined, true));
    service.handleError(new IDError('ID ist bereits vergeben', undefined, true));

    expect(messageServiceSpy.showPrompt).toHaveBeenCalledTimes(2);
  });

  it('should not open a second dialog while the first one is still open', () => {
    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));
    service.handleError(errorFrom('Zweiter Fehler', 'ElementOverlay.template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(1);
  });

  it('should log a distinct error that arrives while the dialog is open', () => {
    const second = errorFrom('Zweiter Fehler', 'ElementOverlay.template');
    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));
    service.handleError(second);

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(second);
  });

  it('should log a repeated error only once', () => {
    service.handleError(errorFrom('Immer derselbe Fehler', 'SectionComponent.template'));
    service.handleError(errorFrom('Immer derselbe Fehler', 'SectionComponent.template'));

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should survive a dialog that throws back into handleError while opening', () => {
    // MatDialog.open runs change detection synchronously, which re-evaluates the broken template
    // and reports the next error before open() has even returned.
    let reentered = false;
    messageServiceSpy.showErrorPrompt.mockImplementation(() => {
      if (!reentered) {
        reentered = true;
        service.handleError(errorFrom('Folgefehler', 'ElementOverlay.template'));
      }
      return { afterClosed: () => dialogClosed.asObservable() } as unknown as MatDialogRef<UnexpectedErrorComponent>;
    });

    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));

    expect(reentered).toBe(true);
    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(1);
    // the follow-up error gets no dialog, but it does reach the console
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(2);

    // and the gate opens again once the dialog is gone
    dialogClosed.next();
    service.handleError(errorFrom('Dritter Fehler', 'PageComponent.template'));
    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should report throws that are not Error instances', () => {
    service.handleError('kaputter String');

    expect(messageServiceSpy.showErrorPrompt)
      .toHaveBeenCalledWith(expect.objectContaining({ message: 'kaputter String' }));
  });

  it('should tell two different non-Error throws apart', () => {
    service.handleError('erster kaputter String');
    dialogClosed.next();
    service.handleError('zweiter kaputter String');

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should not crash while reporting a thrown null', () => {
    expect(() => service.handleError(null)).not.toThrow();

    expect(messageServiceSpy.showErrorPrompt)
      .toHaveBeenCalledWith(expect.objectContaining({ message: 'null' }));
  });

  it('should still open a dialog for a later error when opening one failed', () => {
    messageServiceSpy.showErrorPrompt.mockImplementationOnce(() => {
      throw new Error('Dialog lässt sich nicht öffnen');
    });

    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));
    service.handleError(errorFrom('Zweiter Fehler', 'ElementOverlay.template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should not show the same error a second time after the dialog was closed', () => {
    service.handleError(errorFrom('Immer derselbe Fehler', 'SectionComponent.template'));
    dialogClosed.next();
    service.handleError(errorFrom('Immer derselbe Fehler', 'SectionComponent.template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(1);
  });

  it('should show a different error after the dialog was closed', () => {
    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));
    dialogClosed.next();
    service.handleError(errorFrom('Zweiter Fehler', 'ElementOverlay.template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should tell two throws of the same message from different places apart', () => {
    service.handleError(errorFrom('Cannot read properties of undefined', 'SectionComponent.template'));
    dialogClosed.next();
    service.handleError(errorFrom('Cannot read properties of undefined', 'ElementOverlay.template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should tell them apart on a stack without a header line, as Firefox produces', () => {
    service.handleError(firefoxErrorFrom('t is undefined', 'SectionComponent_Template'));
    dialogClosed.next();
    service.handleError(firefoxErrorFrom('t is undefined', 'ElementOverlay_Template'));

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should tell two errors without any stack apart by their message', () => {
    const first = new Error('Erster Fehler');
    const second = new Error('Zweiter Fehler');
    first.stack = undefined;
    second.stack = undefined;

    service.handleError(first);
    dialogClosed.next();
    service.handleError(second);

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
  });

  it('should show a dialog for an error that first arrived while another dialog was open', () => {
    const second = errorFrom('Zweiter Fehler', 'ElementOverlay.template');
    service.handleError(errorFrom('Erster Fehler', 'SectionComponent.template'));
    service.handleError(second);
    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(1);

    dialogClosed.next();
    service.handleError(second);

    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(2);
    expect(messageServiceSpy.showErrorPrompt).toHaveBeenLastCalledWith(second);
  });

  it('should read the message of an error-shaped throw that is not an Error', () => {
    service.handleError({ message: 'Http failure response for /units/1: 404 Not Found', status: 404 });

    expect(messageServiceSpy.showErrorPrompt)
      .toHaveBeenCalledWith(expect.objectContaining({ message: 'Http failure response for /units/1: 404 Not Found' }));
  });

  it('should not crash on a throw that refuses to be stringified', () => {
    const hostile = { message: 42, toString: () => { throw new Error('nope'); } };

    expect(() => service.handleError(hostile)).not.toThrow();
    expect(messageServiceSpy.showErrorPrompt).toHaveBeenCalledTimes(1);
  });

  it('should keep repeating the corrupt element prompt', () => {
    service.handleError(new AspectError('sanitization-needed', 'Elementfehler'));
    service.handleError(new AspectError('sanitization-needed', 'Elementfehler'));

    expect(messageServiceSpy.showPrompt).toHaveBeenCalledTimes(2);
  });
});

import { ErrorHandler, Injectable } from '@angular/core';
import { AspectError } from 'common/classes/aspect-error';
import { IDError } from 'common/classes/id-error';
import { MessageService } from 'editor/src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Registered as Angular's global ErrorHandler (app.module.ts), so handleError runs for every throw
 * inside a change detection run.
 *
 * An unexpected error is therefore not reported unconditionally: showing the dialog makes the app
 * render again, and a permanently broken template throws again while doing so and asks for the next
 * dialog - unbounded, until the editor cannot even be saved (#1202). The follow-up throw has been
 * observed from inside `MatDialog.open` itself (the stack in the report on #1089) and can equally
 * arrive from the render that opening schedules, so two gates gate the dialog:
 *
 * - no second dialog while one is open, with the flag set BEFORE opening, which is what covers the
 *   throw that arrives before open() has returned.
 * - the same error is prompted at most once. Needed in addition, because dismissing the dialog
 *   restores focus and renders again, which throws again - the open-gate alone would hand out a
 *   fresh dialog on every dismissal.
 *
 * "The same error" means name, message and topmost stack frame. Logging is gated separately, on
 * that signature alone: every distinct error reaches the console exactly once, including one that
 * arrives while a dialog is open, and including one whose dialog is still to come.
 *
 * Two limits worth knowing. The memory is per editor instance, and the Studio replaces unit
 * definitions in a running editor, so "at most once" spans every unit opened in that tab - the same
 * fault in a second unit stays silent. And an error whose dialog fails to open is logged but not
 * prompted again; retrying would reopen the flood it is guarding against.
 *
 * The IDError and AspectError branches are NOT gated: they report a concrete element or resource
 * ("ID is already taken", a broken image), are thrown from event handlers rather than from a
 * template expression, and use snackbars, which replace each other instead of stacking. Note that
 * an AspectError with code 'geogebra-not-loading' deliberately falls through to the gated branch.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  private loggedSignatures = new Set<string>();
  private promptedSignatures = new Set<string>();
  private errorPromptOpen: boolean = false;

  constructor(
    private translateService: TranslateService,
    private messageService: MessageService) { }

  handleError(error: unknown): void {
    if (error instanceof IDError) {
      error.highSeverity ? this.messageService.showPrompt(error.message) : this.messageService.showError(error.message);
    } else if (error instanceof AspectError && error.code !== 'geogebra-not-loading') {
      this.messageService
        .showPrompt(this.translateService.instant('error.corruptElement', { errorMsg: error.message }));
    } else {
      this.reportUnexpectedError(ErrorService.asError(error));
    }
  }

  private reportUnexpectedError(error: Error): void {
    const signature = ErrorService.getSignature(error);
    if (!this.loggedSignatures.has(signature)) {
      this.loggedSignatures.add(signature);
      // eslint-disable-next-line no-console
      console.error(error);
    }
    if (this.errorPromptOpen || this.promptedSignatures.has(signature)) return;
    this.promptedSignatures.add(signature);
    // set before opening: the dialog makes the app render, which can throw straight back into here
    this.errorPromptOpen = true;
    try {
      this.messageService.showErrorPrompt(error)
        .afterClosed()
        .subscribe(() => { this.errorPromptOpen = false; });
    } catch (dialogError) {
      // a dialog that cannot open must not silence every error that follows
      this.errorPromptOpen = false;
      // eslint-disable-next-line no-console
      console.error(dialogError);
    }
  }

  /** A throw is not necessarily an Error: only an Error carries the message and stack we report. */
  private static asError(thrown: unknown): Error {
    return thrown instanceof Error ? thrown : new Error(ErrorService.describe(thrown));
  }

  /**
   * Error-shaped objects that are not Errors carry the useful text on `message` - HttpErrorResponse
   * is the common one. Everything else is stringified, which the object may refuse to do.
   */
  private static describe(thrown: unknown): string {
    const message = (thrown as { message?: unknown } | null | undefined)?.message;
    if (typeof message === 'string' && message !== '') return message;
    try {
      return String(thrown);
    } catch {
      return Object.prototype.toString.call(thrown);
    }
  }

  /** Name, message and topmost stack frame: the same fault thrown from the same place. */
  private static getSignature(error: Error): string {
    return `${error.name}: ${error.message}\n${ErrorService.getTopFrame(error)}`;
  }

  /**
   * V8 starts the stack with "Name: message" and prefixes each frame with "at", Firefox and Safari
   * do neither, and a message can itself span lines - so pick the first line that is a frame at all
   * rather than the second line.
   */
  private static getTopFrame(error: Error): string {
    return (error.stack ?? '')
      .split('\n')
      .map(line => line.trim())
      .find(line => line.startsWith('at ') || /@.+:\d+/.test(line)) ?? '';
  }
}

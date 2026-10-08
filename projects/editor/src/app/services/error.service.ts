import { ErrorHandler, Injectable } from '@angular/core';
import { AspectError } from 'common/classes/aspect-error';
import { IDError } from 'common/classes/id-error';
import { MessageService } from 'editor/src/app/services/message.service';
import { VeronaAPIService } from 'editor/src/app/services/verona-api.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadErrorService } from 'editor/src/app/services/load-error.service';
import { DialogService } from 'editor/src/app/services/dialog.service';

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
 * that signature alone: every distinct error reaches the console once, including one that arrives
 * while a dialog is open, and including one whose dialog is still to come.
 *
 * Both memories are cleared on every start command the host sends - a different unit, and equally a
 * replay of the one already open, which the Studio does on every load (see the comment on
 * UnitService.loadUnitDefinition). "At most once" therefore means once per loaded unit, not once per
 * editor. Within one load the gate holds, which is what keeps the circle closed.
 *
 * Two things the clearing does not cover. An error whose dialog fails to open is logged but not
 * prompted again - retrying would reopen the flood this guards against. And the open flag survives a
 * start command, deliberately: the previous unit's dialog can still be on screen, so until it is
 * dismissed the new unit's first error only reaches the console.
 *
 * The IDError branch is NOT gated: it reports what the author just typed, is thrown from an event
 * handler rather than from a template expression, and uses snackbars, which replace each other
 * instead of stacking.
 *
 * An AspectError is what the player reports to the host as a runtime error. The editor has no such
 * message (verona-interfaces/editor#16), so it lists the error in the hints area instead and announces
 * it once (#1537). That gate is the LoadErrorService's: an element reports again each time it is
 * built, and only the first report is news.
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
    private messageService: MessageService,
    veronaApiService: VeronaAPIService,
    private loadErrorService: LoadErrorService,
    private dialogService: DialogService) {
    // Subscribed here rather than called from outside, because it puts the clearing ahead of the
    // load: Angular builds the ErrorHandler at bootstrap, so this subscriber is registered before
    // the one in AppComponent that loads the definition. Calling it from outside is at least sound
    // again since #1206 -- the registration is an alias now, so an injected service is this one.
    veronaApiService.startCommand.subscribe(() => {
      this.loggedSignatures.clear();
      this.promptedSignatures.clear();
    });
  }

  handleError(error: unknown): void {
    if (error instanceof IDError) {
      // The models in common carry the key; the editor shows it translated (#1523).
      const text = error.translationKey ?
        this.translateService.instant(error.translationKey, error.translationParams) :
        error.message;
      error.highSeverity ? this.messageService.showPrompt(text) : this.messageService.showError(text);
    } else if (error instanceof AspectError) {
      this.reportLoadError(error);
    } else {
      this.reportUnexpectedError(ErrorService.asError(error));
    }
  }

  private reportLoadError(error: AspectError): void {
    const isNew = this.loadErrorService
      .report({ code: error.code, message: error.message, elementId: error.elementId });
    if (!isNew) return;
    // eslint-disable-next-line no-console
    console.error(error);
    this.messageService
      .showWarningWithAction(
        this.translateService.instant('unitHints.loadErrors.notice'),
        this.translateService.instant('unitHints.loadErrors.show'))
      .subscribe(() => this.dialogService.showVariableInfoFindingsDialog());
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

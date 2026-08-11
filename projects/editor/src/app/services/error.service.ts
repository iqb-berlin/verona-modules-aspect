import { ErrorHandler, Injectable } from '@angular/core';
import { AspectError } from 'common/classes/aspect-error';
import { IDError } from 'common/classes/id-error';
import { MessageService } from 'editor/src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Registered as Angular's global ErrorHandler (app.module.ts), so handleError runs for every throw
 * inside a change detection run.
 *
 * An unexpected error is therefore not reported unconditionally: opening the dialog runs change
 * detection itself, and with a permanently broken template that evaluates the broken template
 * again, throws again and asks for another dialog - unbounded, until the editor is unusable
 * (#1202). Two gates cut that circle:
 *
 * - no second dialog while one is open. The flag is set BEFORE opening, because the re-entrant
 *   throw arrives while open() is still running.
 * - an error signature (message plus topmost frame) is reported at most once per session. Needed
 *   in addition, because closing the dialog restores focus, which runs change detection, which
 *   throws again - the open-gate alone would hand out a fresh dialog on every dismissal.
 *
 * So a template that keeps throwing costs exactly one dialog and one console entry. The price is
 * that a second, genuinely new fault with the very same message and origin stays silent for the
 * rest of the session; that is the trade for an editor that stays usable enough to save.
 *
 * The IDError and AspectError branches are deliberately NOT gated: they report a concrete element
 * or resource ("ID is already taken", a broken image) and have to appear again when it recurs.
 * They also use snackbars, which replace each other instead of stacking.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  private reportedErrorSignatures = new Set<string>();
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
      // a throw is not necessarily an Error: without this, `throw null` crashes the reporting itself
      this.reportUnexpectedError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private reportUnexpectedError(error: Error): void {
    const signature = ErrorService.getSignature(error);
    if (this.reportedErrorSignatures.has(signature)) return;
    this.reportedErrorSignatures.add(signature);
    // logged for every distinct error, including one that arrives while the dialog is already open
    // eslint-disable-next-line no-console
    console.error(error);
    if (this.errorPromptOpen) return;
    // set before opening: the dialog runs change detection, which can throw straight back into here
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

  /** Message plus the topmost stack frame: the same fault thrown from the same place. */
  private static getSignature(error: Error): string {
    return `${error.name}: ${error.message}\n${error.stack?.split('\n')[1]?.trim() ?? ''}`;
  }
}

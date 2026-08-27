import { ErrorHandler, Injectable } from '@angular/core';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';

import { AspectError } from 'common/classes/aspect-error';

/**
 * Angular's central error handler for the player, provided as `ErrorHandler` in the `AppModule`. It is
 * the seam at which an error stops being an internal matter and becomes something the testing
 * environment is told about.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  constructor(private veronaPostService: VeronaPostService) {}

  /**
   * Reports an `AspectError` to the host as a `vopRuntimeErrorNotification` -- for anything else the
   * player has no code and no message the host could show. Every error reaches the console, reported or
   * not.
   */
  handleError(error: AspectError): void {
    if (error.name === AspectError.name) {
      this.veronaPostService.sendVopRuntimeErrorNotification(error);
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

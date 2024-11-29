import { ErrorHandler, Injectable } from '@angular/core';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { AspectError } from 'common/classes/aspect-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  constructor(private veronaPostService: VeronaPostService) {}

  handleError(error: AspectError): void {
    if (error.name === AspectError.name) {
      this.veronaPostService.sendVopRuntimeErrorNotification(error);
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

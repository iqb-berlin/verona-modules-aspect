import { ErrorHandler, Injectable } from '@angular/core';
import { AspectError } from 'common/classes/aspect-error';

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  // eslint-disable-next-line class-methods-use-this
  handleError(error: AspectError): void {
    if (error.name === AspectError.name) {
      // handle app specific errors
    } else {
      // all other errors
    }
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
}

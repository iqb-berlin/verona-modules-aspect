import { ErrorHandler, Injectable } from '@angular/core';
import { IDError } from 'common/errors';
import { MessageService } from 'editor/src/app/services/message.service';
import { AspectError } from 'common/classes/aspect-error';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  constructor(
    private translateService: TranslateService,
    private messageService: MessageService) { }

  handleError(error: Error): void {
    if (error instanceof IDError) {
      error.highSeverity ? this.messageService.showPrompt(error.message) : this.messageService.showError(error.message);
    } else if (error instanceof AspectError && error.code !== 'geogebra-not-loading') {
      this.messageService
        .showPrompt(this.translateService.instant('error.corruptElement', { errorMsg: error.message }));
    } else {
      this.messageService.showErrorPrompt(error);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}

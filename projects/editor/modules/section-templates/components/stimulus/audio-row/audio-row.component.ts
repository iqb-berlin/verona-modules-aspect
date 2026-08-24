import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'editor/src/app/services/message.service';

@Component({
  standalone: false,
  selector: 'aspect-editor-wizard-audio',
  templateUrl: './audio-row.component.html',
  styleUrls: ['./audio-row.component.scss']
})
export class AudioRowComponent {
  @Input() src: string | undefined;
  @Input() maxRuns!: number;
  @Output() maxRunsChange = new EventEmitter<number>();
  @Output() changeMediaSrc = new EventEmitter();

  constructor(private messageService: MessageService,
              private translateService: TranslateService) {}

  /**
   * What `aspectNumberField` worked out for the play count.
   *
   * The binding was two-way and `min="1"` was never enforced, so a 0 or an emptied box reached the
   * generated element - where 0 means "no limit" to the player, the opposite of what the box says
   * (#1164).
   */
  commitMaxRuns(update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.maxRuns = update.value;
    this.maxRunsChange.emit(update.value);
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Hotspot } from 'common/models/elements/hotspot-image';
import { MessageService } from 'editor/src/app/services/message.service';

@Component({
  selector: 'aspect-hotspot-edit-dialog',
  templateUrl: './hotspot-edit-dialog.component.html',
  styleUrls: ['./hotspot-edit-dialog.component.scss'],
  standalone: false
})
export class HotspotEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { hotspot: Hotspot },
              private messageService: MessageService,
              private translateService: TranslateService) { }

  newHotspot = { ...this.data.hotspot };

  /**
   * What `aspectNumberField` worked out for one of the six number boxes.
   *
   * Unlike the properties panel this dialog edits a draft that only reaches the model when it is
   * confirmed, so assigning into `newHotspot` is sound here - what was missing is that the `min`
   * on the size boxes meant nothing, and a negative width could be confirmed (#1161). A refused
   * entry is not written; the directive has already put the box back to the draft value, which is
   * why the binding had to become one-way.
   *
   * The warning is the same one the panel gives, for the same reason: the box goes back to its old
   * value on its own, and without a word for it the edit looks like it was simply swallowed.
   *
   * All six boxes are `required`, so a valid update carries a number - the null check narrows the
   * type rather than standing in for a value.
   */
  commitNumber(property: 'top' | 'left' | 'width' | 'height' | 'borderWidth' | 'rotation',
               update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    if (update.value !== null) this.newHotspot[property] = update.value;
  }
}

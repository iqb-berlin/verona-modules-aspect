import {
  Component, Inject
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';

import { DialogService } from 'editor/src/app/services/dialog.service';

@Component({
  selector: 'aspect-player-edit-dialog',
  templateUrl: './player-edit-dialog.component.html',
  styleUrls: ['./player-edit-dialog.component.scss'],
  standalone: false
})
export class PlayerEditDialogComponent {
  newPlayerConfig: PlayerProperties = { ...this.data.playerProps };

  /**
   * What `aspectNumberField` worked out for one of the five number boxes.
   *
   * Like the hotspot dialog this edits a draft that only reaches the model on confirm, so writing
   * into `newPlayerConfig` is sound - what was missing is that the `min`/`max` on every box meant
   * nothing, and a negative volume or run count could be confirmed (#1161). A refused entry is
   * dropped; the directive has put the box back to the draft value already.
   *
   * All five boxes are `required`, so a valid update carries a number - the null check narrows the
   * type rather than standing in for a value. `maxRuns` is declared `number | null`, but its null
   * and its 0 mean the same thing to the player, so the box asks for the number.
   */
  commitNumber(property: 'defaultVolume' | 'minVolume' | 'hintDelay' | 'minRuns' | 'maxRuns',
               update: { value: number | null; isInputValid: boolean }): void {
    if (update.isInputValid && update.value !== null) this.newPlayerConfig[property] = update.value;
  }

  constructor(@Inject(MAT_DIALOG_DATA)protected data: { elementID: string, playerProps: PlayerProperties },
              private dialogService: DialogService) {
  }

  async loadImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.newPlayerConfig.imgSrc = file.content;
      this.newPlayerConfig.imgFileName = file.name;
    }
  }

  removeImage(): void {
    this.newPlayerConfig.imgSrc = null;
    this.newPlayerConfig.imgFileName = '';
  }
}

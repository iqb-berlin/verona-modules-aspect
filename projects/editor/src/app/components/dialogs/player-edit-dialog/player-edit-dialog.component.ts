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

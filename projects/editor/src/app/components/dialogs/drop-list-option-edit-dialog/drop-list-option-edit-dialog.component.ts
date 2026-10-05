import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { VariableAlias } from 'common/utils/variable-alias';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-drop-list-option-edit-dialog',
  templateUrl: './drop-list-option-edit-dialog.component.html',
  styleUrls: ['./drop-list-option-edit-dialog.component.scss'],
  standalone: false
})
export class DropListOptionEditDialogComponent {
  newLabel = { ...this.data.value };
  /** The one place the rule for ids and aliases is written down. */
  readonly aliasPattern = VariableAlias.PATTERN_SOURCE;
  /**
   * Why the drop-list would refuse the typed alias, as a translation key, or `null`. The same rule the drop-list
   * applies when the dialog's result is written: the pattern alone let a taken alias through, which was refused only
   * after the dialog had closed, with a message that faded after three seconds (#1523).
   */
  aliasProblem: string | null = this.problemOf(this.newLabel.alias);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: DragNDropValueObject },
              private dialogService: DialogService,
              private idService: IDService) { }

  checkAlias(alias: string): void {
    this.aliasProblem = this.problemOf(alias);
  }

  private problemOf(alias: string): string | null {
    const problem = VariableAlias.problemOf(alias, this.idService.isAliasAvailable(alias, this.data.value.alias));
    return problem ? VariableAlias.PROBLEM_KEYS[problem] : null;
  }

  async loadImage(): Promise<void> {
    const file = await this.dialogService.importImage();
    if (file) {
      this.newLabel.imgSrc = file.content;
      this.newLabel.imgFileName = file.name;
    }
  }

  /** Sends the image that is already in the label through the compression dialog (#1378). */
  async compressImage(): Promise<void> {
    const compressed = await this.dialogService.compressEmbeddedImage(this.newLabel.imgSrc as string);
    if (compressed) this.newLabel.imgSrc = compressed;
  }

  async loadAudio() {
    const audio = await FileService.loadAudio();
    this.newLabel.audioSrc = audio.content;
    this.newLabel.audioFileName = audio.name;
  }
}

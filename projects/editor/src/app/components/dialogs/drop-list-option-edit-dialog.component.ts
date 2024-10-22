import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-drop-list-option-edit-dialog',
  template: `
    <div class="wrapper">
      <h2 mat-dialog-title>Ablegelistenoption anpassen</h2>
      <mat-dialog-content class="content">
        <mat-form-field>
          <mat-label>{{'text' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newLabel.text">
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{'id' | translate }}</mat-label>
          <input matInput type="text" [(ngModel)]="newLabel.id">
        </mat-form-field>

        <div class="media-panels">
          <fieldset class="image-panel-controls">
            <legend>Bild</legend>
            <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
            <button mat-raised-button [disabled]="newLabel.imgSrc === null" (click)="newLabel.imgSrc = null">
              {{ 'removeImage' | translate }}
            </button>
            <mat-form-field>
              <mat-label>{{'imagePosition' | translate }}</mat-label>
              <mat-select [(ngModel)]="newLabel.imgPosition"
                          [disabled]="newLabel.imgSrc == null">
                <mat-option *ngFor="let option of ['above', 'below', 'left', 'right']"
                            [value]="option">
                  {{ option | translate }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </fieldset>

          <fieldset>
            <legend>Audio</legend>
            <div class="image-panel-controls">
              <button mat-raised-button (click)="loadAudio()">
                {{(newLabel.audioSrc ? 'changeAudio' : 'loadAudio') | translate }}
              </button>
              <button mat-raised-button [disabled]="newLabel.audioSrc === null" (click)="newLabel.audioSrc = null">
                {{ 'removeAudio' | translate }}
              </button>
            </div>
          </fieldset>
        </div>

        <fieldset [style.height.px]="180" [style.margin-top.px]="10">
          <legend>Vorschau</legend>
          <aspect-text-image-panel [label]="newLabel" [style.justify-content]="'center'"></aspect-text-image-panel>
        </fieldset>

      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="newLabel">{{'save' | translate }}</button>
        <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .wrapper {
      display:flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
    .image-panel-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    aspect-text-image-panel {
      margin-left: auto;
      margin-right: auto;
    }
    .media-panels {
      display: flex;
      flex-direction: row;
    }
    .media-panels fieldset {
      width: 50%;
    }
  `]
})
export class DropListOptionEditDialogComponent {
  newLabel = { ...this.data.value };

  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: DragNDropValueObject }) { }

  async loadImage(): Promise<void> {
    const image = await FileService.loadImage();
    this.newLabel.imgSrc = image.content;
    this.newLabel.imgFileName = image.name;
  }

  async loadAudio() {
    const audio = await FileService.loadAudio();
    this.newLabel.audioSrc = audio.content;
    this.newLabel.audioFileName = audio.name;
  }
}

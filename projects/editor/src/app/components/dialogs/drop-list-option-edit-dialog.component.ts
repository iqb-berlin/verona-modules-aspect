import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'common/services/file.service';
import { DragNDropValueObject } from 'common/models/elements/label-interfaces';

@Component({
  selector: 'aspect-drop-list-option-edit-dialog',
  template: `
    <mat-dialog-content class="fx-column-start-stretch fx-gap-20">
      <mat-form-field>
        <mat-label>{{'text' | translate }}</mat-label>
        <input #textField matInput type="text" [value]="data.value.text">
      </mat-form-field>
      <div *ngIf="!audioSrc" class="fx-column-start-stretch fx-gap-3">
        <button mat-raised-button (click)="loadImage()">{{ 'loadImage' | translate }}</button>
        <button mat-raised-button (click)="imgSrc = null">{{ 'removeImage' | translate }}</button>
        <img [src]="imgSrc"
             [style.object-fit]="'scale-down'"
             [width]="200">
      </div>
      <div *ngIf="!imgSrc" class="fx-column-start-stretch fx-gap-3">
        <button mat-raised-button (click)="loadAudio()">
          {{(audioSrc ? 'changeAudio' : 'loadAudio') | translate }}
        </button>
        <button mat-raised-button (click)="audioSrc = null">
          {{ 'removeAudio' | translate }}
        </button>
      </div>
      <mat-form-field>
        <mat-label>{{'id' | translate }}</mat-label>
        <input #idField matInput type="text" [value]="data.value.id">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{
        text: textField.value,
        imgSrc: imgSrc,
        audioSrc: audioSrc,
        id: idField.value
      }">
        {{'save' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .fx-gap-3 {
      gap: 3px;
    }
    .fx-gap-20 {
      gap: 20px;
    }
    .fx-column-start-stretch {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
  `]
})
export class DropListOptionEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { value: DragNDropValueObject }) { }
  imgSrc: string | null = this.data.value.imgSrc;
  audioSrc: string | null = this.data.value.audioSrc;

  async loadImage(): Promise<void> {
    this.imgSrc = await FileService.loadImage();
  }

  async loadAudio() {
    this.audioSrc = await FileService.loadAudio();
  }
}

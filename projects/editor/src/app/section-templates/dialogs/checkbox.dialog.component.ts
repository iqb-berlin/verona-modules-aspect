import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'aspect-editor-checkbox-wizard-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButton,
    RichTextEditorComponent,
    MatCheckbox,
    CdkDrag,
    CdkDropList,
    CdkTextareaAutosize,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatSuffix,
    NgForOf,
    FormsModule,
    MatLabel
  ],
  template: `
    <div mat-dialog-title>Assistent: Kontrollkästchen</div>
    <div mat-dialog-content>
      <h3>Frage</h3>
      <aspect-rich-text-editor [(content)]="text1" [placeholder]="'Hier steht die Fragestellung.'">
      </aspect-rich-text-editor>

      <h3>Optionen</h3>
      <mat-checkbox [style.margin-bottom.px]="10" [(ngModel)]="useImages">Bildoptionen verwenden</mat-checkbox>

      @if (!useImages) {
        <mat-form-field appearance="outline">
          <mat-label>Neue Option</mat-label>
          <textarea #newItem matInput cdkTextareaAutosize type="text"
                    (keydown.enter)="$event.stopPropagation(); $event.preventDefault();"
                    (keyup.enter)="options.push(newItem.value); newItem.select()"></textarea>
          <button mat-icon-button matSuffix color="primary"
                  [disabled]="newItem.value === ''"
                  (click)="options.push(newItem.value); newItem.select()">
            <mat-icon>add</mat-icon>
          </button>
        </mat-form-field>
      } @else {
        <button mat-stroked-button (click)="imageUpload.click();">Bild hochladen</button>
        <input type="file" hidden accept="image/*" #imageUpload id="button-image-upload"
               (change)="loadImage(options, imageUpload)">
      }
      <div class="drop-list" cdkDropList [cdkDropListData]="options" (cdkDropListDropped)="drop($event)">
        <div *ngFor="let item of options; let i = index" cdkDrag cdkDragLockAxis="y" class="drop-list-option">
          @if (useImages) {
            <img [src]="item" [style.object-fit]="'scale-down'" [style.height.px]="40">
          } @else {
            <div class="text-item">{{ item }}</div>
          }
          <button mat-icon-button color="primary" (click)="removeListItem(options, i)">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button [disabled]="options.length < 1"
              [mat-dialog-close]="{ text1, options, useImages }">{{'confirm' | translate }}</button>
      <button mat-button mat-dialog-close>{{'cancel' | translate }}</button>
    </div>
  `,
  styles: `
    .mat-mdc-dialog-content {display: flex; flex-direction: column;}
    .mat-mdc-dialog-content > *:not(h3) {margin-left: 30px;}
    h3:not(:first-child) {margin-top: 40px;}
    .drop-list-option {
      display: flex;
      align-items: center;
      margin-left: 20px;
    }
    .drop-list-option .text-item {
      overflow: auto;
      max-height: 100px;
    }
    .drop-list-option button {
      margin-left: auto;
    }
  `
})
export class CheckboxWizardDialogComponent {
  text1: string = '';
  options: string[] = [];
  useImages: boolean = false;

  // eslint-disable-next-line class-methods-use-this
  async loadImage(list: string[], eventTarget: HTMLInputElement): Promise<void> {
    const imgSrc = await FileService.readFileAsText(eventTarget.files?.[0] as File, true);
    list.push(imgSrc);
  }

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
  }
}

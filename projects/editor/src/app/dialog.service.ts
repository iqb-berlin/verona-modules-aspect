// eslint-disable-next-line max-classes-per-file
import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FileService } from '../../../common/file.service';
import { LikertElementRow } from '../../../common/models/compound-elements/likert-element-row';
import { AnswerOption } from '../../../common/interfaces/UIElementInterfaces';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(text: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialog, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(MultilineTextEditDialog, {
      width: '600px',
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialog, {
      width: '800px',
      height: '700px',
      data: {
        text: text
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showLikertAnswerEditDialog(answer: AnswerOption): Observable<AnswerOption> {
    const dialogRef = this.dialog.open(LikertAnswerEditDialog, {
      width: '300px',
      height: '550px',
      data: {
        answer: answer
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showLikertQuestionEditDialog(question: LikertElementRow): Observable<LikertElementRow> {
    const dialogRef = this.dialog.open(LikertQuestionEditDialog, {
      width: '300px',
      height: '550px',
      data: {
        question: question
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <mat-dialog-content>
        {{data.text}}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class ConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Text</mat-label>
        <input #inputElement matInput type="text" [value]="data.text">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class TextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-multiline-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field [style.width.%]="100">
        <mat-label>Text</mat-label>
        <textarea #inputElement matInput type="text" [value]="data.text">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class MultilineTextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-rich-text-edit-dialog-tinymce',
  template: `
    <mat-dialog-content>
      <app-rich-text-editor [(text)]="data.text"></app-rich-text-editor>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.text">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
    `
})
export class RichTextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { text: string }) { }
}

@Component({
  selector: 'app-likert-answer-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>Text</mat-label>
        <input #textInput matInput type="text" [value]="data.answer.text">
      </mat-form-field>
      <input #imageUpload type="file" hidden (click)="loadImage()">
      <button mat-raised-button (click)="imageUpload.click()">Bild laden</button>
      <button mat-raised-button (click)="data.answer.imgSrc = null">Bild entfernen</button>
      <img [src]="data.answer.imgSrc"
           [style.object-fit]="'scale-down'"
           [width]="200">
      <mat-form-field appearance="fill">
        <mat-label>Position</mat-label>
        <mat-select [value]="data.answer.position"
                    (selectionChange)="this.data.answer.position = $event.value">
          <mat-option *ngFor="let option of [{displayValue: 'oben', value: 'above'},
                                               {displayValue: 'unten', value: 'below'}]"
                      [value]="option.value">
            {{option.displayValue}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{
                         text: textInput.value,
                         imgSrc: data.answer.imgSrc,
                         position: data.answer.position }">
        Speichern
      </button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
  `
})
export class LikertAnswerEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { answer: AnswerOption }) { }

  async loadImage(): Promise<void> {
    this.data.answer.imgSrc = await FileService.loadImage();
  }
}

@Component({
  selector: 'app-likert-question-edit-dialog',
  template: `
    <mat-dialog-content fxLayout="column">
      <mat-form-field>
        <mat-label>Text</mat-label>
        <input #textField matInput type="text" [value]="data.question.text">
      </mat-form-field>
      <mat-form-field>
        <mat-label>ID</mat-label>
        <input #idField matInput type="text" [value]="data.question.id">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ text: textField.value, id: idField.value }">Speichern</button>
      <button mat-button mat-dialog-close>Abbrechen</button>
    </mat-dialog-actions>
  `
})
export class LikertQuestionEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { question: LikertElementRow }) { }
}

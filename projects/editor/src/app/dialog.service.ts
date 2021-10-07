// eslint-disable-next-line max-classes-per-file
import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

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

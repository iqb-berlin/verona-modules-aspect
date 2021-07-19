// eslint-disable-next-line max-classes-per-file
import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog);
    return dialogRef.afterClosed();
  }

  showTextEditDialog(oldText: string, multiline: boolean = false): Observable<string> {
    let dialogRef = null;
    if (multiline) {
      dialogRef = this.dialog.open(MultilineTextEditDialog, {
        width: '600px',
        data: {
          oldText: oldText
        }
      });
    } else {
      dialogRef = this.dialog.open(TextEditDialog, {
        data: {
          oldText: oldText
        }
      });
    }
    return dialogRef.afterClosed();
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <mat-dialog-content>
        Seite wirklich löschen?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="true">Okay</button>
      <button mat-button mat-dialog-close>Abbruch</button>
    </mat-dialog-actions>
    `
})
export class ConfirmationDialog {}

@Component({
  selector: 'app-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Text</mat-label>
        <input #inputElement matInput type="text" [value]="data.oldText">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Okay</button>
      <button mat-button mat-dialog-close>Abbruch</button>
    </mat-dialog-actions>
    `
})
export class TextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { oldText: string }) { }
}

@Component({
  selector: 'app-multiline-text-edit-dialog',
  template: `
    <mat-dialog-content>
      <mat-form-field [style.width.%]="100">
        <mat-label>Text</mat-label>
        <textarea #inputElement matInput type="text" [value]="data.oldText">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="inputElement.value">Okay</button>
      <button mat-button mat-dialog-close>Abbruch</button>
    </mat-dialog-actions>
    `
})
export class MultilineTextEditDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { oldText: string }) { }
}

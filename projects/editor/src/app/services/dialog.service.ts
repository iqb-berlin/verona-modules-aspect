import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PlayerElement, LikertColumn } from '../../../../common/interfaces/UIElementInterfaces';
import { LikertElementRow } from '../../../../common/models/compound-elements/likert-element-row';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from '../components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from '../components/dialogs/text-edit-multiline-dialog.component';
import { RichTextEditDialogComponent } from '../components/dialogs/rich-text-edit-dialog.component';
import { PlayerEditDialogComponent } from '../components/dialogs/player-edit-dialog.component';
import { LikertColumnEditDialogComponent } from '../components/dialogs/likert-column-edit-dialog.component';
import { LikertRowEditDialogComponent } from '../components/dialogs/likert-row-edit-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(text: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialogComponent, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditMultilineDialogComponent, {
      data: {
        text: text
      }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        text: text
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(player: PlayerElement): Observable<PlayerElement> {
    const dialogRef = this.dialog.open(PlayerEditDialogComponent, {
      data: {
        player: player
      }
    });
    return dialogRef.afterClosed();
  }

  showLikertColumnEditDialog(column: LikertColumn): Observable<LikertColumn> {
    const dialogRef = this.dialog.open(LikertColumnEditDialogComponent, {
      data: {
        column: column
      }
    });
    return dialogRef.afterClosed();
  }

  showLikertRowEditDialog(row: LikertElementRow, columns: LikertColumn[]): Observable<LikertElementRow> {
    const dialogRef = this.dialog.open(LikertRowEditDialogComponent, {
      data: {
        row: row,
        columns: columns
      }
    });
    return dialogRef.afterClosed();
  }
}
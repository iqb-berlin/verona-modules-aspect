import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from '../components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from '../components/dialogs/text-edit-multiline-dialog.component';
import { RichTextEditDialogComponent } from '../components/dialogs/rich-text-edit-dialog.component';
import { PlayerEditDialogComponent } from '../components/dialogs/player-edit-dialog.component';
import { ColumnHeaderEditDialogComponent } from '../components/dialogs/column-header-edit-dialog.component';
import { LikertRowEditDialogComponent } from '../components/dialogs/likert-row-edit-dialog.component';
import { DropListOptionEditDialogComponent } from '../components/dialogs/drop-list-option-edit-dialog.component';
import { RichTextSimpleEditDialogComponent } from '../components/dialogs/rich-text-simple-edit-dialog.component';
import { DragNDropValueObject, PlayerProperties, TextImageLabel } from 'common/models/elements/element';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showConfirmDialog(text: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showDropListOptionEditDialog(value: DragNDropValueObject): Observable<DragNDropValueObject> {
    const dialogRef = this.dialog.open(DropListOptionEditDialogComponent, {
      data: { value }
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditMultilineDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string, defaultFontSize: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        content: text,
        defaultFontSize,
        clozeMode: false
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showRichTextSimpleEditDialog(text: string, defaultFontSize: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextSimpleEditDialogComponent, {
      data: {
        content: text,
        defaultFontSize
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showClozeTextEditDialog(document: ClozeDocument, defaultFontSize: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: { content: document, defaultFontSize, clozeMode: true },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(playerProps: PlayerProperties): Observable<PlayerProperties> {
    const dialogRef = this.dialog.open(PlayerEditDialogComponent, {
      data: { playerProps }
    });
    return dialogRef.afterClosed();
  }

  showLikertColumnEditDialog(column: TextImageLabel, defaultFontSize: number): Observable<TextImageLabel> {
    const dialogRef = this.dialog.open(ColumnHeaderEditDialogComponent, {
      data: { column, defaultFontSize }
    });
    return dialogRef.afterClosed();
  }

  showLikertRowEditDialog(row: LikertRowElement, columns: TextImageLabel[]): Observable<LikertRowElement> {
    const dialogRef = this.dialog.open(LikertRowEditDialogComponent, {
      data: { row, columns }
    });
    return dialogRef.afterClosed();
  }
}

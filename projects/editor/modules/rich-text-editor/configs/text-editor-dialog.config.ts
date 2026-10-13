import { MatDialogConfig } from '@angular/material/dialog';

/**
 * For every dialog that hosts a rich text editor. Material stops the content of a dialog at 65vh,
 * whatever the window: at 650px of height that is 423px, with the toolbar taking 258 of them while
 * 114px of the window stay unused around the dialog (#1006). The panel class lifts that limit in
 * `styles.css`, and the dialog may take the window instead. What still does not fit scrolls inside
 * the content, as before, with title and buttons in place.
 */
export const TEXT_EDITOR_DIALOG_CONFIG: Readonly<MatDialogConfig> = {
  panelClass: 'text-editor-dialog',
  maxHeight: '95vh'
};

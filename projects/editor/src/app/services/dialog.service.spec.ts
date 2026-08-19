import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { Mock } from 'vitest';
import { Label } from 'common/models/label-interfaces';
import { UnitDefErrorDialogComponent } from 'common/components/unit-def-error-dialog/unit-def-error-dialog.component';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  LabelEditDialogComponent
} from 'editor/src/app/components/dialogs/label-edit-dialog/label-edit-dialog.component';
import {
  DeleteConfirmationDialogComponent
} from 'editor/src/app/components/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import {
  TextEditDialogComponent
} from 'editor/src/app/components/dialogs/text-edit-dialog/text-edit-dialog.component';
import {
  RichTextEditDialogComponent
} from 'editor/src/app/components/dialogs/rich-text-edit-dialog/rich-text-edit-dialog.component';
import {
  SanitizationDialogComponent
} from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';

describe('DialogService', () => {
  let service: DialogService;
  let dialogMock: { open: Mock };

  const mockDialogResult = (result: unknown): void => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });
  };

  beforeEach(() => {
    dialogMock = { open: vi.fn() };
    service = new DialogService(dialogMock as unknown as MatDialog);
  });

  it('should open the label edit dialog and pass through its result', () => {
    const label: Label = { text: 'Beschriftung' };
    const editedLabel: Label = { text: 'Neue Beschriftung' };
    mockDialogResult(editedLabel);

    let result: Label | undefined;
    service.showLabelEditDialog(label).subscribe(dialogResult => {
      result = dialogResult;
    });

    expect(dialogMock.open).toHaveBeenCalledWith(
      LabelEditDialogComponent,
      { data: { label }, autoFocus: false }
    );
    expect(result).toBe(editedLabel);
  });

  it('should open the delete confirmation dialog with the given text', () => {
    mockDialogResult(true);

    let result: boolean | undefined;
    service.showDeleteConfirmDialog('Wirklich löschen?', new Subject<void>()).subscribe(dialogResult => {
      result = dialogResult;
    });

    expect(dialogMock.open).toHaveBeenCalledWith(
      DeleteConfirmationDialogComponent,
      { data: { text: 'Wirklich löschen?', elementList: undefined, refs: undefined } }
    );
    expect(result).toBe(true);
  });

  /* The dialog belongs to the unit the caller asked about; UnitService.prepareDelete drops the result
     of one that outlived its unit, and leaving the dialog up would let the user answer for a unit that
     is no longer there (#1253). */
  it('should close the delete confirmation dialog when the unit under it is replaced', () => {
    const afterClosed = new Subject<boolean>();
    const close = vi.fn();
    dialogMock.open.mockReturnValue({ afterClosed: () => afterClosed, close });
    const unitReplaced = new Subject<void>();
    service.showDeleteConfirmDialog('Wirklich löschen?', unitReplaced).subscribe();

    unitReplaced.next();

    expect(close).toHaveBeenCalledWith(false);
  });

  it('should stop watching for a replaced unit once the delete confirmation dialog is closed', () => {
    const afterClosed = new Subject<boolean>();
    const close = vi.fn();
    dialogMock.open.mockReturnValue({ afterClosed: () => afterClosed, close });
    const unitReplaced = new Subject<void>();
    service.showDeleteConfirmDialog('Wirklich löschen?', unitReplaced).subscribe();

    afterClosed.next(true);
    unitReplaced.next();

    expect(close).not.toHaveBeenCalled();
  });

  it('should open the unit definition error dialog without close option', () => {
    service.showUnitDefErrorDialog('Fehlertext');

    expect(dialogMock.open).toHaveBeenCalledWith(
      UnitDefErrorDialogComponent,
      { data: { text: 'Fehlertext' }, disableClose: true }
    );
  });

  describe('sanitization dialog superseded by a later load (#1247)', () => {
    let afterClosed: Subject<boolean | undefined>;
    let close: Mock;
    let superseded: Subject<void>;

    beforeEach(() => {
      afterClosed = new Subject<boolean | undefined>();
      close = vi.fn();
      superseded = new Subject<void>();
      dialogMock.open.mockReturnValue({ afterClosed: () => afterClosed, close });
    });

    it('should open the sanitization dialog without close option', () => {
      service.showSanitizationDialog(superseded).subscribe();

      expect(dialogMock.open).toHaveBeenCalledWith(
        SanitizationDialogComponent,
        { disableClose: true }
      );
    });

    it('should close the sanitization dialog when a later load supersedes it', () => {
      service.showSanitizationDialog(superseded).subscribe();

      superseded.next();

      /* Not the value the dialog's own button reports -- that is what tells the two apart below. */
      expect(close).toHaveBeenCalledWith(false);
    });

    it('should emit when the user confirms the sanitization dialog', () => {
      let confirmed = false;
      service.showSanitizationDialog(superseded).subscribe(() => { confirmed = true; });

      afterClosed.next(true);

      expect(confirmed).toBe(true);
    });

    /* MatDialogRef reports the result after the dialog is gone, so the stream has already ended by the
       time the superseding close arrives. The value it carries is what holds even without that order. */
    it('should emit nothing when the close it causes reports back at once', () => {
      close.mockImplementation((result?: boolean) => afterClosed.next(result as boolean));
      let confirmed = false;
      service.showSanitizationDialog(superseded).subscribe(() => { confirmed = true; });

      superseded.next();

      expect(confirmed).toBe(false);
    });

    it('should emit nothing once superseded, not even for a confirmation', () => {
      let confirmed = false;
      service.showSanitizationDialog(superseded).subscribe(() => { confirmed = true; });

      superseded.next();
      afterClosed.next(true);

      expect(confirmed).toBe(false);
    });

    /* MatDialog closes its open dialogs on teardown, with no result. Without a load behind it, that
       close reaches the stream unended -- migrating and reporting a unit to the host while the editor
       is going away. */
    it('should emit nothing when the dialog is closed without a confirmation', () => {
      let confirmed = false;
      service.showSanitizationDialog(superseded).subscribe(() => { confirmed = true; });

      afterClosed.next(undefined);

      expect(confirmed).toBe(false);
    });

    it('should stop watching for supersession once the sanitization dialog is closed', () => {
      service.showSanitizationDialog(superseded).subscribe();

      afterClosed.next(true);
      superseded.next();

      expect(close).not.toHaveBeenCalled();
    });
  });

  it('should open the text edit dialog and pass through the edited text', () => {
    mockDialogResult('bearbeiteter Text');

    let result: string | undefined;
    service.showTextEditDialog('alter Text').subscribe(dialogResult => {
      result = dialogResult;
    });

    expect(dialogMock.open).toHaveBeenCalledWith(
      TextEditDialogComponent,
      { data: { text: 'alter Text' }, autoFocus: false }
    );
    expect(result).toBe('bearbeiteter Text');
  });

  it('should open the rich text edit dialog without cloze mode', () => {
    mockDialogResult('<p>Text</p>');

    service.showRichTextEditDialog('<p>Alt</p>', 20).subscribe();

    expect(dialogMock.open).toHaveBeenCalledWith(
      RichTextEditDialogComponent,
      {
        data: { content: '<p>Alt</p>', defaultFontSize: 20, clozeMode: false },
        autoFocus: false
      }
    );
  });
});

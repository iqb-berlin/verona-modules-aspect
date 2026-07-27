import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
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
    service.showDeleteConfirmDialog('Wirklich löschen?').subscribe(dialogResult => {
      result = dialogResult;
    });

    expect(dialogMock.open).toHaveBeenCalledWith(
      DeleteConfirmationDialogComponent,
      { data: { text: 'Wirklich löschen?', elementList: undefined, refs: undefined } }
    );
    expect(result).toBe(true);
  });

  it('should open the unit definition error dialog without close option', () => {
    service.showUnitDefErrorDialog('Fehlertext');

    expect(dialogMock.open).toHaveBeenCalledWith(
      UnitDefErrorDialogComponent,
      { data: { text: 'Fehlertext' }, disableClose: true }
    );
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

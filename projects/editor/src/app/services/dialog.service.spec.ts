import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Mock } from 'vitest';
import { Label } from 'common/models/label-interfaces';
import { FileService } from 'common/services/file.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MessageService } from 'editor/src/app/services/message.service';
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
import {
  ImageResizeDialogComponent
} from 'editor/src/app/components/dialogs/image-resize-dialog/image-resize-dialog.component';

describe('DialogService', () => {
  let service: DialogService;
  let dialogMock: { open: Mock };
  let messageService: SpyObj<MessageService>;

  const mockDialogResult = (result: unknown): void => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });
  };

  beforeEach(() => {
    dialogMock = { open: vi.fn() };
    messageService = createSpyObj<MessageService>(['showError']);
    const translateService = { instant: (key: string) => key } as unknown as TranslateService;
    service = new DialogService(dialogMock as unknown as MatDialog, messageService, translateService);
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

  /* The way in for an image that is already in the unit: the same dialog the upload path opens, and
     the same `scaleImage` behind it - only the file picker in front of it is missing (#1378). */
  describe('compressEmbeddedImage', () => {
    const image = 'data:image/png;base64,abc';

    it('should tell the dialog that the image is already embedded', async () => {
      mockDialogResult({ maxWidth: 100 });
      vi.spyOn(FileService, 'scaleImage').mockResolvedValue('data:image/png;base64,klein');

      await service.compressEmbeddedImage(image);

      expect(dialogMock.open).toHaveBeenCalledWith(
        ImageResizeDialogComponent,
        {
          data: {
            base64: image, options: { recompress: true }, isEmbedded: true, hasFixedOverlays: false
          },
          width: '500px',
          autoFocus: false
        }
      );
    });

    /* Only this element type has anything pinned to the image's pixels, and the dialog can only warn
       about it if the caller says so (#1399). */
    it('should pass on that the image carries hotspots', async () => {
      mockDialogResult({ maxWidth: 100 });
      vi.spyOn(FileService, 'scaleImage').mockResolvedValue('data:image/png;base64,klein');

      await service.compressEmbeddedImage(image, true);

      expect(dialogMock.open).toHaveBeenCalledWith(
        ImageResizeDialogComponent,
        {
          data: {
            base64: image, options: { recompress: true }, isEmbedded: true, hasFixedOverlays: true
          },
          width: '500px',
          autoFocus: false
        }
      );
    });

    it('should return the image scaled with the chosen options', async () => {
      mockDialogResult({ maxWidth: 100, targetMimeType: 'image/webp' });
      const scaleImage = vi.spyOn(FileService, 'scaleImage')
        .mockResolvedValue('data:image/webp;base64,klein');

      const result = await service.compressEmbeddedImage(image);

      expect(scaleImage).toHaveBeenCalledWith(image, { maxWidth: 100, targetMimeType: 'image/webp' });
      expect(result).toBe('data:image/webp;base64,klein');
    });

    /* The buttons are `disabledInteractive` so their tooltip can name the reason, and such a button
       still fires its click - so the refusal has to sit here rather than in the markup alone. */
    it('should refuse a format that cannot be scaled without opening the dialog', async () => {
      const result = await service.compressEmbeddedImage('data:image/svg+xml;base64,abc');

      expect(result).toBeNull();
      expect(dialogMock.open).not.toHaveBeenCalled();
    });

    /* The button offers itself on the `data:` prefix alone, so an image whose payload no longer
       decodes gets this far. Saying so beats the unexpected-error dialog that an escaping rejection
       would raise, and the caller still writes nothing. */
    it('should report an image that cannot be read instead of throwing', async () => {
      mockDialogResult({ maxWidth: 100 });
      vi.spyOn(FileService, 'scaleImage').mockRejectedValue(new Error('broken'));

      const result = await service.compressEmbeddedImage(image);

      expect(result).toBeNull();
      expect(messageService.showError).toHaveBeenCalledWith('imageCompressionFailed');
    });

    /* Null rather than the unchanged image, so a caller can leave its property alone instead of
       writing the same value back into every selected element. */
    it('should return null when the dialog is cancelled', async () => {
      mockDialogResult(undefined);
      // The spy outlives the tests above, which did scale - so it starts counting here.
      const scaleImage = vi.spyOn(FileService, 'scaleImage').mockClear();

      const result = await service.compressEmbeddedImage(image);

      expect(result).toBeNull();
      expect(scaleImage).not.toHaveBeenCalled();
    });
  });

  /* The upload path shares the dialog, and nothing there is embedded - the hint about a second loss
     of quality would be wrong on the way in, where there is nothing to lose yet. `recompress` stays
     off with it, so an upload the author only confirms travels through unaltered (#1398). */
  it('should open the image resize dialog without the embedded flag for an upload', () => {
    mockDialogResult({ maxWidth: 100 });

    service.showImageResizeDialog('data:image/png;base64,abc', {}).subscribe();

    expect(dialogMock.open).toHaveBeenCalledWith(
      ImageResizeDialogComponent,
      {
        data: {
          base64: 'data:image/png;base64,abc', options: {}, isEmbedded: false, hasFixedOverlays: false
        },
        width: '500px',
        autoFocus: false
      }
    );
  });
});

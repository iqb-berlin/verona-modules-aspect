import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Mock } from 'vitest';
import { MessageService } from 'editor/src/app/services/message.service';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';

describe('MessageService', () => {
  let service: MessageService;
  let snackBarMock: { open: Mock };
  let dialogMock: { open: Mock };

  beforeEach(() => {
    snackBarMock = { open: vi.fn() };
    dialogMock = { open: vi.fn() };
    service = new MessageService(
      snackBarMock as unknown as MatSnackBar,
      dialogMock as unknown as MatDialog
    );
  });

  it('should show a plain message with default duration', () => {
    service.showMessage('Hinweis');
    expect(snackBarMock.open).toHaveBeenCalledWith('Hinweis', undefined, { duration: 3000 });
  });

  it('should show success and warning messages with their panel classes', () => {
    service.showSuccess('Gespeichert');
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Gespeichert', undefined, { duration: 3000, panelClass: 'snackbar-success' });

    service.showWarning('Achtung', 5000);
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Achtung', undefined, { duration: 5000, panelClass: 'snackbar-warning' });
  });

  it('should show errors with the error panel class', () => {
    service.showError('Fehler');
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Fehler', undefined, { duration: 3000, panelClass: 'snackbar-error' });
  });

  it('should show prompts with an OK action and without auto dismiss', () => {
    service.showPrompt('Bitte bestätigen');
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Bitte bestätigen', 'OK', { panelClass: 'snackbar-error' });
  });

  it('should open the unexpected error dialog with the error as data and return its ref', () => {
    const dialogRef = { afterClosed: vi.fn() };
    dialogMock.open.mockReturnValue(dialogRef);
    const error = new Error('kaputt');

    expect(service.showErrorPrompt(error)).toBe(dialogRef);
    expect(dialogMock.open).toHaveBeenCalledWith(UnexpectedErrorComponent, { data: error });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  UnexpectedErrorComponent
} from 'editor/src/app/components/unexpected-error/unexpected-error.component';

describe('UnexpectedErrorComponent', () => {
  let component: UnexpectedErrorComponent;
  let fixture: ComponentFixture<UnexpectedErrorComponent>;
  let clipboard: SpyObj<Clipboard>;
  let dialogRef: SpyObj<MatDialogRef<UnexpectedErrorComponent>>;
  let error: Error;

  beforeEach(async () => {
    error = new Error('Etwas ist schiefgelaufen');
    error.stack = 'at someFunction (file.ts:1:1)';
    clipboard = createSpyObj<Clipboard>(['copy']);
    dialogRef = createSpyObj<MatDialogRef<UnexpectedErrorComponent>>(['close']);

    await TestBed.configureTestingModule({
      declarations: [UnexpectedErrorComponent],
      imports: [
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Clipboard, useValue: clipboard },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: error }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnexpectedErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the report title from the error message', () => {
    expect(component.reportTitle).toBe('Generierte Fehlermeldung: Etwas ist schiefgelaufen');
  });

  it('should build an url-encoded report body containing version, user agent and stack', () => {
    const decodedBody = decodeURIComponent(component.reportBody);

    expect(decodedBody).toContain('Editorversion:');
    expect(decodedBody).toContain(navigator.userAgent);
    expect(decodedBody).toContain('at someFunction (file.ts:1:1)');
  });

  it('should open a prefilled GitHub issue in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    component.reportErrorViaGitHub();

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target] = openSpy.mock.lastCall as [string, string];
    expect(url).toContain('https://github.com/iqb-berlin/verona-modules-aspect/issues/new');
    expect(url).toContain(`&title=${component.reportTitle}`);
    expect(url).toContain(`&body=${component.reportBody}`);
    expect(target).toBe('_blank');
  });

  it('should copy message and stack to the clipboard', () => {
    component.copyDetailsToClipboard();

    expect(clipboard.copy)
      .toHaveBeenCalledWith(JSON.stringify('Etwas ist schiefgelaufenat someFunction (file.ts:1:1)'));
  });

  it('should close the dialog via the discard button', () => {
    const discardButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('mat-dialog-actions button');
    discardButton.click();

    expect(dialogRef.close).toHaveBeenCalled();
  });
});

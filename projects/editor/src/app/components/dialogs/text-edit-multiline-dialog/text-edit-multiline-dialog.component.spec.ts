import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import {
  TextEditMultilineDialogComponent
} from 'editor/src/app/components/dialogs/text-edit-multiline-dialog/text-edit-multiline-dialog.component';

describe('TextEditMultilineDialogComponent', () => {
  let component: TextEditMultilineDialogComponent;
  let fixture: ComponentFixture<TextEditMultilineDialogComponent>;
  let dialogRefMock: { close: Mock };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [TextEditMultilineDialogComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { text: 'Zeile 1\nZeile 2' } },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextEditMultilineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getTextarea = (): HTMLTextAreaElement => fixture.nativeElement
    .querySelector('textarea') as HTMLTextAreaElement;

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the textarea with the injected multiline text', () => {
    expect(getTextarea().value).toBe('Zeile 1\nZeile 2');
  });

  it('should close with the edited text', () => {
    const textarea = getTextarea();
    textarea.value = 'Zeile 1\nZeile 2\nZeile 3';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    getActionButtons()[0].click();

    expect(dialogRefMock.close).toHaveBeenCalledWith('Zeile 1\nZeile 2\nZeile 3');
  });

  it('should close without a result on cancel', () => {
    getActionButtons()[1].click();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close.mock.lastCall?.[0]).toBeFalsy();
  });

  it('should not modify the injected data', () => {
    const textarea = getTextarea();
    textarea.value = 'geändert';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.data.text).toBe('Zeile 1\nZeile 2');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { TextEditDialogComponent } from 'editor/src/app/components/dialogs/text-edit-dialog/text-edit-dialog.component';

describe('TextEditDialogComponent', () => {
  let component: TextEditDialogComponent;
  let fixture: ComponentFixture<TextEditDialogComponent>;
  let dialogRefMock: { close: Mock };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [TextEditDialogComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { text: 'Ausgangstext' } },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getInput = (): HTMLInputElement => fixture.nativeElement.querySelector('input') as HTMLInputElement;

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the input with the injected text', () => {
    expect(component.data.text).toBe('Ausgangstext');
    expect(getInput().value).toBe('Ausgangstext');
  });

  it('should close with the edited text', () => {
    const input = getInput();
    input.value = 'Neuer Text';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    getActionButtons()[0].click();

    expect(dialogRefMock.close).toHaveBeenCalledWith('Neuer Text');
  });

  it('should close without a result on cancel', () => {
    getActionButtons()[1].click();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    expect(dialogRefMock.close.mock.lastCall?.[0]).toBeFalsy();
  });

  it('should not modify the injected data', () => {
    const input = getInput();
    input.value = 'Neuer Text';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.data.text).toBe('Ausgangstext');
  });
});

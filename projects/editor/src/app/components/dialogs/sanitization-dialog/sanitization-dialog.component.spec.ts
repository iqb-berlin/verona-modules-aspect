import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Mock } from 'vitest';
import {
  SanitizationDialogComponent
} from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';

describe('SanitizationDialogComponent', () => {
  let component: SanitizationDialogComponent;
  let fixture: ComponentFixture<SanitizationDialogComponent>;
  let dialogRefMock: { close: Mock };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [SanitizationDialogComponent],
      imports: [
        MatDialogModule,
        MatButtonModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SanitizationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inform about the pending unit definition update', () => {
    expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-title').textContent)
      .toContain('Unit-Definition wird aktualisiert');
    expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-content').textContent)
      .toContain('veraltete Unit-Definition');
  });

  it('should confirm on the single action button', () => {
    const buttons = fixture.nativeElement
      .querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(1);

    buttons[0].click();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    /* The only way the user can confirm; a close from anywhere else must be distinguishable from it
       (DialogService.showSanitizationDialog, #1247). */
    expect(dialogRefMock.close.mock.lastCall?.[0]).toBe(true);
  });
});

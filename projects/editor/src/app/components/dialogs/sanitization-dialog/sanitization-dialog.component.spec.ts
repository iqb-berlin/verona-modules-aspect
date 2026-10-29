import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
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
        MatButtonModule,
        MatIconModule,
        TranslateModule.forRoot()
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

  /* Saving makes the unit unreadable for older versions, which the warning symbol stands for (#1520). */
  it('should inform about the pending unit definition update behind a warning symbol', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('.mat-mdc-dialog-title');
    expect(title.textContent).toContain('sanitization.title');
    expect(title.querySelector('.message-icon-warning')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-content').textContent)
      .toContain('sanitization.text');
  });

  it('should confirm on the single action button', () => {
    const buttons = fixture.nativeElement
      .querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent?.trim()).toBe('sanitization.confirm');

    buttons[0].click();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    /* The only way the user can confirm; a close from anywhere else must be distinguishable from it
       (DialogService.showSanitizationDialog, #1247). */
    expect(dialogRefMock.close.mock.lastCall?.[0]).toBe(true);
  });
});

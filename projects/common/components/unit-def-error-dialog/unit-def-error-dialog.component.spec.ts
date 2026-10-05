import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UnitDefErrorDialogComponent } from './unit-def-error-dialog.component';

describe('UnitDefErrorDialogComponent', () => {
  let component: UnitDefErrorDialogComponent;
  let fixture: ComponentFixture<UnitDefErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDefErrorDialogComponent],
      imports: [MatDialogModule, MatIconModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { text: 'Testfehlermeldung' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitDefErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* An error by its symbol in front of the title, as in every message of the editor (#1520). */
  it('should render a dialog title led by an error symbol', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title.textContent).toContain('unitDefErrorTitle');
    expect(title.querySelector('.message-icon-error')).toBeTruthy();
  });

  it('should render the provided error text', () => {
    const content: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-content]');
    expect(content.textContent).toContain('Testfehlermeldung');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UnitDefErrorDialogComponent } from './unit-def-error-dialog.component';

describe('UnitDefErrorDialogComponent', () => {
  let component: UnitDefErrorDialogComponent;
  let fixture: ComponentFixture<UnitDefErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitDefErrorDialogComponent],
      imports: [MatDialogModule],
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

  it('should render a dialog title', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title.textContent).toContain('Unit-Definition kann nicht geladen werden');
  });

  it('should render the provided error text', () => {
    const content: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-content]');
    expect(content.textContent).toContain('Testfehlermeldung');
  });
});

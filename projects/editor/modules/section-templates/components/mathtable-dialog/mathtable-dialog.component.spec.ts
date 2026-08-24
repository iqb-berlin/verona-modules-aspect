import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  MathTableWizardDialogComponent
} from 'editor/modules/section-templates/components/mathtable-dialog/mathtable-dialog.component';

describe('MathTableWizardDialogComponent', () => {
  let component: MathTableWizardDialogComponent;
  let fixture: ComponentFixture<MathTableWizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathTableWizardDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MathTableWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with two empty terms and no operation', () => {
    expect(component.operation).toBeUndefined();
    expect(component.terms).toEqual(['', '']);
  });

  it('should add and remove terms', () => {
    component.addTerm();
    expect(component.terms.length).toBe(3);

    component.removeTerm(0);
    expect(component.terms.length).toBe(2);
  });

  it('should update a term and re-focus its input', fakeAsync(() => {
    component.changeTerm('123', 1);
    expect(component.terms[1]).toBe('123');

    const focusSpy = vi.spyOn(component.termInputs.toArray()[1].nativeElement, 'focus');
    component.changeTerm('456', 1);
    tick();
    expect(focusSpy).toHaveBeenCalled();
  }));

  it('should disable the confirm button until an operation is selected', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.operation = 'addition';
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should disable adding terms for multiplication with two terms', () => {
    component.operation = 'multiplication';
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.add-button') as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);

    component.operation = 'addition';
    fixture.detectChanges();
    expect(addButton.disabled).toBe(false);
  });

  it('should close the dialog with operation and terms on confirm', () => {
    component.operation = 'subtraction';
    component.terms = ['100', '58'];
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ operation: 'subtraction', terms: ['100', '58'] });
  });
});

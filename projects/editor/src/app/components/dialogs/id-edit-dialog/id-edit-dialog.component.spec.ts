import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { IDService } from 'editor/src/app/services/id.service';
import { IDEditDialogComponent } from 'editor/src/app/components/dialogs/id-edit-dialog/id-edit-dialog.component';

describe('IDEditDialogComponent', () => {
  let component: IDEditDialogComponent;
  let fixture: ComponentFixture<IDEditDialogComponent>;
  let idService: SpyObj<IDService>;
  let dialogRefMock: { close: Mock };

  beforeEach(async () => {
    idService = createSpyObj<IDService>(['isAliasAvailable']);
    idService.isAliasAvailable.mockReturnValue(true);
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [IDEditDialogComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { alias: 'text_1' } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: IDService, useValue: idService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IDEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getSaveButton = (): HTMLButtonElement => fixture.nativeElement
    .querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the control with the injected alias', () => {
    expect(component.aliasControl.value).toBe('text_1');
    expect(component.aliasControl.valid).toBe(true);
    expect(getSaveButton().disabled).toBe(false);
  });

  it('should accept the unchanged alias without asking the ID service', () => {
    idService.isAliasAvailable.mockReturnValue(false);

    component.aliasControl.setValue('text_1');

    expect(component.aliasControl.valid).toBe(true);
    expect(idService.isAliasAvailable).not.toHaveBeenCalled();
  });

  it('should mark an already taken alias as invalid', () => {
    idService.isAliasAvailable.mockReturnValue(false);

    component.aliasControl.setValue('text_2');
    fixture.detectChanges();

    expect(component.aliasControl.hasError('idTaken')).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should accept an available alias', () => {
    component.aliasControl.setValue('text_2');

    expect(idService.isAliasAvailable).toHaveBeenCalledWith('text_2');
    expect(component.aliasControl.valid).toBe(true);
  });

  it('should require a value', () => {
    component.aliasControl.setValue('');
    fixture.detectChanges();

    expect(component.aliasControl.hasError('required')).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should close with the new alias', () => {
    component.aliasControl.setValue('text_2');
    fixture.detectChanges();

    getSaveButton().click();

    expect(dialogRefMock.close).toHaveBeenCalledWith('text_2');
  });
});

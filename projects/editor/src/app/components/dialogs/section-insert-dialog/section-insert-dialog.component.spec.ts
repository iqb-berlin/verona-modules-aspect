import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { UnitService } from 'editor/src/app/services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SectionInsertDialogComponent } from './section-insert-dialog.component';

describe('SectionInsertDialogComponent', () => {
  let component: SectionInsertDialogComponent;
  let fixture: ComponentFixture<SectionInsertDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockUnitService = {
    savedSectionCode: ''
  };

  const mockIDService = {
    isIDAvailable: jasmine.createSpy('isIDAvailable').and.returnValue(true),
    isAliasAvailable: jasmine.createSpy('isAliasAvailable').and.returnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionInsertDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        FormsModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDividerModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { isSelectedSectionEmpty: true } },
        { provide: UnitService, useValue: mockUnitService },
        { provide: IDService, useValue: mockIDService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionInsertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect duplicate IDs correctly', () => {
    mockIDService.isIDAvailable.and.returnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as any);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isIDAvailable).toHaveBeenCalledWith('text_1');
  });

  it('should detect duplicate Aliases correctly', () => {
    mockIDService.isIDAvailable.and.returnValue(true);
    mockIDService.isAliasAvailable.and.returnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_alias_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as any);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('text_alias_1');
  });
});

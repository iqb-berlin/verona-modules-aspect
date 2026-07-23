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
    close: vi.fn()
  };

  const mockUnitService = {
    savedSectionCode: ''
  };

  const mockIDService = {
    isIDAvailable: vi.fn().mockReturnValue(true),
    isAliasAvailable: vi.fn().mockReturnValue(true)
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
    mockIDService.isIDAvailable.mockReturnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as any);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isIDAvailable).toHaveBeenCalledWith('text_1');
  });

  it('should detect duplicate Aliases correctly', () => {
    mockIDService.isIDAvailable.mockReturnValue(true);
    mockIDService.isAliasAvailable.mockReturnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_alias_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as any);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('text_alias_1');
  });
});

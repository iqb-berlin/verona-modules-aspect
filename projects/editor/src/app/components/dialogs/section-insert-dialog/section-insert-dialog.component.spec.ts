import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { UnitService } from 'editor/src/app/services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  SectionInsertDialogComponent
} from 'editor/src/app/components/dialogs/section-insert-dialog/section-insert-dialog.component';
import { UIElement } from 'common/models/elements/element';

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
        MatDividerModule,
        MatIconModule
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

  /* The state of reading is a symbol in front of the status line, the text keeps the colour of the dialog (#1520). */
  describe('status line', () => {
    const statusLine = (): HTMLElement => fixture.nativeElement.querySelector('.message-area');
    const paste = (text: string): void => {
      component.pasteSectionFromClipboard({
        preventDefault: () => {},
        clipboardData: { getData: () => text }
      } as unknown as ClipboardEvent);
      fixture.detectChanges();
    };

    it('should ask for a section without a symbol', () => {
      expect(statusLine().textContent).toContain('sectionInsert.pastePrompt');
      expect(statusLine().querySelector('mat-icon')).toBeNull();
      expect(statusLine().getAttribute('style')).toBeNull();
    });

    it('should mark text that is no section as an error', () => {
      paste('kein Abschnitt');

      expect(statusLine().textContent).toContain('sectionInsert.readError');
      expect(statusLine().querySelector('.message-icon-error')).toBeTruthy();
    });

    it('should mark ids already taken as a warning and still offer to insert', () => {
      mockIDService.isIDAvailable.mockReturnValue(false);
      paste(JSON.stringify({ elements: [{ type: 'text', id: 'text_1', alias: 'text_1' }] }));

      expect(statusLine().textContent).toContain('sectionInsert.duplicateIds');
      expect(statusLine().querySelector('.message-icon-warning')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-actions').textContent).toContain('confirm');
    });

    /* The symbol said success next to the error text, and the section read before stayed on offer. */
    it('should drop a section read before when the next paste is empty', () => {
      mockIDService.isIDAvailable.mockReturnValue(true);
      mockIDService.isAliasAvailable.mockReturnValue(true);
      paste(JSON.stringify({ elements: [] }));
      paste('');

      expect(statusLine().textContent).toContain('sectionInsert.readError');
      expect(statusLine().querySelector('.message-icon-error')).toBeTruthy();
      expect(component.newSection).toBeNull();
      expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-actions').textContent).not.toContain('confirm');
    });

    it('should mark a section read without conflicts as a success', () => {
      mockIDService.isIDAvailable.mockReturnValue(true);
      mockIDService.isAliasAvailable.mockReturnValue(true);
      paste(JSON.stringify({ elements: [] }));

      expect(statusLine().textContent).toContain('sectionInsert.readSuccess');
      expect(statusLine().querySelector('.status-icon-success')).toBeTruthy();
    });
  });

  it('should detect duplicate IDs correctly', () => {
    mockIDService.isIDAvailable.mockReturnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as unknown as UIElement[]);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isIDAvailable).toHaveBeenCalledWith('text_1');
  });

  it('should detect duplicate Aliases correctly', () => {
    mockIDService.isIDAvailable.mockReturnValue(true);
    mockIDService.isAliasAvailable.mockReturnValue(false);
    const mockElements = [{ id: 'text_1', alias: 'text_alias_1' }];
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const duplicates = component['findElementsWithDuplicateID'](mockElements as unknown as UIElement[]);
    expect(duplicates.length).toBe(1);
    expect(mockIDService.isAliasAvailable).toHaveBeenCalledWith('text_alias_1');
  });
});

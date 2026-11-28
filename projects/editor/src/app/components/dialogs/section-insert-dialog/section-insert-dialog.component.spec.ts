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
    isAliasAvailable: vi.fn().mockReturnValue(true),
    getAndRegisterNewIDs: vi.fn().mockReturnValue({ id: 'value_new', alias: 'value_3' })
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

  /* The dialog checked the names of the elements only. A section whose drop-list item carries a name the unit holds
     went in as it was, and the unit had two items under one name, which no response can tell apart (#1741). */
  describe('drop-list items whose name the unit holds', () => {
    type InsertedList = { id: string, alias: string, value: { id: string, alias: string, text: string }[] };
    const pasteList = (): void => {
      const list = {
        type: 'drop-list',
        id: 'drop-list_1',
        alias: 'liste',
        value: [{ text: 'Apfel', id: 'value_9', alias: 'value_1' }]
      };
      component.pasteSectionFromClipboard({
        preventDefault: () => {},
        clipboardData: { getData: () => JSON.stringify({ elements: [list] }) }
      } as unknown as ClipboardEvent);
      component.confirm();
    };
    const insertedList = (): InsertedList => mockDialogRef.close.mock.lastCall?.[0].newSection.elements[0];

    beforeEach(() => {
      mockIDService.isIDAvailable.mockReturnValue(true);
      mockIDService.getAndRegisterNewIDs.mockClear();
    });

    afterEach(() => {
      mockIDService.isAliasAvailable.mockReturnValue(true);
    });

    it('should give such an item a new name and leave the list its own (#1741)', () => {
      mockIDService.isAliasAvailable.mockImplementation((alias: string) => alias !== 'value_1');

      pasteList();

      expect(component.operationStatusKey).toBe('sectionInsert.duplicateItemNames');
      expect(insertedList().alias).toBe('liste');
      expect(insertedList().id).toBe('drop-list_1');
      expect(insertedList().value[0])
        .toEqual(expect.objectContaining({ text: 'Apfel', id: 'value_new', alias: 'value_3' }));
    });

    /* Read without an id service, such an item has neither id nor name, and asking the registry about them threw.
       With the real registry, which the mock above does not imitate there. */
    it('should read a section whose items carry no id yet', () => {
      const dialog = new SectionInsertDialogComponent(
        { isSelectedSectionEmpty: true },
        mockUnitService as unknown as UnitService,
        new IDService(),
        mockDialogRef as unknown as MatDialogRef<SectionInsertDialogComponent>
      );
      dialog.pasteSectionFromClipboard({
        preventDefault: () => {},
        clipboardData: {
          getData: () => JSON.stringify({
            elements: [{
              type: 'drop-list', id: 'drop-list_1', alias: 'liste', value: [{ text: 'Apfel' }]
            }]
          })
        }
      } as unknown as ClipboardEvent);

      expect(dialog.operationStatusKey).toBe('sectionInsert.readSuccess');
    });

    it('should keep the names of items the unit does not hold', () => {
      mockIDService.isAliasAvailable.mockReturnValue(true);

      pasteList();

      expect(insertedList().value[0]).toEqual(expect.objectContaining({ id: 'value_9', alias: 'value_1' }));
      expect(mockIDService.getAndRegisterNewIDs).not.toHaveBeenCalled();
    });
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

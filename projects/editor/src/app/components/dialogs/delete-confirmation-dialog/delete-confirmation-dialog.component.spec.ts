// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList, SectionLocation } from 'editor/src/app/classes/reference-manager';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { Section } from 'common/models/section';
import {
  DeleteConfirmationDialogComponent
} from 'editor/src/app/components/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'aspect-element-list',
  template: '',
  standalone: false
})
class MockElementListComponent {
  @Input() elements!: UIElement[];
}

@Component({
  selector: 'aspect-reference-list',
  template: '',
  standalone: false
})
class MockReferenceListComponent {
  @Input() refs: ReferenceList[] | undefined;
  @Input() navigable: boolean = false;
  @Output() goToElement = new EventEmitter<UIElement>();
  @Output() goToSection = new EventEmitter<SectionLocation>();
}

describe('DeleteConfirmationDialogComponent', () => {
  let component: DeleteConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogComponent>;
  let dialogRefMock: { close: Mock };
  let unitServiceMock: { revealElement: Mock, revealSection: Mock };
  let dialogServiceMock: { closeAllThen: Mock };

  const createElement = (id: string): UIElement => ({
    type: 'text',
    id,
    alias: id
  } as unknown as UIElement);

  const configureTestBed = async (
    data: { text: string, elementList?: UIElement[], refs?: ReferenceList[] }
  ): Promise<void> => {
    dialogRefMock = { close: vi.fn() };
    unitServiceMock = { revealElement: vi.fn(), revealSection: vi.fn() };
    dialogServiceMock = { closeAllThen: vi.fn((action: () => void) => action()) };
    await TestBed.configureTestingModule({
      declarations: [
        DeleteConfirmationDialogComponent,
        MockElementListComponent,
        MockReferenceListComponent
      ],
      imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);
  const title = (): HTMLElement => fixture.nativeElement.querySelector('[mat-dialog-title]');

  describe('without elements and references', () => {
    beforeEach(async () => {
      await configureTestBed({ text: 'Seite 2 löschen?' });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    /* The question is the title; a general "confirm deletion" above it said nothing the question does not (#1520). */
    it('should put the given question into the title, without a warning symbol', () => {
      expect(title().textContent).toContain('Seite 2 löschen?');
      expect(title().querySelector('.message-icon-warning')).toBeNull();
    });

    it('should render neither the element list nor the references', () => {
      expect(fixture.nativeElement.querySelector('aspect-element-list')).toBeNull();
      expect(fixture.nativeElement.querySelector('aspect-reference-list')).toBeNull();
      expect(fixture.nativeElement.querySelector('.reference-removal-hint')).toBeNull();
    });

    it('should offer cancel first and a plain delete second', () => {
      const [cancelButton, deleteButton] = getActionButtons();

      expect(cancelButton.textContent).toContain('cancel');
      expect(deleteButton.textContent?.trim()).toBe('delete');
      expect(deleteButton.classList).not.toContain('mat-warn');
    });

    it('should close with true on delete and without a result on cancel', () => {
      const [cancelButton, deleteButton] = getActionButtons();

      deleteButton.click();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);

      cancelButton.click();
      expect(dialogRefMock.close).toHaveBeenCalledTimes(2);
      expect(dialogRefMock.close.mock.lastCall?.[0]).toBeFalsy();
    });
  });

  describe('with elements and references', () => {
    const element = createElement('text_1');
    const refs: ReferenceList[] = [{ element, refs: [createElement('button_1')] }];

    beforeEach(async () => {
      await configureTestBed({ text: 'Elemente löschen?', elementList: [element], refs });
    });

    it('should pass the element list to the element list component', () => {
      const elementList = fixture.debugElement.query(By.directive(MockElementListComponent));
      expect(elementList).toBeTruthy();
      expect((elementList.componentInstance as MockElementListComponent).elements).toEqual([element]);
    });

    it('should show the references and say that they go with the deletion', () => {
      const referenceList = fixture.debugElement.query(By.directive(MockReferenceListComponent));
      expect(referenceList).toBeTruthy();
      expect((referenceList.componentInstance as MockReferenceListComponent).refs).toEqual(refs);
      expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-content').textContent)
        .toContain('referenceRemoval.removedWith');
    });

    /* The warning is the symbol in front of the title, not coloured text (#1520). */
    it('should lead the title with a warning symbol', () => {
      expect(title().querySelector('.message-icon-warning')).toBeTruthy();
      expect(title().getAttribute('style')).toBeNull();
    });

    it('should name the removal of the references on the delete button and mark it', () => {
      const [cancelButton, deleteButton] = getActionButtons();

      expect(cancelButton.textContent).toContain('cancel');
      expect(deleteButton.textContent?.trim()).toBe('referenceRemoval.delete');
      expect(deleteButton.classList).toContain('mat-warn');

      deleteButton.click();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    /* What refers is listed with the way there; taking it cancels the deletion (#1520). */
    describe('going to what refers', () => {
      const referenceList = (): MockReferenceListComponent => fixture.debugElement
        .query(By.directive(MockReferenceListComponent)).componentInstance;

      it('should offer the way to each reference', () => {
        expect(referenceList().navigable).toBe(true);
        expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-content').textContent)
          .toContain('referenceRemoval.goToCancels');
      });

      it('should cancel the deletion and take the author to the element', () => {
        referenceList().goToElement.emit(refs[0].refs[0]);

        // Every dialog closes -- this one may stand on the element overview -- and only then the author is taken there.
        expect(dialogServiceMock.closeAllThen).toHaveBeenCalled();
        expect(unitServiceMock.revealElement).toHaveBeenCalledWith(refs[0].refs[0]);
      });

      it('should cancel the deletion and take the author to the section', () => {
        const location = { section: new Section(), pageIndex: 1, sectionIndex: 0 };
        referenceList().goToSection.emit(location);

        expect(dialogServiceMock.closeAllThen).toHaveBeenCalled();
        expect(unitServiceMock.revealSection).toHaveBeenCalledWith(location);
      });
    });
  });
});

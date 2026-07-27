// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
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
}

describe('DeleteConfirmationDialogComponent', () => {
  let component: DeleteConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogComponent>;
  let dialogRefMock: { close: Mock };

  const createElement = (id: string): UIElement => ({
    type: 'text',
    id,
    alias: id
  } as unknown as UIElement);

  const configureTestBed = async (
    data: { text: string, elementList?: UIElement[], refs?: ReferenceList[] }
  ): Promise<void> => {
    dialogRefMock = { close: vi.fn() };
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
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  describe('without elements and references', () => {
    beforeEach(async () => {
      await configureTestBed({ text: 'Wirklich löschen?' });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render the given text', () => {
      expect(fixture.nativeElement.querySelector('.mat-mdc-dialog-content').textContent)
        .toContain('Wirklich löschen?');
    });

    it('should render neither the element list nor the reference warning', () => {
      expect(fixture.nativeElement.querySelector('aspect-element-list')).toBeNull();
      expect(fixture.nativeElement.querySelector('fieldset')).toBeNull();
    });

    it('should close with true on confirm and without a result on cancel', () => {
      const [confirmButton, cancelButton] = getActionButtons();

      confirmButton.click();
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
      await configureTestBed({ text: 'Wirklich löschen?', elementList: [element], refs });
    });

    it('should pass the element list to the element list component', () => {
      const elementList = fixture.debugElement.query(By.directive(MockElementListComponent));
      expect(elementList).toBeTruthy();
      expect((elementList.componentInstance as MockElementListComponent).elements).toEqual([element]);
    });

    it('should show the reference warning with the given references', () => {
      expect(fixture.nativeElement.querySelector('fieldset')).toBeTruthy();
      const referenceList = fixture.debugElement.query(By.directive(MockReferenceListComponent));
      expect(referenceList).toBeTruthy();
      expect((referenceList.componentInstance as MockReferenceListComponent).refs).toEqual(refs);
    });
  });
});

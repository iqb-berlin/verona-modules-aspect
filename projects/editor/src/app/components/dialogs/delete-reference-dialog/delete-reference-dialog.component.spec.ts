import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Mock } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList, SectionLocation } from 'editor/src/app/classes/reference-manager';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { Section } from 'common/models/section';
import {
  DeleteReferenceDialogComponent
} from 'editor/src/app/components/dialogs/delete-reference-dialog/delete-reference-dialog.component';

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

describe('DeleteReferenceDialogComponent', () => {
  let component: DeleteReferenceDialogComponent;
  let fixture: ComponentFixture<DeleteReferenceDialogComponent>;
  let dialogRefMock: { close: Mock };
  let unitServiceMock: { revealElement: Mock, revealSection: Mock };
  let dialogServiceMock: { closeAllThen: Mock };

  const createElement = (id: string): UIElement => ({
    type: 'text',
    id,
    alias: id
  } as unknown as UIElement);

  const refs: ReferenceList[] = [{
    element: createElement('drop-list_1'),
    refs: [createElement('drop-list_2')]
  }];

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    unitServiceMock = { revealElement: vi.fn(), revealSection: vi.fn() };
    dialogServiceMock = { closeAllThen: vi.fn((action: () => void) => action()) };
    await TestBed.configureTestingModule({
      declarations: [
        DeleteReferenceDialogComponent,
        MockReferenceListComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { refs } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteReferenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getActionButtons = (): HTMLButtonElement[] => Array
    .from(fixture.nativeElement.querySelectorAll('.mat-mdc-dialog-actions button') as NodeListOf<HTMLButtonElement>);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected references', () => {
    expect(component.data.refs).toBe(refs);
  });

  it('should pass the references to the reference list component', () => {
    const referenceList = fixture.debugElement.query(By.directive(MockReferenceListComponent));
    expect((referenceList.componentInstance as MockReferenceListComponent).refs).toBe(refs);
  });

  it('should close with false when cancelling', () => {
    getActionButtons()[0].click();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should close with true when confirming the cleanup', () => {
    getActionButtons()[1].click();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  /* What is removed is a text anchor or a cloze child, not always an element: the title asks about the text change,
     with the warning as a symbol in front of it rather than as red text (#1520). */
  it('should ask about the text change behind a warning symbol', () => {
    const title: HTMLElement = fixture.nativeElement.querySelector('[mat-dialog-title]');

    expect(title.textContent).toContain('referenceRemoval.changeTextTitle');
    expect(title.querySelector('.message-icon-warning')).toBeTruthy();
    expect(title.getAttribute('style')).toBeNull();
  });

  /* Going to what refers keeps the text as it was, so the author can resolve the reference first (#1520). */
  it('should keep the text and take the author to an element or section that refers', () => {
    const referenceList: MockReferenceListComponent = fixture.debugElement
      .query(By.directive(MockReferenceListComponent)).componentInstance;
    expect(referenceList.navigable).toBe(true);

    referenceList.goToElement.emit(refs[0].refs[0]);
    expect(dialogServiceMock.closeAllThen).toHaveBeenCalled();
    expect(unitServiceMock.revealElement).toHaveBeenCalledWith(refs[0].refs[0]);

    const location = { section: new Section(), pageIndex: 0, sectionIndex: 2 };
    referenceList.goToSection.emit(location);
    expect(unitServiceMock.revealSection).toHaveBeenCalledWith(location);
  });

  it('should name the removal of the references on the marked confirm button', () => {
    const [cancelButton, confirmButton] = getActionButtons();

    expect(cancelButton.textContent).toContain('cancel');
    expect(confirmButton.textContent?.trim()).toBe('referenceRemoval.changeText');
    expect(confirmButton.classList).toContain('mat-warn');
  });
});

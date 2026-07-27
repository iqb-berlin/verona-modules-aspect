import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
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
}

describe('DeleteReferenceDialogComponent', () => {
  let component: DeleteReferenceDialogComponent;
  let fixture: ComponentFixture<DeleteReferenceDialogComponent>;
  let dialogRefMock: { close: Mock };

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
    await TestBed.configureTestingModule({
      declarations: [
        DeleteReferenceDialogComponent,
        MockReferenceListComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { refs } },
        { provide: MatDialogRef, useValue: dialogRefMock }
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
});

import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { SpyObj, createSpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  CheckboxWizardDialogComponent
} from 'editor/modules/section-templates/components/checkbox-dialog/checkbox-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Output() contentChange = new EventEmitter<string>();
}

describe('CheckboxWizardDialogComponent', () => {
  let component: CheckboxWizardDialogComponent;
  let fixture: ComponentFixture<CheckboxWizardDialogComponent>;
  let mockDialogService: SpyObj<DialogService>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogService = createSpyObj<DialogService>(['showImageResizeDialog']);

    await TestBed.configureTestingModule({
      declarations: [
        CheckboxWizardDialogComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        DragDropModule,
        TextFieldModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove an option from the list', () => {
    component.options = ['a', 'b', 'c'];
    component.removeListItem(component.options, 1);
    expect(component.options).toEqual(['a', 'c']);
  });

  it('should reorder options on drop', () => {
    component.options = ['a', 'b', 'c'];
    component.drop({ previousIndex: 0, currentIndex: 2 } as CdkDragDrop<string[]>);
    expect(component.options).toEqual(['b', 'c', 'a']);
  });

  it('should push non-resizable images directly to the list', fakeAsync(() => {
    vi.spyOn(FileService, 'readFileAsText').mockResolvedValue('data:image/gif;base64,abc');
    vi.spyOn(FileService, 'isResizable').mockReturnValue(false);
    const eventTarget = { files: [new File([''], 'test.gif', { type: 'image/gif' })] } as unknown as HTMLInputElement;

    component.loadImage(component.options, eventTarget);
    flushMicrotasks();

    expect(component.options).toEqual(['data:image/gif;base64,abc']);
    expect(mockDialogService.showImageResizeDialog).not.toHaveBeenCalled();
  }));

  it('should scale resizable images via the resize dialog', fakeAsync(() => {
    vi.spyOn(FileService, 'readFileAsText').mockResolvedValue('data:image/png;base64,abc');
    vi.spyOn(FileService, 'isResizable').mockReturnValue(true);
    vi.spyOn(FileService, 'scaleImage').mockResolvedValue('data:image/png;base64,scaled');
    mockDialogService.showImageResizeDialog.mockReturnValue(of({ maxWidth: 100 }));
    const eventTarget = { files: [new File([''], 'test.png', { type: 'image/png' })] } as unknown as HTMLInputElement;

    component.loadImage(component.options, eventTarget);
    flushMicrotasks();

    expect(mockDialogService.showImageResizeDialog).toHaveBeenCalledWith('data:image/png;base64,abc', {});
    expect(component.options).toEqual(['data:image/png;base64,scaled']);
  }));

  it('should disable the confirm button until an option is present', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.options.push('option 1');
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should close the dialog with the entered values on confirm', () => {
    component.text1 = 'question';
    component.options = ['a', 'b'];
    component.useImages = false;
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ text1: 'question', options: ['a', 'b'], useImages: false });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SpyObj, createSpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  DroplistWizardDialogComponent
} from 'editor/modules/section-templates/components/droplist-dialog/droplist-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Input() showReducedControls: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
}

describe('DroplistWizardDialogComponent', () => {
  let component: DroplistWizardDialogComponent;
  let fixture: ComponentFixture<DroplistWizardDialogComponent>;
  let mockDialogService: SpyObj<DialogService>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    mockDialogService = createSpyObj<DialogService>(['showImageResizeDialog', 'showLabelEditDialog']);

    await TestBed.configureTestingModule({
      declarations: [
        DroplistWizardDialogComponent,
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
        MatListModule,
        MatRadioModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DroplistWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options and no variant', () => {
    expect(component.templateVariant).toBeUndefined();
    expect(component.options.optionWidth).toBe('short');
    expect(component.options.targetLabelAlignment).toBe('column');
    expect(component.options.options).toEqual([]);
    expect(component.options.targetLabels).toEqual([]);
  });

  it('should show the variant choice buttons until a variant is selected', () => {
    const variantButtons = fixture.nativeElement.querySelectorAll('.variant-choice button');
    expect(variantButtons.length).toBe(3);

    (variantButtons[2] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.templateVariant).toBe('sort');
    expect(fixture.nativeElement.querySelector('.variant-choice')).toBeNull();
  });

  it('should reorder options on drop', () => {
    component.options.options = ['a', 'b', 'c'];
    component.drop({ previousIndex: 2, currentIndex: 0 } as CdkDragDrop<string[]>);
    expect(component.options.options).toEqual(['c', 'a', 'b']);
  });

  it('should update an option after label editing', () => {
    component.options.options = ['a', 'b'];
    mockDialogService.showLabelEditDialog.mockReturnValue(of({ text: 'edited' }));

    component.editItem(component.options.options, 1);

    expect(mockDialogService.showLabelEditDialog).toHaveBeenCalledWith({ text: 'b' });
    expect(component.options.options).toEqual(['a', 'edited']);
  });

  it('should keep the option unchanged when label editing is cancelled', () => {
    component.options.options = ['a'];
    mockDialogService.showLabelEditDialog.mockReturnValue(of(undefined as never));

    component.editItem(component.options.options, 0);

    expect(component.options.options).toEqual(['a']);
  });

  it('should remove a list item', () => {
    component.options.targetLabels = ['x', 'y'];
    component.removeListItem(component.options.targetLabels, 0);
    expect(component.options.targetLabels).toEqual(['y']);
  });

  it('should close the dialog with variant and options on confirm', () => {
    component.templateVariant = 'sort';
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ variant: 'sort', options: component.options });
  });
});
